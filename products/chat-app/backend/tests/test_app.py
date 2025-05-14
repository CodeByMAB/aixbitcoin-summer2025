import os
import json
import pytest
from flask import Flask
from app import app as flask_app

@pytest.fixture
def app():
    """Create and configure a Flask app for testing."""
    flask_app.config.update({
        "TESTING": True,
    })
    yield flask_app

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """A test CLI runner for the app."""
    return app.test_cli_runner()

def test_health_check(client):
    """Test that the health check endpoint returns 200 and correct structure."""
    response = client.get('/api/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'ok'
    assert 'timestamp' in data
    assert data['version'] == '0.1.0'

def test_get_relays(client):
    """Test that the relays endpoint returns the list of relays."""
    response = client.get('/api/relays')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)
    assert len(data) > 0
    assert 'url' in data[0]
    assert 'read' in data[0]
    assert 'write' in data[0]

def test_get_messages_empty(client, monkeypatch):
    """Test that the messages endpoint returns an empty list when no messages exist."""
    # Mock the load_messages function to return an empty list
    def mock_load_messages():
        return []
    
    monkeypatch.setattr('app.load_messages', mock_load_messages)
    
    response = client.get('/api/messages')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)
    assert len(data) == 0

def test_post_message_success(client):
    """Test that posting a valid message returns 201 and the message data."""
    message_data = {
        'content': 'Test message',
        'pubkey': 'npub1z6uxwev8c8wauc9j8vnjq5gj5n2lpnnm6pq57e68d40w59gz4umqzntvyx',
        'created_at': 1621234567
    }
    
    response = client.post(
        '/api/messages',
        data=json.dumps(message_data),
        content_type='application/json'
    )
    
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['content'] == 'Test message'
    assert data['pubkey'] == 'npub1z6uxwev8c8wauc9j8vnjq5gj5n2lpnnm6pq57e68d40w59gz4umqzntvyx'
    assert data['created_at'] == 1621234567
    assert 'id' in data
    assert 'sig' in data

def test_post_message_missing_fields(client):
    """Test that posting a message with missing fields returns 400."""
    message_data = {
        'content': 'Test message',
        # Missing pubkey and created_at
    }
    
    response = client.post(
        '/api/messages',
        data=json.dumps(message_data),
        content_type='application/json'
    )
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data
    assert 'Missing required fields' in data['error']

def test_post_message_invalid_pubkey(client):
    """Test that posting a message with an invalid pubkey format returns 400."""
    message_data = {
        'content': 'Test message',
        'pubkey': 'invalid-pubkey',  # Invalid format
        'created_at': 1621234567
    }
    
    response = client.post(
        '/api/messages',
        data=json.dumps(message_data),
        content_type='application/json'
    )
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data
    assert 'Invalid pubkey format' in data['error']

def test_post_message_with_signature(client):
    """Test that posting a message with a signature stores it correctly."""
    message_data = {
        'content': 'Test message',
        'pubkey': 'npub1z6uxwev8c8wauc9j8vnjq5gj5n2lpnnm6pq57e68d40w59gz4umqzntvyx',
        'created_at': 1621234567,
        'sig': 'valid-signature-123456789'
    }
    
    response = client.post(
        '/api/messages',
        data=json.dumps(message_data),
        content_type='application/json'
    )
    
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['sig'] == 'valid-signature-123456789'