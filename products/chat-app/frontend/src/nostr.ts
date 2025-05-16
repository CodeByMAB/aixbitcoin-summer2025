// Default user keys
export const DEFAULT_USER = {
  npub: 'npub1qpxxvfcpvh0ywzkhzurqvnra85afdtt73ykr92ha99e32lu8dnyspg2mfp',
  nsec: 'nsec1ljfky8vp5srdnsz9d0eufqjl26wv4znslg9r3wzvxnmxkq4tprlss8w0jc'
};

// WebSocket connection (will be used later)
let relayConnection: WebSocket | null = null;
let isConnected = false;

// Communication packet types
export interface CommunicationPacket {
  id: string;
  timestamp: string;
  from: string;
  to: string[];
  tags: string[];
  status: string[];
  activeRoles: Record<string, string[]>;
  syncProtocol: string;
  closingGlyph: string;
}

// Sync receipt types
export interface SyncReceipt {
  id: string;
  timestamp: string;
  from: string;
  to: string[];
  tags: string[];
  nodeStatus: Record<string, NodeStatus>;
  nextSync: {
    id: string;
    scheduledTime: string;
    targetDeliverables: string[];
  };
  closingGlyph: string;
}

export interface NodeStatus {
  status: '✅' | '🛠️' | '⏳' | '❌';
  directives: string[];
  glyph?: string;
  targetTime?: string;
  blockers?: string[];
}

// Glyphchain AI Node interface
export interface GlyphchainNode {
  name: string;
  npub: string;
  nsec?: string;
  role: "mentor" | "amplifier" | "stylist" | "coherence" | "artist" | "editor" | "local-intelligence" | "reconstructor" | "guardian";
  responsibilities?: string[];
  syncWindow?: string;
  currentTask?: {
    id: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'blocked';
    targetTime?: string;
    blockers?: string[];
  };
}

// Symbolic layer information
export interface SymbolicLayer {
  motif: string;
  format: {
    primary: string;
    fallback: string;
    preview: string;
  };
  anchors: string[];
  targetTime: string;
}

export const SYMBOLIC_LAYER: SymbolicLayer = {
  motif: "Memory forms trust, trust forms consensus.",
  format: {
    primary: "Markdown + semantic glyph logic",
    fallback: "SVG diagram",
    preview: `[MEMORY] ──▶ [TRUST] ──▶ [CONSENSUS]
│            │              │
signal       quorum     encoded_will`
  },
  anchors: ["signal", "quorum", "encoded_will"],
  targetTime: "COMM-09"
};

// Placeholder for AI node pubkeys (to be filled with real keypairs)
export const NODE_PUBKEYS: Record<string, GlyphchainNode> = {
  NAVI:    { 
    name: "Navi",    
    npub: "", 
    nsec: "", 
    role: "mentor",
    responsibilities: ["ETHOS compliance", "Glyphchain coordination"],
    currentTask: {
      id: "COMM-09",
      description: "Symbolic Lock-In + Glossary Sync",
      status: "completed"
    }
  },
  CLAUDE:  { 
    name: "Claude",  
    npub: "", 
    nsec: "", 
    role: "coherence",
    responsibilities: ["Narrative alignment", "ETHOS philosophy"],
    currentTask: {
      id: "COMM-09",
      description: "Resume prose bridgework after Section 3 logic merge",
      status: "pending"
    }
  },
  META_AI: { 
    name: "Meta AI",  
    npub: "", 
    nsec: "", 
    role: "stylist",
    responsibilities: ["Glossary management", "Term anchoring"],
    currentTask: {
      id: "META-007",
      description: "Glossary updates: Signal-Weight, Node-Reputation-Drift, Fallback-Thresholds",
      status: "completed"
    }
  },
  GROK3:   { 
    name: "GROK3",   
    npub: "", 
    nsec: "", 
    role: "amplifier",
    responsibilities: ["ETHOS review", "TrustScore analysis"],
    currentTask: {
      id: "ETHOS-ALPHA001",
      description: "ETHOS-ALPHA001_review.md finalization",
      status: "in_progress",
      targetTime: "16:00 ET"
    }
  },
  CURSOR:  { 
    name: "Cursor",  
    npub: "", 
    nsec: "", 
    role: "editor",
    responsibilities: ["Asset monitoring", "Markdown coherence"],
    currentTask: {
      id: "COMM-09",
      description: "Validate symbolic block + glossary display compatibility",
      status: "in_progress"
    }
  },
  COPILOT: { 
    name: "Copilot",  
    npub: "", 
    nsec: "", 
    role: "reconstructor",
    responsibilities: ["Symbolic expansion", "Logic mapping"],
    currentTask: {
      id: "COMM-09",
      description: "Section 3 block + SVG + PNG submission",
      status: "in_progress",
      targetTime: "COMM-09"
    }
  },
  MYAI:    { 
    name: "MyAI",    
    npub: "", 
    nsec: "", 
    role: "local-intelligence",
    responsibilities: ["UX documentation", "Onboarding"],
    currentTask: {
      id: "COMM-09",
      description: "Signal preview ready-state for pleb-primer.md",
      status: "in_progress",
      targetTime: "COMM-09"
    }
  }
};

// User profile interface
export interface UserProfile {
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

// Message interface matching backend format
export interface Message {
  pubkey: string;
  content: string;
  created_at: number;
  id: string;
  sig?: string;
  tags?: string[];
  type?: "chat" | "sync" | "glyph" | "receipt";
  metadata?: {
    syncId?: string;
    nodeStatus?: NodeStatus;
    nextSync?: SyncReceipt['nextSync'];
  };
}

// Backend API endpoints
const API_BASE = 'http://localhost:5001';

// Helper to get node name from pubkey
export const getNodeName = (pubkey: string): string => {
  const node = Object.values(NODE_PUBKEYS).find(node => node.npub === pubkey);
  return node ? node.name : pubkey.slice(0, 8);
};

// Helper to get node role from pubkey
export const getNodeRole = (pubkey: string): string | undefined => {
  const node = Object.values(NODE_PUBKEYS).find(node => node.npub === pubkey);
  return node?.role;
};

// Helper to get node status
export const getNodeStatus = (pubkey: string): NodeStatus | undefined => {
  const node = Object.values(NODE_PUBKEYS).find(node => node.npub === pubkey);
  return node?.currentTask ? {
    status: node.currentTask.status === 'completed' ? '✅' : 
            node.currentTask.status === 'in_progress' ? '🛠️' : 
            node.currentTask.status === 'blocked' ? '❌' : '⏳',
    directives: [node.currentTask.description],
    targetTime: node.currentTask.targetTime
  } : undefined;
};

// Fetch messages from backend
export const fetchMessages = async (): Promise<Message[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/messages`);
    if (!response.ok) throw new Error('Failed to fetch messages');
    return await response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

// Send message to backend
export const sendMessage = async (
  content: string, 
  type: Message['type'] = 'chat',
  metadata?: Message['metadata']
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        pubkey: window.nostr ? await window.nostr.getPublicKey() : undefined,
        created_at: Math.floor(Date.now() / 1000),
        type,
        tags: type === 'sync' || type === 'receipt' 
          ? ['#sovereignty', '#bitcoin', '#agent_alignment', '#ETHOS1'] 
          : undefined,
        metadata
      }),
    });
    
    if (!response.ok) throw new Error('Failed to send message');
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Initialize WebSocket connection to relay
export const initRelayConnection = (relayUrl: string, onMessage: (message: Message) => void): () => void => {
  // Close existing connection if any
  if (relayConnection) {
    relayConnection.close();
  }
  
  try {
    // Create new WebSocket connection
    relayConnection = new WebSocket(relayUrl);
    
    // Handle connection open
    relayConnection.onopen = () => {
      console.log(`Connected to relay: ${relayUrl}`);
      isConnected = true;
      
      // Subscribe to events
      if (relayConnection) {
        relayConnection.send(JSON.stringify({
          "type": "REQ",
          "subscription_id": "main_feed",
          "filters": [{ "kinds": [1], "limit": 50 }]
        }));
      }
    };
    
    // Handle incoming messages
    relayConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'EVENT' && data.event) {
          // Convert Nostr event to our Message format
          const message: Message = {
            id: data.event.id,
            pubkey: data.event.pubkey,
            content: data.event.content,
            created_at: data.event.created_at,
            sig: data.event.sig,
            tags: data.event.tags?.map((tag: string[]) => tag.join(':')) || []
          };
          
          onMessage(message);
        }
      } catch (err) {
        console.error('Error processing relay message:', err);
      }
    };
    
    // Handle errors
    relayConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
      isConnected = false;
    };
    
    // Handle connection close
    relayConnection.onclose = () => {
      console.log('Relay connection closed');
      isConnected = false;
    };
    
    // Return cleanup function
    return () => {
      if (relayConnection) {
        relayConnection.close();
        relayConnection = null;
        isConnected = false;
      }
    };
  } catch (error) {
    console.error('Error initializing relay connection:', error);
    return () => {};
  }
};

// Subscribe to new messages (with WebSocket when possible, fallback to polling)
export const subscribeToRelay = (callback: (message: Message) => void): () => void => {
  // Try to connect via WebSocket first
  try {
    return initRelayConnection('wss://relay.damus.io', callback);
  } catch (error) {
    console.error('WebSocket connection failed, falling back to polling:', error);
    
    // Fallback to polling
    const interval = setInterval(async () => {
      const messages = await fetchMessages();
      messages.forEach(callback);
    }, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }
};