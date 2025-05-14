import React, { useState } from 'react';
import axios from 'axios';

const MessageInput: React.FC = () => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const sender = localStorage.getItem('npub') || 'anon';
    try {
      await axios.post('/api/messages', {
        content: message,
        sender,
        timestamp: new Date().toISOString()
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-satoshi"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-satoshi text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-satoshi"
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput; 