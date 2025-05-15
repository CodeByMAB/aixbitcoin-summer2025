import { getPublicKey, signEvent } from 'nostr-tools';

const privKey = import.meta.env.VITE_NOSTR_PRIVATE_KEY;

// Derive public key (optional sanity check)
export const pubKey = getPublicKey(privKey); 
// Should equal: npub1qpxxvfcpvh0ywzkhzurqvnra85afdtt73ykr92ha99e32lu8dnyspg2mfp

// Update sendMessage to sign the event properly
export async function sendMessage(content: string) {
  const event = {
    kind: 1,
    pubkey: pubKey,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
    content,
  };

  const signedEvent = await signEvent(event, privKey);
  return fetch("http://localhost:5000/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(signedEvent),
  });
} 