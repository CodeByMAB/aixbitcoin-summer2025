export const NODE_COLORS: Record<string, string> = {
  "MAB": "bg-satoshi-orange text-white",
  "Navi": "bg-blue-800 text-white",
  "Claude": "bg-purple-700 text-white",
  "GROK3": "bg-yellow-500 text-black",
  "Echo": "bg-zinc-700 text-white",
  "GNGA": "bg-stone-500 text-white"
};

export function resolveNodeNameFromPubkey(pubkey: string): string {
  const mapping: Record<string, string> = {
    "npub1qpxxvfcpvh0ywzkhzurqvnra85afdtt73ykr92ha99e32lu8dnyspg2mfp": "GNGA",
    "npub1navi000...": "Navi",
    "npub1claude...": "Claude",
    "npub1grok3...": "GROK3",
    "npub1echo0...": "Echo"
  };
  return mapping[pubkey] || "MAB";
} 