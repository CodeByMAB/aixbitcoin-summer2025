// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// Mock for localStorage and indexedDB
global.Storage.prototype.getItem = jest.fn();
global.Storage.prototype.setItem = jest.fn();
global.Storage.prototype.removeItem = jest.fn();

// Mock for window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock for window.nostr (NIP-07 extension)
Object.defineProperty(window, 'nostr', {
  writable: true,
  value: {
    getPublicKey: jest.fn().mockResolvedValue('npub1z6uxwev8c8wauc9j8vnjq5gj5n2lpnnm6pq57e68d40w59gz4umqzntvyx'),
    signEvent: jest.fn().mockImplementation(event => ({
      ...event,
      pubkey: 'npub1z6uxwev8c8wauc9j8vnjq5gj5n2lpnnm6pq57e68d40w59gz4umqzntvyx',
      sig: 'fakesignature123456789',
    })),
    getRelays: jest.fn().mockResolvedValue({
      'wss://relay.damus.io': { read: true, write: true },
      'wss://relay.snort.social': { read: true, write: true },
    }),
  },
});

// Create offline/online mock
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

// Mock window fetch
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
);

// Mock WebSocket
class MockWebSocket {
  constructor(url: string) {
    setTimeout(() => {
      if (this.onopen) this.onopen({} as Event);
    }, 50);
  }

  send = jest.fn();
  close = jest.fn();
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
}

// @ts-ignore
global.WebSocket = MockWebSocket;