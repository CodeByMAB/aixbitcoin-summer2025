import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthStatus: React.FC = () => {
  const { currentUser, isLoading, isAuthenticated, login, loginWithDefault, logout, error } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = async () => {
    try {
      await login();
      setShowDropdown(false);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleDefaultLogin = async () => {
    try {
      await loginWithDefault();
      setShowDropdown(false);
    } catch (error) {
      console.error('Default login failed:', error);
    }
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

  // Show error state
  if (error) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-red-600">{error}</span>
        <button
          onClick={() => setShowDropdown(true)}
          className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show authenticated state
  if (isAuthenticated && currentUser) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors"
        >
          {currentUser.profile?.picture ? (
            <img 
              src={currentUser.profile.picture} 
              alt={currentUser.name || 'Profile'} 
              className="w-6 h-6 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `<div class="w-6 h-6 rounded-full bg-white flex items-center justify-center text-accent">${currentUser.name ? currentUser.name[0] : '👤'}</div>`;
              }}
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-accent">
              {currentUser.name ? currentUser.name[0] : '👤'}
            </div>
          )}
          <span>{currentUser.name || 'Nostr User'}</span>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <div className="px-4 py-2 text-sm text-gray-700 border-b">
                <p className="font-medium">{currentUser.name || 'Nostr User'}</p>
                <p className="text-xs text-gray-500">{formatPubkey(currentUser.pubkey)}</p>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show unauthenticated state with dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors"
      >
        Connect with Nostr
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              onClick={handleLogin}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Connect with Nostr Extension
            </button>
            <button
              onClick={handleDefaultLogin}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Use GNGA Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthStatus;