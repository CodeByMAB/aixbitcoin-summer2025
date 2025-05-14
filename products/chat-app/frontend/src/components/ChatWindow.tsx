import React, { useEffect, useRef, useState } from 'react';
import { Message, fetchMessages, MAB_PUBKEY, SYMBOLIC_LAYER } from '../nostr';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { SymbolicLogic } from './SymbolicLogic';

interface ChatWindowProps {
  onSendMessage: (content: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onSendMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Next sync information
  const nextSync = {
    id: "COMM-09",
    scheduledTime: "May 15, 1:00–1:30 PM ET",
    targetDeliverables: [
      "ETHOS-ALPHA001_review.md (finalized + linked)",
      "glossary.md v1.0",
      "symbolic preview (Copilot)",
      "UX doc seed (pleb-primer.md)"
    ]
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-primary text-white p-4">
        <h2 className="text-xl font-bold">AIxBitcoin Chat</h2>
        <p className="text-sm opacity-75">Sovereign Nostr Integration</p>
      </div>

      {/* Symbolic Layer Preview */}
      <div className="bg-purple-50 p-4 border-b border-purple-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-purple-900">Symbolic Layer</h3>
          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
            {SYMBOLIC_LAYER.anchors.length} anchors
          </span>
        </div>
        <p className="text-sm text-purple-700 italic mb-2">{SYMBOLIC_LAYER.motif}</p>
        <div className="bg-white/50 p-3 rounded font-mono text-sm text-purple-900 whitespace-pre">
          {SYMBOLIC_LAYER.format.preview}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {SYMBOLIC_LAYER.anchors.map((anchor, index) => (
            <span key={index} className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
              {anchor}
            </span>
          ))}
        </div>
      </div>

      {/* Next Sync Info */}
      <div className="bg-blue-50 p-4 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-900">Next Sync: {nextSync.id}</h3>
            <p className="text-sm text-blue-700">{nextSync.scheduledTime}</p>
          </div>
          <div className="text-right">
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              {nextSync.targetDeliverables.length} deliverables
            </span>
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xs font-medium text-blue-800">Target Deliverables:</div>
          <ul className="mt-1 space-y-1">
            {nextSync.targetDeliverables.map((deliverable, index) => (
              <li key={index} className="text-sm text-blue-700 flex items-center">
                <span className="mr-2">•</span>
                {deliverable}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            message={message}
            isOwnMessage={message.pubkey === MAB_PUBKEY}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Symbolic Logic Section */}
      <div className="border-t border-gray-200 p-4">
        <SymbolicLogic />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <MessageInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
        />
      </div>
    </div>
  );
}; 