import React, { useRef, useEffect, useState } from 'react';
import { MAB_PUBKEY, SYMBOLIC_LAYER } from '../nostr';
import { MessageBubble } from './MessageBubble';
import { SymbolicLogic } from './SymbolicLogic';
import { useMessages } from '../context/MessageContext';
import { useAuth } from '../context/AuthContext';

export const ChatWindow: React.FC = () => {
  const { messages, loading, error } = useMessages();
  const { isAuthenticated } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showAdvancedInfo, setShowAdvancedInfo] = useState<boolean>(false);
  
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

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Hide the offline banner
      const banner = document.getElementById('offline-status');
      if (banner) {
        banner.style.transform = 'translateY(100%)';
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      // Show the offline banner
      const banner = document.getElementById('offline-status');
      if (banner) {
        banner.style.transform = 'translateY(0)';
      }
    };

    // Set initial state
    setIsOnline(navigator.onLine);
    
    // Update the banner
    const banner = document.getElementById('offline-status');
    if (banner) {
      banner.style.transform = navigator.onLine ? 'translateY(100%)' : 'translateY(0)';
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle scroll events to detect if user has manually scrolled up
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      if (!container) return;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      // If user scrolls up, disable auto-scroll
      if (!isAtBottom && autoScroll) {
        setAutoScroll(false);
      }
      
      // If user scrolls to bottom, re-enable auto-scroll
      if (isAtBottom && !autoScroll) {
        setAutoScroll(true);
        setUnreadCount(0);
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [autoScroll]);

  const scrollToBottom = () => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Increment unread count if not auto-scrolling
      setUnreadCount(prevCount => prevCount + 1);
    }
  };

  // Handle manual scroll to bottom when button is clicked
  const handleScrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setAutoScroll(true);
    setUnreadCount(0);
  };

  // Scroll to bottom when messages change (if auto-scroll is enabled)
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Add toggle function for advanced info
  const toggleAdvancedInfo = () => {
    setShowAdvancedInfo(!showAdvancedInfo);
  };

  return (
    <div className="flex flex-col h-full bg-white/70 backdrop-blur-sm">
      {/* Header */}
      <div className="bg-primary/80 text-white p-4 backdrop-blur-sm">
        <h2 className="text-xl font-bold">AIxBitcoin Chat</h2>
        <div className="flex justify-between items-center">
          <p className="text-sm opacity-75">Sovereign Nostr Integration</p>
          <div className="flex items-center gap-3">
            <div className={`px-2 py-1 rounded-full text-xs ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </div>
            <button 
              onClick={toggleAdvancedInfo}
              className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
            >
              {showAdvancedInfo ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
        </div>
      </div>

      {/* Auth prompt (only shown if not authenticated) */}
      {!isAuthenticated && (
        <div className="bg-blue-50 p-4 text-center">
          <p className="text-blue-800">Connect with your Nostr extension to start chatting with your sovereign identity</p>
        </div>
      )}

      {/* Advanced info section - only visible when toggled on */}
      {showAdvancedInfo && (
        <>
          {/* Symbolic Layer Preview */}
          <div className="bg-purple-50/80 p-4 border-b border-purple-100 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-purple-900">Symbolic Layer</h3>
              <span className="text-xs px-2 py-1 bg-purple-100/80 text-purple-800 rounded-full">
                {SYMBOLIC_LAYER.anchors.length} anchors
              </span>
            </div>
            <p className="text-sm text-purple-700 italic mb-2">{SYMBOLIC_LAYER.motif}</p>
            <div className="bg-white/50 p-3 rounded font-mono text-sm text-purple-900 whitespace-pre">
              {SYMBOLIC_LAYER.format.preview}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {SYMBOLIC_LAYER.anchors.map((anchor, index) => (
                <span key={index} className="text-xs px-2 py-1 bg-purple-100/80 text-purple-800 rounded-full">
                  {anchor}
                </span>
              ))}
            </div>
          </div>

          {/* Next Sync Info */}
          <div className="bg-blue-50/80 p-4 border-b border-blue-100 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">Next Sync: {nextSync.id}</h3>
                <p className="text-sm text-blue-700">{nextSync.scheduledTime}</p>
              </div>
              <div className="text-right">
                <span className="text-xs px-2 py-1 bg-blue-100/80 text-blue-800 rounded-full">
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
        </>
      )}

      {/* Loading state */}
      {loading && (
        <div className="p-4 text-center text-gray-500">
          <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2"></div>
          Loading messages...
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-center">
          {error}
        </div>
      )}

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 pb-28 space-y-4 relative bg-white/50 backdrop-blur-sm"
      >
        {/* Show empty state message only on initial load, not during refresh */}
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            {!loading && "No messages yet. Start the conversation!"}
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={message.id || index}
              message={message}
              isOwnMessage={message.pubkey === MAB_PUBKEY}
            />
          ))
        )}
        <div ref={messagesEndRef} />
        
        {/* Scroll to bottom button (only visible when not auto-scrolling) */}
        {!autoScroll && (
          <button 
            onClick={handleScrollToBottom}
            className="fixed bottom-28 right-6 bg-accent text-white rounded-full p-3 shadow-lg z-20 flex items-center"
            aria-label="Scroll to bottom"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L10 15.586l5.293-5.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {unreadCount > 0 && (
              <span className="ml-1 text-xs font-bold">{unreadCount}</span>
            )}
          </button>
        )}
      </div>

      {/* Symbolic Logic Section - only visible when toggled on */}
      {showAdvancedInfo && (
        <div className="border-t border-gray-200 p-4 bg-white/70 backdrop-blur-sm">
          <SymbolicLogic />
        </div>
      )}
    </div>
  );
};