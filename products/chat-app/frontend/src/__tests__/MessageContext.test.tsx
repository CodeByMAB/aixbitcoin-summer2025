import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MessageProvider, useMessages } from '../context/MessageContext';
import * as nostr from '../nostr';

// Mock nostr functions
jest.mock('../nostr', () => ({
  fetchMessages: jest.fn().mockResolvedValue([
    {
      id: 'msg1',
      pubkey: 'npub1test',
      content: 'Test message 1',
      created_at: 1621234567,
    },
    {
      id: 'msg2',
      pubkey: 'npub1test2',
      content: 'Test message 2',
      created_at: 1621234568,
    },
  ]),
  sendMessage: jest.fn().mockResolvedValue(undefined),
  MAB_PUBKEY: 'npub1test',
  getNodeName: jest.fn().mockReturnValue('Test User'),
}));

// Test component to access message context
const MessageTestComponent = () => {
  const { messages, sendMessage, loading, error } = useMessages();
  
  const handleSendMessage = () => {
    sendMessage('New test message');
  };
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading...' : 'Not loading'}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <div data-testid="message-count">{messages.length}</div>
      <ul data-testid="message-list">
        {messages.map((msg) => (
          <li key={msg.id} data-testid={`message-${msg.id}`}>
            {msg.content}
          </li>
        ))}
      </ul>
      <button onClick={handleSendMessage} data-testid="send-button">Send Message</button>
    </div>
  );
};

describe('MessageContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the online status
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
  });
  
  it('loads and displays messages', async () => {
    render(
      <MessageProvider>
        <MessageTestComponent />
      </MessageProvider>
    );
    
    // Should show loading initially
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading...');
    
    // Wait for messages to load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });
    
    // Should display message count and messages
    expect(screen.getByTestId('message-count')).toHaveTextContent('2');
    expect(screen.getByTestId('message-list').children).toHaveLength(2);
    expect(screen.getByTestId('message-msg1')).toHaveTextContent('Test message 1');
    expect(screen.getByTestId('message-msg2')).toHaveTextContent('Test message 2');
  });
  
  it('sends a message when online', async () => {
    render(
      <MessageProvider>
        <MessageTestComponent />
      </MessageProvider>
    );
    
    // Wait for messages to load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });
    
    // Send a message
    screen.getByTestId('send-button').click();
    
    // Check if nostr.sendMessage was called
    await waitFor(() => {
      expect(nostr.sendMessage).toHaveBeenCalledWith('New test message');
    });
    expect(nostr.fetchMessages).toHaveBeenCalledTimes(2); // Initial load + after send
  });
  
  it('handles offline mode correctly', async () => {
    // Mock being offline
    Object.defineProperty(navigator, 'onLine', { value: false });
    
    // Mock localforage
    const mockLocalForage = {
      config: jest.fn(),
      getItem: jest.fn().mockImplementation((key) => {
        if (key === 'cached_messages') {
          return Promise.resolve([
            {
              id: 'cached1',
              pubkey: 'npub1cached',
              content: 'Cached message',
              created_at: 1621234566,
            },
          ]);
        }
        if (key === 'pending_messages') {
          return Promise.resolve([]);
        }
        return Promise.resolve(null);
      }),
      setItem: jest.fn().mockResolvedValue(undefined),
    };
    
    jest.mock('localforage', () => mockLocalForage);
    
    render(
      <MessageProvider>
        <MessageTestComponent />
      </MessageProvider>
    );
    
    // Wait for cached messages to load (when offline)
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });
    
    // Should not have called fetchMessages when offline
    expect(nostr.fetchMessages).not.toHaveBeenCalled();
  });
});