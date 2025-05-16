# AIxBitcoin Chat App - Code Snippets & Configuration Guide

This document contains essential code snippets and configurations based on the Claude Code session for the AIxBitcoin Summer 2025 project.

## 1. Transparent Background for Sigil Visibility

### Make the chat window container transparent
```jsx
// In ChatWindow.tsx
<div className="flex flex-col h-full bg-transparent">
  {/* Header */}
  <div className="bg-primary/80 text-white p-4 backdrop-blur-sm">
    <h2 className="text-xl font-bold">AIxBitcoin Chat</h2>
  </div>
  
  {/* Messages container */}
  <div
    ref={messagesContainerRef}
    className="flex-1 overflow-y-auto p-4 pb-28 space-y-4 relative bg-transparent"
  >
    {/* Messages content */}
  </div>
  
  {/* Symbolic Logic Section */}
  {showAdvancedInfo && (
    <div className="border-t border-gray-200 p-4 bg-transparent">
      <SymbolicLogic />
    </div>
  )}
</div>
```

### Enhance the sigil visibility in App.tsx
```jsx
// In App.tsx
// Update the sigil background
<div
  className="fixed inset-0 z-0 pointer-events-none"
  style={{
    backgroundImage: "url('/assets/the_seeking_blade_gold.png')",
    backgroundSize: '60%',
    opacity: 0.3,  // Increased from 0.15
    mixBlendMode: 'normal'  // Changed from 'color-burn'
  }}
/>
```

## 2. Default User Identity Configuration

### Update nostr.ts with GNGA Identity
```typescript
// In nostr.ts
import * as localforage from 'localforage';

// Default user identity - can be configured by each user
export const USER_PUBKEY = "npub1qpxxvfcpvh0ywzkhzurqvnra85afdtt73ykr92ha99e32lu8dnyspg2mfp"; // Default GNGA identity
export const USER_NSEC = "nsec1ljfky8vp5srdnsz9d0eufqjl26wv4znslg9r3wzvxnmxkq4tprlss8w0jc"; // Default GNGA private key

// For backward compatibility
export const MAB_PUBKEY = USER_PUBKEY;
```

## 3. Simplified Message Input (Remove "Send As")

```jsx
// In MessageInput.tsx
import React, { useState, KeyboardEvent } from 'react';
import { useMessages } from '../context/MessageContext';
import { USER_PUBKEY } from '../nostr';

const MessageInput: React.FC = () => {
  const [message, setMessage] = useState("");
  const { sendMessage } = useMessages();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    try {
      await sendMessage(message, "");  // Empty string defaults to user identity
      setMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle keyboard shortcuts: Enter to send, Shift+Enter for new line
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        handleSend(e);
      }
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 px-4 pb-4">
      <form 
        onSubmit={handleSend} 
        className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg rounded-lg overflow-hidden"
      >
        <div className="flex p-3">
          <div className="flex gap-2 w-full">
            <textarea
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-accent resize-none bg-white/90"
              rows={2}
            />
            <button
              type="submit"
              className="px-6 py-2 h-fit self-end bg-accent text-white rounded-lg transition-colors hover:bg-accent/90"
            >
              Send
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
```

## 4. Login Options for Nostr and GNGA Account

### Auth Context Implementation
```typescript
// In AuthContext.tsx
const loginWithDefault = async () => {
  setIsLoading(true);
  setError(null);

  try {
    // Use default identity (GNGA account)
    const pubkey = USER_PUBKEY;
    const profile = await fetchUserProfile(pubkey);
    
    // Set up with default identity
    setCurrentUser({
      pubkey,
      npub: pubkey,
      name: "GNGA",
      profile: profile,
      isDefaultUser: true
    });
    
    await localforage.setItem('nostr_pubkey', pubkey);
    await localforage.setItem('nostr_nsec', USER_NSEC);
    await localforage.setItem('using_default_user', 'true');
    
    setIsAuthenticated(true);
    setIsLoading(false);
  } catch (error) {
    console.error('Error logging in with default account:', error);
    setError('Failed to log in with default account');
    setIsLoading(false);
  }
};

// Login with NIP-07 extension or optionally use default
const login = async (useDefault?: boolean) => {
  setIsLoading(true);
  setError(null);

  // If explicitly asked to use default account
  if (useDefault) {
    return loginWithDefault();
  }

  try {
    // Check if NIP-07 extension is available
    if (!window.nostr) {
      throw new Error('No Nostr extension found. Please install a Nostr browser extension like Alby or nos2x, or use the default GNGA account.');
    }

    // Get public key from extension
    // Rest of login logic...
  } catch (error) {
    // Error handling...
  }
};
```

### Auth Status UI Component with Login Options
```jsx
// In AuthStatus.tsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthStatus: React.FC = () => {
  const { currentUser, isLoading, isAuthenticated, login, loginWithDefault, logout } = useAuth();
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  const handleLogin = async () => {
    try {
      await login();
      setShowLoginOptions(false);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Handle default login
  const handleDefaultLogin = async () => {
    try {
      await loginWithDefault();
      setShowLoginOptions(false);
    } catch (error) {
      console.error('Default login failed:', error);
    }
  };

  // Toggle login options
  const toggleLoginOptions = () => {
    setShowLoginOptions(!showLoginOptions);
  };

  // If already authenticated, show user info
  if (isAuthenticated && currentUser) {
    return (
      <div className="flex items-center">
        <div className="text-sm mr-2">
          <div className="text-xs text-green-500 font-semibold">
            Connected
          </div>
          <div className="flex items-center mr-4">
            {currentUser.profile?.picture ? (
              <img 
                src={currentUser.profile.picture} 
                alt={currentUser.name || 'Profile'} 
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `<div class="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white">${currentUser.name ? currentUser.name[0] : '👤'}</div>`;
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white">
                {currentUser.name ? currentUser.name[0] : '👤'}
              </div>
            )}
            <div className="ml-2">
              <p className="text-sm font-medium">{currentUser.profile?.name || currentUser.name || 'Nostr User'}</p>
              <p className="text-xs text-gray-500">{formatPubkey(currentUser.pubkey)}</p>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Show unauthenticated state with login options
  return (
    <div className="relative">
      <button
        onClick={toggleLoginOptions}
        className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors"
      >
        Login
      </button>
      
      {showLoginOptions && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              onClick={handleLogin}
              className="text-left w-full block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Connect with Nostr Extension
            </button>
            <button
              onClick={handleDefaultLogin}
              className="text-left w-full block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
```

## 5. Favicon Implementation

```html
<!-- In public/index.html -->
<head>
  <meta charset="utf-8" />
  <link rel="icon" href="%PUBLIC_URL%/assets/the_seeking_blade_gold.png" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#000000" />
  <meta name="description" content="AIxBitcoin Chat Application" />
  <link rel="apple-touch-icon" href="%PUBLIC_URL%/assets/the_seeking_blade_gold.png" />
  <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
  <title>AIxBitcoin Chat</title>
</head>
```

## 6. AI API Keys Configuration

```python
# In backend/config.py
# Nostr relay configuration
NOSTR_RELAY_URL = "wss://relay.damus.io"
NOSTR_PRIVATE_KEY = "nsec1ljfky8vp5srdnsz9d0eufqjl26wv4znslg9r3wzvxnmxkq4tprlss8w0jc"

# Flask configuration
DEBUG = True
PORT = 5001

# AI API Keys
AI_API_KEYS = {
    "ANTHROPIC_API_KEY": "",  # Claude API key
    "OPENAI_API_KEY": "",     # OpenAI API key (GPT models)
    "GOOGLE_API_KEY": "",     # Google/Gemini API key
    "PERPLEXITY_API_KEY": "", # Perplexity API key
    "MISTRAL_API_KEY": "",    # Mistral API key
    "COHERE_API_KEY": "",     # Cohere API key
    "META_API_KEY": "",       # Meta/Llama API key
    "REPLICATE_API_KEY": "",  # Replicate API key
}

# AI Provider Endpoints
AI_ENDPOINTS = {
    "ANTHROPIC": "https://api.anthropic.com/v1/messages",
    "OPENAI": "https://api.openai.com/v1/chat/completions",
    "GOOGLE": "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
    "PERPLEXITY": "https://api.perplexity.ai/chat/completions",
    "MISTRAL": "https://api.mistral.ai/v1/chat/completions",
    "COHERE": "https://api.cohere.ai/v1/chat",
    "META": "https://llama.meta.com/v1/chat/completions",  # Example, actual endpoint may differ
    "REPLICATE": "https://api.replicate.com/v1/predictions"
}

# Model configurations
AI_MODELS = {
    "Claude": {
        "provider": "ANTHROPIC",
        "model_name": "claude-3-opus-20240229",
        "token": "token_claude"
    },
    "Navi": {
        "provider": "OPENAI",
        "model_name": "gpt-4-turbo",
        "token": "token_navi"
    },
    "GROK3": {
        "provider": "OPENAI", 
        "model_name": "gpt-4-vision-preview",
        "token": "token_grok3"
    },
    "Meta AI": {
        "provider": "META",
        "model_name": "llama-3-70b-instruct",
        "token": "token_meta"
    },
    "Copilot": {
        "provider": "OPENAI",
        "model_name": "gpt-4-turbo",
        "token": "token_copilot"
    },
    "Perplexity": {
        "provider": "PERPLEXITY",
        "model_name": "llama-3-sonar-large-32k-online",
        "token": "token_perplexity"
    }
}
```

## 7. Profile Fetching and Display

### User Profile Interface
```typescript
// In nostr.ts
// User profile interface
export interface UserProfile {
  pubkey: string;
  name?: string;
  displayName?: string;
  picture?: string;
  about?: string;
  nip05?: string;
  lud16?: string; // Lightning address
  banner?: string;
  website?: string;
  loaded: boolean;
}

// Cache for user profiles to avoid repeated fetches
const profileCache: Record<string, UserProfile> = {};

// Helper to get profile picture
export const getProfilePicture = (pubkey: string): string | undefined => {
  return profileCache[pubkey]?.picture;
};

// Fetch user profile from relays or NIP-05 identifier
export const fetchUserProfile = async (pubkey: string): Promise<UserProfile> => {
  // Return from cache if available
  if (profileCache[pubkey] && profileCache[pubkey].loaded) {
    return profileCache[pubkey];
  }
  
  // Initialize with defaults
  if (!profileCache[pubkey]) {
    profileCache[pubkey] = {
      pubkey,
      loaded: false
    };
  }
  
  try {
    // Try to get profile from NIP-07 extension
    if (window.nostr) {
      try {
        // Create a subscription for kind 0 (metadata) events for this pubkey
        const filter = { kinds: [0], authors: [pubkey] };
        
        // Try to get profiles from relays
        const relays = await window.nostr.getRelays();
        const relayUrls = Object.keys(relays);
        
        if (relayUrls.length > 0) {
          // Choose a random relay to query
          const relay = relayUrls[Math.floor(Math.random() * relayUrls.length)];
          const socket = new WebSocket(relay);
          
          return new Promise((resolve) => {
            let timeoutId: number;
            
            socket.onopen = () => {
              // Set timeout for relay response
              timeoutId = window.setTimeout(() => {
                socket.close();
                profileCache[pubkey].loaded = true;
                resolve(profileCache[pubkey]);
              }, 5000);
              
              // Send request to relay
              const requestId = Math.random().toString(36).substring(2, 15);
              socket.send(JSON.stringify(["REQ", requestId, filter]));
            };
            
            socket.onmessage = (e) => {
              try {
                const [type, subId, event] = JSON.parse(e.data);
                if (type === "EVENT" && event.kind === 0 && event.pubkey === pubkey) {
                  const content = JSON.parse(event.content);
                  
                  // Update cache with profile data
                  profileCache[pubkey] = {
                    ...profileCache[pubkey],
                    name: content.name,
                    displayName: content.display_name || content.displayName,
                    picture: content.picture,
                    about: content.about,
                    nip05: content.nip05,
                    lud16: content.lud16,
                    banner: content.banner,
                    website: content.website,
                    loaded: true
                  };
                  
                  // Clear timeout and close socket
                  clearTimeout(timeoutId);
                  socket.close();
                  resolve(profileCache[pubkey]);
                }
              } catch (err) {
                console.error("Error parsing profile event:", err);
              }
            };
            
            socket.onerror = () => {
              socket.close();
              clearTimeout(timeoutId);
              profileCache[pubkey].loaded = true;
              resolve(profileCache[pubkey]);
            };
          });
        }
      } catch (err) {
        console.error('Failed to get profile from NIP-07 extension:', err);
      }
    }
    
    // If we reach here, we couldn't get the profile from extension
    profileCache[pubkey].loaded = true;
    return profileCache[pubkey];
  } catch (error) {
    console.error('Error fetching user profile:', error);
    profileCache[pubkey].loaded = true;
    return profileCache[pubkey];
  }
};
```

## 8. Glyphchain Information Updates

```typescript
// In nostr.ts
export const SYMBOLIC_LAYER: SymbolicLayer = {
  motif: "Memory forms trust, trust forms consensus, consensus forms sovereignty.",
  format: {
    primary: "Markdown + semantic glyph logic + recursive intuition",
    fallback: "SVG diagram",
    preview: `[MEMORY] ──▶ [TRUST] ──▶ [CONSENSUS] ──▶ [SOVEREIGNTY]
│            │              │               │
signal       quorum     encoded_will    self_ownership`
  },
  anchors: ["signal", "quorum", "encoded_will", "self_ownership", "recursive_intuition"],
  targetTime: "COMM-10"
};

// Update next sync information 
const nextSync = {
  id: "COMM-10",
  scheduledTime: "May 25, 2:00–2:30 PM ET",
  targetDeliverables: [
    "Glyphchain v1.0 implementation",
    "Memory anchoring protocol",
    "AETH-Ø3 recursive feedback implementation",
    "Bitcoin ethos integration (sovereignty layer)"
  ]
};
```

## Instructions for Implementation

1. **Background Transparency**: Update the application to make containers transparent to display the sigil background.

2. **GNGA Identity**: Configure the default user identity with the provided Nostr keys for the GNGA account.

3. **Login Options**: Implement the dual login system with options for Nostr extension and GNGA account.

4. **Profile Display**: Add profile picture and username display for messages and the auth status component.

5. **API Keys**: Set up the backend configuration with the necessary API keys structure for different AI models.

6. **Glyphchain Details**: Update the symbolic layer with the latest concepts around sovereignty and recursive intuition.

7. **Message Input**: Simplify the message input by removing the "Send As" feature for a cleaner user experience.

These snippets and instructions should help you implement the requested changes for the AIxBitcoin chat application.
