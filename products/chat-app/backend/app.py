from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json
import os
import hashlib
from config import NOSTR_RELAY_URL, NOSTR_PRIVATE_KEY

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

class NostrEvent:
    """Stub class to simulate a Nostr event"""
    def __init__(self, content, pubkey, created_at):
        self.content = content
        self.pubkey = pubkey
        self.created_at = created_at
        # Generate a deterministic event ID using SHA256
        self.id = hashlib.sha256(f"{content}{pubkey}{created_at}".encode("utf-8")).hexdigest()
        # Generate a stub signature
        self.sig = hashlib.sha256(f"{self.id}{NOSTR_PRIVATE_KEY}".encode("utf-8")).hexdigest()

def sign_message(content, pubkey, timestamp):
    """
    Stub function to simulate Nostr message signing
    In a real implementation, this would use actual Nostr signing
    """
    return NostrEvent(
        content=content,
        pubkey=pubkey,
        created_at=timestamp
    )

def broadcast_to_relay(event):
    """
    Stub function to simulate broadcasting to a Nostr relay
    In a real implementation, this would use WebSocket to connect to relay
    """
    print(f"Broadcasting to {NOSTR_RELAY_URL}:")
    print(f"Event ID: {event.id}")
    print(f"Content: {event.content}")
    print(f"Signature: {event.sig}")
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
        'sig': event.sig
    }
    
    messages.append(message_dict)
    with open(messages_file, 'w') as f:
        json.dump(messages, f, indent=2)

@app.route('/api/messages', methods=['POST'])
def post_message():
    try:
        data = request.get_json()
        required_fields = ['sender', 'content', 'timestamp']
        
        # Validate required fields
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Sign message (stub implementation)
        event = sign_message(
            content=data['content'],
            pubkey=data['sender'],
            timestamp=data['timestamp']
        )
        
        # Broadcast to relay (stub implementation)
        broadcast_to_relay(event)
        
        # Save message locally
        save_message(event)
        
        return jsonify({
            'id': event.id,
            'pubkey': event.pubkey,
            'content': event.content,
            'created_at': event.created_at,
            'sig': event.sig
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

if __name__ == '__main__':
    from config import DEBUG, PORT
    app.run(debug=DEBUG, port=PORT)
