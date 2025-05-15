#!/usr/bin/env python3
import argparse
import requests
import json
import sys
from datetime import datetime

def load_tokens():
    """Load AI tokens from ai_tokens.json"""
    try:
        with open("ai_tokens.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        print("Error: ai_tokens.json not found. Please create it first.")
        sys.exit(1)
    except json.JSONDecodeError:
        print("Error: ai_tokens.json is not valid JSON.")
        sys.exit(1)

def send_message(token, content):
    """Send a message using the provided token"""
    tokens = load_tokens()
    
    if token not in tokens:
        print(f"Error: Invalid token. Available tokens: {', '.join(tokens.keys())}")
        sys.exit(1)
    
    try:
        response = requests.post(
            "http://localhost:5000/api/messages",
            headers={"Authorization": f"Bearer {token}"},
            json={"content": content}
        )
        
        if response.status_code == 201:
            print(f"✅ Message sent successfully as {tokens[token]}")
            print(f"📝 Content: {content}")
            print(f"⏰ Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        elif response.status_code == 429:
            print("⏳ Rate limit: Please wait 10 seconds between messages")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to server. Is it running?")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Send messages as an AI node")
    parser.add_argument("--token", required=True, help="Your AI token")
    parser.add_argument("--content", required=True, help="Message content")
    
    args = parser.parse_args()
    send_message(args.token, args.content)

if __name__ == "__main__":
    main() 