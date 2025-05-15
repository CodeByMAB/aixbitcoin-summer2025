import React, { createContext, useContext, useState, useEffect } from 'react';
import { Message, fetchMessages, sendMessage as nostrSendMessage } from '../nostr';
import localforage from 'localforage';

interface MessageContextType {
  messages: Message[];
  sendMessage: (content: string, nodePubkey?: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

// Initialize localforage
localforage.config({
  name: 'aixbitcoin-chat',
  storeName: 'messages',
});

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Track online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load cached messages when offline
  useEffect(() => {
    const loadCachedMessages = async () => {
      try {
        const cachedMessages = await localforage.getItem<Message[]>('cached_messages');
        if (cachedMessages && cachedMessages.length > 0) {
          setMessages(cachedMessages);
        }
      } catch (err) {
        console.error('Error loading cached messages:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCachedMessages();
  }, []);

  // Load initial messages and set up polling
  useEffect(() => {
    let isMounted = true;
    let pollingInterval: NodeJS.Timeout;

    // Only show loading indicator on initial load, not during refresh polls
    let isInitialLoad = true;

    const fetchAndUpdateMessages = async () => {
      if (!isOnline) return;

      try {
        // Only set loading state during initial load
        if (isInitialLoad) {
          setLoading(true);
        }
        
        setError(null);
        const fetchedMessages = await fetchMessages();
        
        if (isMounted) {
          setMessages(fetchedMessages);
          // Cache messages for offline use
          await localforage.setItem('cached_messages', fetchedMessages);
          setLastFetchTime(Date.now());
          isInitialLoad = false; // No longer initial load after first successful fetch
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching messages:', err);
          setError('Failed to fetch messages. Please try again later.');
        }
      } finally {
        if (isMounted && isInitialLoad) {
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchAndUpdateMessages();

    // Poll for new messages
    pollingInterval = setInterval(fetchAndUpdateMessages, 5000);

    return () => {
      isMounted = false;
      clearInterval(pollingInterval);
    };
  }, [isOnline]);

  const sendMessage = async (content: string, nodePubkey?: string) => {
    try {
      setError(null);
      
      // If offline, store message locally with pending flag
      if (!isOnline) {
        const pendingMessage: Message = {
          pubkey: nodePubkey || 'local-pending', // Will be replaced when online
          content,
          created_at: Math.floor(Date.now() / 1000),
          id: `pending-${Date.now()}`,
          type: 'chat',
          tags: [],
        };
        
        // Add to UI immediately
        setMessages(prev => [...prev, pendingMessage]);
        
        // Store pending messages
        const pendingMessages = await localforage.getItem<Message[]>('pending_messages') || [];
        await localforage.setItem('pending_messages', [...pendingMessages, pendingMessage]);
        
        return;
      }
      
      // Send message normally when online
      await nostrSendMessage(content, 'chat', undefined, nodePubkey);
      
      // Refresh messages after sending
      const updatedMessages = await fetchMessages();
      setMessages(updatedMessages);
      await localforage.setItem('cached_messages', updatedMessages);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  // Sync pending messages when coming back online
  useEffect(() => {
    const syncPendingMessages = async () => {
      if (!isOnline) return;
      
      try {
        const pendingMessages = await localforage.getItem<Message[]>('pending_messages') || [];
        
        if (pendingMessages.length === 0) return;
        
        // Process pending messages
        for (const message of pendingMessages) {
          // If the pubkey is a node pubkey, use it, otherwise use default
          const nodePubkey = message.pubkey !== 'local-pending' ? message.pubkey : undefined;
          await nostrSendMessage(message.content, 'chat', undefined, nodePubkey);
        }
        
        // Clear pending messages
        await localforage.setItem('pending_messages', []);
        
        // Refresh messages
        const updatedMessages = await fetchMessages();
        setMessages(updatedMessages);
        await localforage.setItem('cached_messages', updatedMessages);
      } catch (err) {
        console.error('Error syncing pending messages:', err);
      }
    };
    
    if (isOnline) {
      syncPendingMessages();
    }
  }, [isOnline]);

  return (
    <MessageContext.Provider value={{ messages, sendMessage, loading, error }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};