import React from 'react';
import { Message, getNodeName, getNodeRole } from '../nostr';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  const isPending = message.pubkey === 'local-pending';
  
  // Get sender information
  let name = isPending ? 'You' : getNodeName(message.pubkey);
  let role = getNodeRole(message.pubkey);
  
  // Determine CSS classes based on sender
  const bubbleClasses = isOwnMessage || isPending
    ? 'bg-primary/90 text-white self-end rounded-tl-2xl rounded-tr-sm rounded-bl-2xl max-w-[80%] backdrop-blur-sm'
    : 'bg-white/80 border border-gray-200 text-gray-900 self-start rounded-tr-2xl rounded-tl-sm rounded-br-2xl max-w-[80%] backdrop-blur-sm';
  
  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col ${isOwnMessage || isPending ? 'items-end' : 'items-start'}`}>
      {/* Sender info */}
      <div className={`text-xs ${isOwnMessage || isPending ? 'text-right' : 'text-left'} mb-1`}>
        <span className="font-semibold">{name}</span>
        {role && <span className="ml-2 text-gray-500">{role}</span>}
      </div>
      
      {/* Message bubble */}
      <div className={`p-3 shadow-sm ${bubbleClasses}`}>
        {isPending ? (
          <div className="relative">
            <p>{message.content}</p>
            <div className="absolute -bottom-5 right-0 flex items-center text-xs text-yellow-600">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pending...
            </div>
          </div>
        ) : (
          <p>{message.content}</p>
        )}
      </div>
      
      {/* Timestamp */}
      <div className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
        {formatTime(message.created_at)}
        
        {/* Signature badge */}
        {message.sig && (
          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            signed
          </span>
        )}
      </div>
    </div>
  );
};