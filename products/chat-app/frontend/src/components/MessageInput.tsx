import React, { useState, KeyboardEvent } from 'react';
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

  // Handle keyboard shortcuts: Enter to send, Shift+Enter for new line
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter key only (not Shift+Enter)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent adding a new line
      
      if (message.trim()) {
        handleSend(e);
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 px-4 pb-4">
      <form 
        onSubmit={handleSend} 
        className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg rounded-lg overflow-hidden"
      >
        <div className="flex gap-2 p-3">
          <textarea
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-accent resize-none bg-white/90"
            rows={2}
          />
          <button
            type="submit"
            className="px-6 py-2 h-fit self-end bg-accent text-white rounded-lg transition-colors hover:bg-accent/90"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput; 