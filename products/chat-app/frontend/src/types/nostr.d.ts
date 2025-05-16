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
  getRelays(): Promise<{
    [url: string]: { read: boolean; write: boolean };
  }>;
}

declare global {
  interface Window {
    nostr?: Nostr;
  }
} 