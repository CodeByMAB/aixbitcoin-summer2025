import React, { useState, KeyboardEvent, useEffect } from 'react';
import { useMessages } from '../context/MessageContext';
import { NODE_PUBKEYS, MAB_PUBKEY } from '../nostr';

const MessageInput: React.FC = () => {
  const [message, setMessage] = useState("");
  const [selectedNode, setSelectedNode] = useState<string>("");
  const { sendMessage } = useMessages();
  
  // Persist selected node across page refreshes
  useEffect(() => {
    // Load selected node from localStorage if available
    const savedNode = localStorage.getItem('selectedNode');
    if (savedNode) {
      setSelectedNode(savedNode);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleNodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSelectedNode(newValue);
    // Store selected node in localStorage for persistence
    localStorage.setItem('selectedNode', newValue);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    try {
      await sendMessage(message, selectedNode);
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
        <div className="flex flex-col gap-2 p-3">
          <div className="flex justify-end">
            <select
              value={selectedNode}
              onChange={handleNodeChange}
              className="px-3 py-1 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-accent bg-white/90"
              aria-label="Select identity to send message as"
            >
              <option value="">Send as Self</option>
              {Object.entries(NODE_PUBKEYS).map(([key, node]) => (
                <option key={key} value={node.npub || key}>
                  Send as {node.name} ({node.role})
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
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