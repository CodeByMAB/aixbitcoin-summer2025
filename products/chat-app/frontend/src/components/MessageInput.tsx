import React from 'react';
import { sendMessage } from '../nostr';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ value, onChange, onSend }) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    try {
      await sendMessage(value);
      onChange('');
      onSend();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-gray-200">
      <div className="flex gap-2 max-w-4xl mx-auto">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-accent"
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