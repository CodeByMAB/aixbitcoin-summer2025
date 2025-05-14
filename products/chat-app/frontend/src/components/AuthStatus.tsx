import React from 'react';
import { useAuth } from '../context/AuthContext';

const AuthStatus: React.FC = () => {
  const { currentUser, isLoading, isAuthenticated, login, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Format pubkey for display
  const formatPubkey = (pubkey: string) => {
    if (!pubkey) return '';
    return pubkey.length > 12 ? `${pubkey.slice(0, 6)}...${pubkey.slice(-6)}` : pubkey;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  // Show authenticated state
  if (isAuthenticated && currentUser) {
    return (
      <div className="flex items-center">
        <div className="mr-3 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          Connected
        </div>
        <div className="flex items-center mr-4">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white">
            {currentUser.name ? currentUser.name[0] : '👤'}
          </div>
          <div className="ml-2">
            <p className="text-sm font-medium">{currentUser.name || 'Nostr User'}</p>
            <p className="text-xs text-gray-500">{formatPubkey(currentUser.pubkey)}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Logout
        </button>
      </div>
    );
  }

  // Show unauthenticated state
  return (
    <button
      onClick={handleLogin}
      className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors"
    >
      Connect with Nostr
    </button>
  );
};

export default AuthStatus;