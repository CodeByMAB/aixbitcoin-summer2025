import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Test component to access auth context
const AuthTestComponent = () => {
  const { currentUser, isLoading, isAuthenticated, login, logout, error } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading...' : 'Not loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>
      <div data-testid="error">{error || 'No error'}</div>
      {currentUser && (
        <div data-testid="user-info">
          <span data-testid="user-pubkey">{currentUser.pubkey}</span>
        </div>
      )}
      <button onClick={login} data-testid="login-button">Login</button>
      <button onClick={logout} data-testid="logout-button">Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Reset mock localStorage
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(null);
    jest.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(() => {});
    jest.spyOn(window.localStorage.__proto__, 'removeItem').mockImplementation(() => {});
  });

  it('provides an initial unauthenticated state', async () => {
    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    // Wait for initial check to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('Not authenticated');
    expect(screen.getByTestId('error')).toHaveTextContent('No error');
    expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
  });

  it('can login using Nostr extension', async () => {
    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    });

    // Click login button
    fireEvent.click(screen.getByTestId('login-button'));

    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    });

    expect(screen.getByTestId('user-info')).toBeInTheDocument();
    expect(screen.getByTestId('user-pubkey')).toHaveTextContent('npub1z6uxwev8c8wauc9j8vnjq5gj5n2lpnnm6pq57e68d40w59gz4umqzntvyx');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('nostr_pubkey', 'npub1z6uxwev8c8wauc9j8vnjq5gj5n2lpnnm6pq57e68d40w59gz4umqzntvyx');
  });

  it('can logout', async () => {
    // Mock user already logged in
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('npub1z6uxwev8c8wauc9j8vnjq5gj5n2lpnnm6pq57e68d40w59gz4umqzntvyx');

    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    // Wait for initial load to complete with authenticated state
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    });

    // Click logout button
    fireEvent.click(screen.getByTestId('logout-button'));

    // Wait for logout to complete
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not authenticated');
    });

    expect(screen.queryByTestId('user-info')).not.toBeInTheDocument();
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('nostr_pubkey');
  });

  it('restores authentication from storage', async () => {
    // Mock user already logged in
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('npub1z6uxwev8c8wauc9j8vnjq5gj5n2lpnnm6pq57e68d40w59gz4umqzntvyx');

    render(
      <AuthProvider>
        <AuthTestComponent />
      </AuthProvider>
    );

    // Should be authenticated from localStorage without clicking login
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
    });

    expect(screen.getByTestId('user-info')).toBeInTheDocument();
    expect(screen.getByTestId('user-pubkey')).toHaveTextContent('npub1z6uxwev8c8wauc9j8vnjq5gj5n2lpnnm6pq57e68d40w59gz4umqzntvyx');
  });
});