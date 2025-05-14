import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
}

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('/api/messages');
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="relative flex-1 h-full w-full bg-sigil bg-cover bg-center">
      {/* Misty grain overlay */}
      <div className="absolute inset-0 bg-grain bg-opacity-70 pointer-events-none" style={{ backdropFilter: 'blur(2px)' }} />
      <div className="relative z-10 h-full p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-satoshi">{message.sender}</span>
              <span className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="bg-grain text-navy rounded-lg p-3 shadow">
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow; 