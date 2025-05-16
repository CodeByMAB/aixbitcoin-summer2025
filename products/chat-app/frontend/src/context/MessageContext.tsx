import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { DEFAULT_USER, Message as NostrMessage } from '../nostr';

interface Message extends NostrMessage {}

interface MessageContextType {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextType>({
  messages: [],
  loading: false,
  error: null,
  sendMessage: async () => {},
});

export const useMessages = () => useContext(MessageContext);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, currentUser } = useAuth();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/messages');
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!isAuthenticated || !currentUser?.pubkey) {
      console.error('User not authenticated');
      return;
    }

    const message = {
      content,
      pubkey: currentUser.pubkey,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      type: 'chat',
      metadata: {}
    };

    try {
      const response = await fetch('http://localhost:5001/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const newMessage = await response.json();
      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  };

  return (
    <MessageContext.Provider value={{ messages, loading, error, sendMessage }}>
      {children}
    </MessageContext.Provider>
  );
};