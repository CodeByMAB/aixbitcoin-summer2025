import React from 'react';
import { NODE_COLORS } from '../constants/nodes';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

interface Message {
  pubkey: string;
  content: string;
}

function NodeLegend() {
  return (
    <div className="p-4 bg-white/5 rounded-lg">
      <h3 className="text-sm font-medium mb-2">Node Identities</h3>
      <ul className="space-y-2">
        {Object.entries(NODE_COLORS).map(([node, classes]) => (
          <li key={node} className="flex items-center space-x-2">
            <div className={`rounded-full w-3 h-3 ${classes}`} />
            <span className="text-sm">{node}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChatWindow() {
  const [messages, setMessages] = React.useState<Message[]>([]);

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 p-4">
        <NodeLegend />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}
        </div>
        <MessageInput onSend={(content) => {
          // Handle message sending
          const newMessage: Message = {
            pubkey: "npub1qpxxvfcpvh0ywzkhzurqvnra85afdtt73ykr92ha99e32lu8dnyspg2mfp", // GNGA default
            content
          };
          setMessages([...messages, newMessage]);
        }} />
      </div>
    </div>
  );
}

export default ChatWindow; 