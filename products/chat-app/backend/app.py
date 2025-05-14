from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json
import os
import hashlib
from config import NOSTR_RELAY_URL, NOSTR_PRIVATE_KEY
import re

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

class NostrEvent:
    """Stub class to simulate a Nostr event"""
    def __init__(self, content, pubkey, created_at, sig=None, tags=None, event_type="chat", metadata=None):
        self.content = content
        self.pubkey = pubkey
        self.created_at = created_at
        self.tags = tags or []
        self.type = event_type
        self.metadata = metadata or {}
        
        # Generate a deterministic event ID using SHA256
        self.id = hashlib.sha256(f"{content}{pubkey}{created_at}".encode("utf-8")).hexdigest()
        
        # Use provided signature or generate a stub one
        if sig:
            self.sig = sig
        else:
            # Generate a stub signature
            self.sig = hashlib.sha256(f"{self.id}{NOSTR_PRIVATE_KEY}".encode("utf-8")).hexdigest()

def sign_message(content, pubkey, timestamp, sig=None, tags=None, event_type="chat", metadata=None):
    """
    Stub function to simulate Nostr message signing
    In a real implementation, this would use actual Nostr signing
    """
    return NostrEvent(
        content=content,
        pubkey=pubkey,
        created_at=timestamp,
        sig=sig,
        tags=tags,
        event_type=event_type,
        metadata=metadata
    )

def verify_signature(id, pubkey, sig):
    """
    Stub function to verify a Nostr signature
    In a real implementation, this would use proper cryptographic verification
    """
    # For now, we'll just check if the signature exists and is non-empty
    return sig is not None and len(sig) > 0

def broadcast_to_relay(event):
    """
    Stub function to simulate broadcasting to a Nostr relay
    In a real implementation, this would use WebSocket to connect to relay
    """
    print(f"Broadcasting to {NOSTR_RELAY_URL}:")
    print(f"Event ID: {event.id}")
    print(f"Content: {event.content}")
    print(f"Signature: {event.sig}")
    print(f"Type: {event.type}")
    return True

def get_messages_file():
    """Get the current messages file based on date"""
    today = datetime.now().strftime('%Y-%m-%d')
    return os.path.join(os.path.dirname(__file__), f'messages-{today}.json')

def load_messages():
    """Load messages from the current day's file"""
    messages_file = get_messages_file()
    if os.path.exists(messages_file):
        with open(messages_file, 'r') as f:
            return json.load(f)
    return []

def save_message(event):
    """Save a message to the current day's file"""
    messages_file = get_messages_file()
    messages = load_messages()
    
    # Convert NostrEvent to dict for JSON serialization
    message_dict = {
        'id': event.id,
        'pubkey': event.pubkey,
        'content': event.content,
        'created_at': event.created_at,
        'sig': event.sig,
        'tags': event.tags,
        'type': event.type,
        'metadata': event.metadata
    }
    
    messages.append(message_dict)
    with open(messages_file, 'w') as f:
        json.dump(messages, f, indent=2)

def is_valid_pubkey(pubkey):
    """Check if the pubkey has a valid format"""
    # Basic format check (hex string or npub)
    return (re.match(r'^[0-9a-f]{64}$', pubkey) is not None or 
            re.match(r'^npub[0-9a-zA-Z]{59}$', pubkey) is not None)

@app.route('/api/messages', methods=['POST'])
def post_message():
    try:
        data = request.get_json()
        
        # Check for required fields
        required_fields = ['content', 'pubkey', 'created_at']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields. Need content, pubkey, and created_at'}), 400
        
        # Validate pubkey format
        if not is_valid_pubkey(data['pubkey']):
            return jsonify({'error': 'Invalid pubkey format'}), 400
            
        # Sign message (stub implementation)
        event = sign_message(
            content=data['content'],
            pubkey=data['pubkey'],
            timestamp=data['created_at'],
            sig=data.get('sig'),
            tags=data.get('tags'),
            event_type=data.get('type', 'chat'),
            metadata=data.get('metadata')
        )
        
        # Optional: verify signature if provided
        if 'sig' in data and data['sig']:
            if not verify_signature(event.id, data['pubkey'], data['sig']):
                return jsonify({'error': 'Invalid signature'}), 400
        
        # Broadcast to relay (stub implementation)
        broadcast_to_relay(event)
        
        # Save message locally
        save_message(event)
        
        return jsonify({
            'id': event.id,
            'pubkey': event.pubkey,
            'content': event.content,
            'created_at': event.created_at,
            'sig': event.sig,
            'tags': event.tags,
            'type': event.type,
            'metadata': event.metadata
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/messages', methods=['GET'])
def get_messages():
    try:
        messages = load_messages()
        return jsonify(messages)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/relays', methods=['GET'])
def get_relays():
    """Get a list of supported relays"""
    try:
        relays = [
            {"url": "wss://relay.damus.io", "read": True, "write": True},
            {"url": "wss://relay.snort.social", "read": True, "write": True},
            {"url": "wss://nostr.bitcoiner.social", "read": True, "write": True}
        ]
        return jsonify(relays)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat(),
        'version': '0.1.0'
    })

if __name__ == '__main__':
    from config import DEBUG, PORT
    app.run(debug=DEBUG, port=PORT)