import React, { useState } from 'react';
import { useMessages } from '../context/MessageContext';

const MessageInput: React.FC = () => {
  const [message, setMessage] = useState("");
  const { sendMessage } = useMessages();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    try {
      await sendMessage(message);
      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <form onSubmit={handleSend} className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-gray-200">
      <div className="flex gap-2 max-w-4xl mx-auto">
        <textarea
          value={message}
          onChange={handleChange}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-accent resize-none"
          rows={3}
        />
        <button
          type="submit"
          className="px-6 py-2 bg-accent text-white rounded-lg transition-colors hover:bg-accent/90"
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default MessageInput; 