import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUserProfile, DEFAULT_USER } from '../nostr';

interface Nostr {
  getPublicKey(): Promise<string>;
  signEvent(event: {
    kind: number;
    created_at: number;
    tags: string[][];
    content: string;
  }): Promise<{
    id: string;
    sig: string;
    kind: number;
    created_at: number;
    tags: string[][];
    content: string;
    pubkey: string;
  }>;
}

declare global {
  interface Window {
    nostr?: Nostr;
  }
}

interface UserProfile {
  pubkey: string;
  name?: string;
  displayName?: string;
  picture?: string;
  about?: string;
  nip05?: string;
  lud16?: string;
  banner?: string;
  website?: string;
  loaded: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: {
    pubkey: string;
    npub: string;
    name?: string;
    profile?: UserProfile;
    isDefaultUser?: boolean;
  } | null;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  loginWithDefault: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  currentUser: null,
  isLoading: false,
  error: null,
  login: async () => {},
  loginWithDefault: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AuthContextType['currentUser']>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const savedPubkey = localStorage.getItem('nostr_pubkey');
      const isDefaultUser = localStorage.getItem('using_default_user') === 'true';
      
      if (savedPubkey) {
        try {
          const profile = await fetchUserProfile(savedPubkey);
          setCurrentUser({
            pubkey: savedPubkey,
            npub: savedPubkey,
            name: profile.name,
            profile,
            isDefaultUser
          });
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error restoring session:', error);
          localStorage.removeItem('nostr_pubkey');
          localStorage.removeItem('using_default_user');
        }
      }
    };
    checkAuth();
  }, []);

  const login = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if NIP-07 extension is available
      if (!window.nostr) {
        throw new Error('No Nostr extension found. Please install a Nostr browser extension like Alby or nos2x.');
      }

      // Get public key from extension
      const pubkey = await window.nostr.getPublicKey();
      
      // Fetch user profile
      const profile = await fetchUserProfile(pubkey);
      
      // Set up user
      setCurrentUser({
        pubkey,
        npub: pubkey,
        name: profile.name,
        profile,
        isDefaultUser: false
      });
      
      // Save to localStorage
      localStorage.setItem('nostr_pubkey', pubkey);
      localStorage.removeItem('using_default_user');
      
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithDefault = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use default GNGA identity
      const pubkey = DEFAULT_USER.npub;
      const profile = await fetchUserProfile(pubkey);
      
      // Set up user
      setCurrentUser({
        pubkey,
        npub: pubkey,
        name: "GNGA",
        profile,
        isDefaultUser: true
      });
      
      // Save to localStorage
      localStorage.setItem('nostr_pubkey', pubkey);
      localStorage.setItem('using_default_user', 'true');
      
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Default login failed:', error);
      setError('Failed to log in with default account');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('nostr_pubkey');
    localStorage.removeItem('using_default_user');
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      currentUser, 
      isLoading, 
      error, 
      login, 
      loginWithDefault, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};