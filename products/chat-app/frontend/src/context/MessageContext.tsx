import React, { createContext, useContext, useState, useEffect } from 'react';
import { Message, fetchMessages, sendMessage as nostrSendMessage } from '../nostr';

interface MessageContextType {
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      const initialMessages = await fetchMessages();
      setMessages(initialMessages);
    };
    loadMessages();
  }, []);

  // Poll for new messages
  useEffect(() => {
    const interval = setInterval(async () => {
      const newMessages = await fetchMessages();
      setMessages(newMessages);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const sendMessage = async (content: string) => {
    try {
      await nostrSendMessage(content);
      // Refresh messages after sending
      const updatedMessages = await fetchMessages();
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <MessageContext.Provider value={{ messages, sendMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
}; 