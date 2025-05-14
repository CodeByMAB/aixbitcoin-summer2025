// Sovereign identity for MAB
export const MAB_PUBKEY = "npub1z6uxwev8c8wauc9j8vnjq5gj5n2lpnnm6pq57e68d40w59gz4umqzntvyx";

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

// Send message to backend with optional authentication
export const sendMessage = async (
  content: string, 
  type: Message['type'] = 'chat',
  metadata?: Message['metadata'],
  userPubkey?: string
): Promise<void> => {
  try {
    // Get pubkey from NIP-07 extension if available
    let pubkey = userPubkey || MAB_PUBKEY;
    let signature = undefined;
    
    // Try to use NIP-07 extension to sign if available
    if (window.nostr) {
      try {
        const event = {
          kind: 1,
          created_at: Math.floor(Date.now() / 1000),
          tags: [],
          content
        };
        
        // Sign with NIP-07 extension
        const signedEvent = await window.nostr.signEvent(event);
        pubkey = signedEvent.pubkey;
        signature = signedEvent.sig;
      } catch (err) {
        console.error('Failed to sign with NIP-07 extension:', err);
        // Fallback to using pubkey without signature
      }
    }
    
    const response = await fetch(`${API_BASE}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        pubkey,
        created_at: Math.floor(Date.now() / 1000),
        type,
        sig: signature,
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