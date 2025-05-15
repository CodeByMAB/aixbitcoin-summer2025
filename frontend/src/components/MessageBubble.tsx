import React from 'react';
import { NODE_COLORS, resolveNodeNameFromPubkey } from "../constants/nodes";

interface Message {
  pubkey: string;
  content: string;
}

function MessageBubble({ message }: { message: Message }) {
  const nodeName = resolveNodeNameFromPubkey(message.pubkey);
  const colorClass = NODE_COLORS[nodeName] || "bg-neutral-600 text-white";

  return (
    <div className={`rounded-xl px-4 py-2 max-w-xs shadow ${colorClass}`}>
      <span className="text-xs opacity-70">{nodeName}</span>
      <p className="whitespace-pre-wrap">{message.content}</p>
    </div>
  );
}

export default MessageBubble; 