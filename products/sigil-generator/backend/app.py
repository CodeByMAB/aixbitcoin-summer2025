# products/sigil-generator/backend/app.py

from flask import Flask, request, jsonify
import os
import json
import uuid
import base64
from io import BytesIO
from PIL import Image
import requests
from flask_cors import CORS
import logging
from dotenv import load_dotenv
import hmac
import hashlib
import time

# For LLaMA3 local inference
from llama_cpp import Llama

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
BTCPAY_SERVER_URL = os.environ.get('BTCPAY_SERVER_URL')
BTCPAY_API_KEY = os.environ.get('BTCPAY_API_KEY')
BTCPAY_STORE_ID = os.environ.get('BTCPAY_STORE_ID')
BTCPAY_WEBHOOK_SECRET = os.environ.get('BTCPAY_WEBHOOK_SECRET')
LLAMA_MODEL_PATH = os.environ.get('LLAMA_MODEL_PATH', 'models/llama-3-8b-instruct.Q4_K_M.gguf')
MIN_SATS_PER_SIGIL = 1000  # Minimum sats required for a sigil

# Initialize LLaMA model
try:
    llm = Llama(
        model_path=LLAMA_MODEL_PATH,
        n_ctx=2048,
        n_gpu_layers=-1  # Use all available GPU layers
    )
    logger.info("LLaMA model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load LLaMA model: {e}")
    llm = None

# In-memory database for sigils and invoices
sigil_db = {}
invoice_db = {}

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    if llm is None:
        return jsonify({"status": "error", "message": "LLaMA model not loaded"}), 500
    
    return jsonify({"status": "ok", "message": "Sigil generator service is running"}), 200

@app.route('/api/sigil/create', methods=['POST'])
def create_sigil_request():
    """Create a sigil request and generate a payment invoice"""
    data = request.json
    
    if not data or 'prompt' not in data:
        return jsonify({"status": "error", "message": "Prompt is required"}), 400
    
    prompt = data.get('prompt')
    user_id = data.get('nostr_npub', 'anonymous')
    sats_amount = data.get('sats_amount', MIN_SATS_PER_SIGIL)
    
    if sats_amount < MIN_SATS_PER_SIGIL:
        return jsonify({
            "status": "error", 
            "message": f"Minimum payment is {MIN_SATS_PER_SIGIL} sats"
        }), 400
    
    # Create BTCPay invoice
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"token {BTCPAY_API_KEY}"
        }
        
        invoice_data = {
            "amount": sats_amount,
            "currency": "SATS",
            "metadata": {
                "orderId": str(uuid.uuid4()),
                "itemDesc": f"AI Sigil: {prompt[:30]}...",
                "buyerName": user_id
            }
        }
        
        response = requests.post(
            f"{BTCPAY_SERVER_URL}/api/v1/stores/{BTCPAY_STORE_ID}/invoices",
            headers=headers,
            json=invoice_data
        )
        
        if response.status_code != 200:
            logger.error(f"BTCPay error: {response.text}")
            return jsonify({"status": "error", "message": "Failed to create invoice"}), 500
        
        invoice = response.json()
        invoice_id = invoice['id']
        payment_link = invoice['checkoutLink']
        
        # Store request details in memory
        sigil_request_id = str(uuid.uuid4())
        sigil_db[sigil_request_id] = {
            "id": sigil_request_id,
            "prompt": prompt,
            "user_id": user_id,
            "sats_amount": sats_amount,
            "status": "awaiting_payment",
            "created_at": int(time.time()),
            "sigil_data": None
        }
        
        invoice_db[invoice_id] = {
            "invoice_id": invoice_id,
            "sigil_request_id": sigil_request_id,
            "status": "new",
            "created_at": int(time.time())
        }
        
        return jsonify({
            "status": "success",
            "sigil_request_id": sigil_request_id,
            "invoice_id": invoice_id,
            "payment_link": payment_link,
            "sats_amount": sats_amount
        }), 200
        
    except Exception as e:
        logger.error(f"Error creating invoice: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/btcpay/webhook', methods=['POST'])
def btcpay_webhook():
    """Handle BTCPay webhook for invoice status updates"""
    if not request.data:
        return jsonify({"status": "error", "message": "No data received"}), 400
    
    # Verify the webhook signature
    signature = request.headers.get('BTCPay-Sig')
    if not signature:
        logger.warning("Webhook received without signature")
        return jsonify({"status": "error", "message": "No signature provided"}), 401
    
    # Compute expected signature
    computed_sig = hmac.new(
        BTCPAY_WEBHOOK_SECRET.encode('utf-8'),
        request.data,
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(signature, f"sha256={computed_sig}"):
        logger.warning("Invalid webhook signature")
        return jsonify({"status": "error", "message": "Invalid signature"}), 401
    
    # Process the webhook data
    try:
        webhook_data = json.loads(request.data)
        invoice_id = webhook_data.get('invoiceId')
        event_type = webhook_data.get('type')
        
        if not invoice_id or not event_type:
            return jsonify({"status": "error", "message": "Missing required data"}), 400
        
        if invoice_id not in invoice_db:
            logger.warning(f"Received webhook for unknown invoice: {invoice_id}")
            return jsonify({"status": "error", "message": "Unknown invoice"}), 404
        
        invoice_record = invoice_db[invoice_id]
        sigil_request_id = invoice_record['sigil_request_id']
        
        # Update invoice status
        invoice_record['status'] = event_type
        
        # If payment confirmed, generate the sigil
        if event_type == 'InvoiceSettled':
            sigil_db[sigil_request_id]['status'] = 'paid'
            
            # Trigger async sigil generation (in a real app, use a task queue)
            generate_sigil(sigil_request_id)
            
        return jsonify({"status": "success"}), 200
        
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

def generate_sigil(sigil_request_id):
    """Generate a sigil using the LLaMA model"""
    if sigil_request_id not in sigil_db:
        logger.error(f"Sigil request not found: {sigil_request_id}")
        return
    
    sigil_request = sigil_db[sigil_request_id]
    prompt = sigil_request['prompt']
    
    try:
        # Update status
        sigil_db[sigil_request_id]['status'] = 'generating'
        
        # Prepare the prompt for LLaMA
        llm_prompt = f"""
        You are SIGIL-CRAFT-1, an AI sigil generator. Create a detailed text description of a 
        magical sigil based on the following intention. The sigil should be abstract, 
        geometric, and visually striking. It should contain meaningful symbols and patterns 
        that relate to the intention.
        
        Intention: {prompt}
        
        Provide a detailed description of the sigil in the following format:
        
        BACKGROUND: [describe the background]
        PRIMARY SYMBOL: [describe the main symbol]
        SECONDARY ELEMENTS: [describe supporting elements]
        LINEWORK: [describe the line style]
        COLOR PALETTE: [list 3-5 colors with hex codes]
        MEANING: [explain the symbolic meaning]
        """
        
        # Generate sigil description using LLaMA
        if llm is not None:
            output = llm(
                llm_prompt,
                max_tokens=1024,
                temperature=0.7,
                top_p=0.9,
                stop=["USER:"],
                echo=False
            )
            sigil_description = output['choices'][0]['text'].strip()
        else:
            # Fallback if LLaMA isn't loaded
            sigil_description = "Error: LLaMA model not available."
        
        # In a full implementation, you would use another model to generate 
        # the actual image based on this description.
        # For now, we'll just store the description
        
        sigil_db[sigil_request_id]['sigil_data'] = {
            "description": sigil_description,
            "image_url": None  # Would be populated with the actual image URL
        }
        sigil_db[sigil_request_id]['status'] = 'completed'
        
        logger.info(f"Sigil generated for request {sigil_request_id}")
        
        # In a real app, you would notify the user that their sigil is ready
        
    except Exception as e:
        logger.error(f"Error generating sigil: {e}")
        sigil_db[sigil_request_id]['status'] = 'failed'
        sigil_db[sigil_request_id]['error'] = str(e)

@app.route('/api/sigil/status/<sigil_request_id>', methods=['GET'])
def get_sigil_status(sigil_request_id):
    """Get the status of a sigil request"""
    if sigil_request_id not in sigil_db:
        return jsonify({"status": "error", "message": "Sigil request not found"}), 404
    
    sigil_request = sigil_db[sigil_request_id]
    
    # Don't send the full sigil data if it's not completed yet
    response_data = {
        "id": sigil_request['id'],
        "status": sigil_request['status'],
        "created_at": sigil_request['created_at']
    }
    
    # Include sigil data if completed
    if sigil_request['status'] == 'completed' and sigil_request['sigil_data']:
        response_data['sigil_data'] = sigil_request['sigil_data']
    
    return jsonify(response_data), 200

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    """Get metrics about the sigil generator usage"""
    # Basic metrics
    total_sigils = len(sigil_db)
    completed_sigils = sum(1 for s in sigil_db.values() if s['status'] == 'completed')
    total_sats_earned = sum(s['sats_amount'] for s in sigil_db.values() if s['status'] in ['paid', 'completed'])
    
    return jsonify({
        "total_sigils_requested": total_sigils,
        "completed_sigils": completed_sigils,
        "total_sats_earned": total_sats_earned,
        "min_sats_per_sigil": MIN_SATS_PER_SIGIL
    }), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

# products/sigil-generator/backend/requirements.txt
flask==2.0.1
flask-cors==3.0.10
pillow==9.0.0
requests==2.27.1
python-dotenv==0.19.2
llama-cpp-python==0.2.11