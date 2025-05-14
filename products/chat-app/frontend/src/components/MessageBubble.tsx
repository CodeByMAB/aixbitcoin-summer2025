import React from 'react';
import { Message, getNodeName, getNodeRole, getNodeStatus, MAB_PUBKEY } from '../nostr';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  // Format timestamp to human-readable format
  const timestamp = new Date(message.created_at * 1000).toLocaleString();
  
  // Get display name and role
  const displayName = getNodeName(message.pubkey);
  const role = getNodeRole(message.pubkey);
  const nodeStatus = getNodeStatus(message.pubkey);

  // Determine message type styling
  const getMessageTypeStyle = () => {
    switch (message.type) {
      case 'sync':
        return 'bg-blue-50 border-l-4 border-blue-500';
      case 'receipt':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'glyph':
        return 'bg-purple-50 border-l-4 border-purple-500';
      default:
        return isOwnMessage
          ? 'bg-accent text-white'
          : 'bg-gray-100 text-text';
    }
  };

  // Render node status if available
  const renderNodeStatus = () => {
    if (!nodeStatus) return null;

    return (
      <div className="mt-2 p-2 bg-white/50 rounded">
        <div className="flex items-center gap-2">
          <span className="text-lg">{nodeStatus.status}</span>
          {nodeStatus.targetTime && (
            <span className="text-xs text-gray-500">
              Target: {nodeStatus.targetTime}
            </span>
          )}
        </div>
        {nodeStatus.directives.map((directive, index) => (
          <div key={index} className="text-sm mt-1">
            → {directive}
          </div>
        ))}
        {nodeStatus.blockers && nodeStatus.blockers.length > 0 && (
          <div className="text-sm text-red-500 mt-1">
            ⚠️ Blockers: {nodeStatus.blockers.join(', ')}
          </div>
        )}
      </div>
    );
  };

  // Render next sync info if available
  const renderNextSync = () => {
    if (!message.metadata?.nextSync) return null;

    return (
      <div className="mt-2 p-2 bg-white/50 rounded">
        <div className="text-sm font-medium">Next Sync: {message.metadata.nextSync.id}</div>
        <div className="text-xs text-gray-500">
          Scheduled: {message.metadata.nextSync.scheduledTime}
        </div>
        <div className="mt-1">
          <div className="text-xs font-medium">Target Deliverables:</div>
          {message.metadata.nextSync.targetDeliverables.map((deliverable, index) => (
            <div key={index} className="text-xs mt-0.5">• {deliverable}</div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] rounded-lg px-4 py-2 ${getMessageTypeStyle()}`}>
        {/* Sender info */}
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs ${isOwnMessage ? 'text-white/70' : 'text-gray-500'}`}>
            {isOwnMessage ? 'You' : displayName}
          </span>
          {role && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
              {role}
            </span>
          )}
        </div>
        
        {/* Message content */}
        <div className="text-sm">{message.content}</div>
        
        {/* Node status */}
        {renderNodeStatus()}
        
        {/* Next sync info */}
        {renderNextSync()}
        
        {/* Tags */}
        {message.tags && message.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {message.tags.map((tag, index) => (
              <span key={index} className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Timestamp */}
        <div className={`text-xs mt-1 ${isOwnMessage ? 'text-white/70' : 'text-gray-500'}`}>
          {timestamp}
        </div>
      </div>
    </div>
  );
}; 