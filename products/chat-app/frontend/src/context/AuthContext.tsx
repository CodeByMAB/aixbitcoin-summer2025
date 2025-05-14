import React, { createContext, useContext, useState, useEffect } from 'react';
import { nip07 } from 'nostr-tools';
import localforage from 'localforage';

// Define the shape of the auth context
interface AuthContextType {
  currentUser: {
    pubkey: string;
    npub: string;
    name?: string;
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
}

// NIP-07 extension types
declare global {
  interface Window {
    nostr?: {
      getPublicKey: () => Promise<string>;
      signEvent: (event: any) => Promise<any>;
      getRelays: () => Promise<Record<string, { read: boolean; write: boolean }>>;
    };
  }
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthContextType['currentUser']>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check for saved pubkey on initialization
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedPubkey = await localforage.getItem<string>('nostr_pubkey');
        
        if (savedPubkey) {
          setCurrentUser({
            pubkey: savedPubkey,
            npub: savedPubkey, // In a real app, convert to npub format
          });
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login with NIP-07 extension
  const login = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if NIP-07 extension is available
      if (!window.nostr) {
        throw new Error('No Nostr provider found. Please install a Nostr browser extension like Alby or nos2x.');
      }

      // Get public key from extension
      const pubkey = await window.nostr.getPublicKey();
      
      if (!pubkey) {
        throw new Error('Failed to retrieve your public key from the Nostr extension.');
      }

      // Save user info
      setCurrentUser({
        pubkey,
        npub: pubkey, // In a real app, you'd convert to npub format
      });
      
      // Save to localforage for persistence
      await localforage.setItem('nostr_pubkey', pubkey);
      
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Clear saved auth data
      await localforage.removeItem('nostr_pubkey');
      
      // Reset state
      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        isAuthenticated,
        error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};