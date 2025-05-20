// products/sigil-generator/frontend/src/components/SigilGenerator.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNostrEvents, useNostr } from 'nostr-react';
import QRCode from 'react-qr-code';
import { getPublicKey, nip19, getEventHash, signEvent } from 'nostr-tools';
import NostrLoginButton from './NostrLoginButton';
import NostrProfileCard from './NostrProfileCard';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const SigilGenerator = () => {
  // State management
  const [prompt, setPrompt] = useState('');
  const [satsAmount, setSatsAmount] = useState(1000);
  const [userNpub, setUserNpub] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);
  const [sigilData, setSigilData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');
  const [userProfile, setUserProfile] = useState(null);
  const [nostrExtensionAvailable, setNostrExtensionAvailable] = useState(false);
  const [showNostrOptions, setShowNostrOptions] = useState(false);
  const [shareToNostr, setShareToNostr] = useState(false);

  // Connect to Nostr context
  const { publish } = useNostr();
  
  // Check for NIP-07 extension (Alby, nos2x, etc)
  useEffect(() => {
    const checkNostrExtension = async () => {
      if (window.nostr) {
        try {
          const pubkey = await window.nostr.getPublicKey();
          if (pubkey) {
            setNostrExtensionAvailable(true);
            const npub = nip19.npubEncode(pubkey);
            setUserNpub(npub);
          }
        } catch (e) {
          console.error('Error with Nostr extension:', e);
        }
      }
    };
    
    checkNostrExtension();
  }, []);

  // Connect to Nostr for user identity (if available)
  const { events } = useNostrEvents({
    filter: userNpub ? {
      kinds: [0],
      authors: [userNpub.startsWith('npub') ? getPublicKey(nip19.decode(userNpub).data) : userNpub],
    } : null,
  });

  // Check if the user has a Nostr profile
  useEffect(() => {
    if (events && events.length > 0) {
      try {
        const profileContent = JSON.parse(events[0].content);
        setUserProfile(profileContent);
      } catch (e) {
        console.error('Error parsing profile:', e);
      }
    }
  }, [events]);
  
  // Connect with Nostr browser extension (NIP-07)
  const connectWithNostr = async () => {
    if (!window.nostr) {
      setError("No Nostr extension found. Please install Alby, nos2x, or another NIP-07 compatible extension.");
      return;
    }
    
    try {
      const pubkey = await window.nostr.getPublicKey();
      const npub = nip19.npubEncode(pubkey);
      setUserNpub(npub);
      setShowNostrOptions(true);
    } catch (e) {
      setError("Failed to connect with Nostr: " + e.message);
    }
  };
  
  // Publish sigil to Nostr
  const publishSigilToNostr = useCallback(async () => {
    if (!sigilData || !userNpub) return;
    
    try {
      const event = {
        kind: 1,
        pubkey: getPublicKey(nip19.decode(userNpub).data),
        created_at: Math.floor(Date.now() / 1000),
        tags: [["t", "sigil"], ["t", "AIxBitcoin"]],
        content: `I just created a magical sigil with the Sovereign Sigil Generator!\n\nIntention: ${prompt}\n\n${sigilData.description}\n\n#AIxBitcoin #SovereignTools`
      };
      
      event.id = getEventHash(event);
      
      // If we have a Nostr extension, use it to sign
      if (window.nostr) {
        try {
          const signedEvent = await window.nostr.signEvent(event);
          publish(signedEvent);
          return true;
        } catch (e) {
          console.error('Error signing with extension:', e);
          return false;
        }
      } else if (publish) {
        // Otherwise use the context publisher if available
        publish(event);
        return true;
      }
      
      return false;
    } catch (e) {
      console.error('Error publishing to Nostr:', e);
      return false;
    }
  }, [sigilData, userNpub, prompt, publish]);

  // Poll for sigil status if we have a request in progress
  useEffect(() => {
    let intervalId;
    
    if (invoiceData && status === 'awaiting_payment') {
      intervalId = setInterval(() => {
        checkSigilStatus(invoiceData.sigil_request_id);
      }, 5000); // Check every 5 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [invoiceData, status]);

  // Create a sigil request and get an invoice
  const createSigilRequest = async () => {
    if (!prompt) {
      setError('Please enter a sigil intention or prompt');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setStatus('requesting');
      
      const response = await fetch(`${API_BASE_URL}/sigil/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          sats_amount: satsAmount,
          nostr_npub: userNpub || 'anonymous',
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create sigil request');
      }
      
      const data = await response.json();
      setInvoiceData(data);
      setStatus('awaiting_payment');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Check the status of a sigil request
  const checkSigilStatus = async (sigilRequestId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sigil/status/${sigilRequestId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to check sigil status');
      }
      
      const data = await response.json();
      
      if (data.status === 'completed' && data.sigil_data) {
        setSigilData(data.sigil_data);
        setStatus('completed');
      } else if (data.status === 'failed') {
        setError('Sigil generation failed. Please try again.');
        setStatus('error');
      } else {
        setStatus(data.status);
      }
    } catch (err) {
      console.error('Error checking sigil status:', err);
      // Don't update status here to avoid interrupting the polling
    }
  };

  // Reset the form
  const resetForm = () => {
    setInvoiceData(null);
    setSigilData(null);
    setStatus('idle');
    setError(null);
  };

  // Calculate suggested donation tiers
  const baseSats = 1000;
  const extendedSats = 2100;
  const premiumSats = 5000;

  return (
    <div className="max-w-2xl mx-auto bg-gray-900 text-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-2xl font-bold text-orange-500 mb-2">Sovereign Sigil Generator</h2>
        <p className="text-gray-400">
          Create a unique magical sigil powered by AI. Each sigil is generated based on your intention
          and comes with a detailed interpretation. Support this sovereign tool with satoshis.
        </p>
      </div>

      {status === 'idle' && (
        <div className="p-6">
          {/* Nostr Identity Section */}
          <div className="mb-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-lg font-medium text-orange-500 mb-3">
              Nostr Identity <span className="text-xs text-gray-400">(optional)</span>
            </h3>
            
            {!userNpub ? (
              <div>
                <p className="text-sm text-gray-400 mb-3">
                  Connect with your Nostr identity to personalize your sigil and share it to the Nostr network.
                </p>
                
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
                  {nostrExtensionAvailable ? (
                    <button 
                      onClick={connectWithNostr}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 256 256" fill="currentColor">
                        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm.28-152h-.56A63.94,63.94,0,0,0,64,127.73a8,8,0,0,0,16,.54A47.94,47.94,0,0,1,128,80.28,47.94,47.94,0,0,1,176,128.27,8,8,0,0,0,192,128,64,64,0,0,0,128.28,64ZM128,152a24,24,0,1,0-24-24A24,24,0,0,0,128,152Z" />
                      </svg>
                      Connect with Extension
                    </button>
                  ) : (
                    <div className="flex flex-col space-y-2 w-full">
                      <input
                        type="text"
                        id="npub"
                        placeholder="npub1..."
                        className="w-full p-3 bg-gray-900 border border-gray-700 rounded text-white"
                        value={userNpub}
                        onChange={(e) => setUserNpub(e.target.value)}
                      />
                      <div className="text-xs text-gray-500">
                        No Nostr extension detected. Enter your npub or 
                        <a 
                          href="https://getalby.com/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-400 ml-1 hover:underline"
                        >
                          install Alby
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {userProfile ? (
                  <div className="flex items-center">
                    {userProfile.picture && (
                      <img 
                        src={userProfile.picture} 
                        alt="Profile" 
                        className="w-10 h-10 rounded-full mr-3" 
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = '/api/placeholder/40/40';
                        }}
                      />
                    )}
                    <div>
                      <div className="font-bold text-white">
                        {userProfile.display_name || userProfile.name || 'Nostr User'}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {userNpub.substring(0, 10)}...{userNpub.substring(userNpub.length - 5)}
                      </div>
                    </div>
                    <button 
                      onClick={() => setUserNpub('')}
                      className="ml-auto text-xs text-gray-400 hover:text-white"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <div className="font-mono text-sm">
                      {userNpub.substring(0, 10)}...{userNpub.substring(userNpub.length - 5)}
                    </div>
                    <button 
                      onClick={() => setUserNpub('')}
                      className="ml-auto text-xs text-gray-400 hover:text-white"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
                
                <div className="mt-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={shareToNostr}
                      onChange={(e) => setShareToNostr(e.target.checked)}
                      className="rounded text-orange-500 focus:ring-orange-500 h-4 w-4 mr-2"
                    />
                    <span className="text-sm text-gray-300">Share sigil to Nostr when complete</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
              Sigil Intention
            </label>
            <textarea
              id="prompt"
              rows="3"
              placeholder="Enter your intention or purpose for this sigil..."
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Support with Satoshis
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                className={`p-4 rounded border ${
                  satsAmount === baseSats ? 'bg-orange-600 border-orange-400' : 'bg-gray-800 border-gray-700'
                }`}
                onClick={() => setSatsAmount(baseSats)}
              >
                <div className="font-bold">{baseSats} sats</div>
                <div className="text-xs text-gray-400">Basic Sigil</div>
              </button>
              <button
                className={`p-4 rounded border ${
                  satsAmount === extendedSats ? 'bg-orange-600 border-orange-400' : 'bg-gray-800 border-gray-700'
                }`}
                onClick={() => setSatsAmount(extendedSats)}
              >
                <div className="font-bold">{extendedSats} sats</div>
                <div className="text-xs text-gray-400">Extended Meaning</div>
              </button>
              <button
                className={`p-4 rounded border ${
                  satsAmount === premiumSats ? 'bg-orange-600 border-orange-400' : 'bg-gray-800 border-gray-700'
                }`}
                onClick={() => setSatsAmount(premiumSats)}
              >
                <div className="font-bold">{premiumSats} sats</div>
                <div className="text-xs text-gray-400">Premium Quality</div>
              </button>
            </div>
            <div className="mt-4">
              <label htmlFor="custom-amount" className="block text-sm font-medium text-gray-300 mb-2">
                Custom Amount (minimum 1000 sats)
              </label>
              <input
                type="number"
                id="custom-amount"
                min="1000"
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded text-white"
                value={satsAmount}
                onChange={(e) => setSatsAmount(Math.max(1000, parseInt(e.target.value) || 1000))}
              />
            </div>
          </div>

          <button
            onClick={createSigilRequest}
            disabled={loading || !prompt}
            className={`w-full py-3 px-4 rounded font-bold ${
              loading || !prompt
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-500'
            }`}
          >
            {loading ? 'Processing...' : 'Generate Sigil for ⚡ ' + satsAmount + ' sats'}
          </button>
        </div>
      )}

      {status === 'awaiting_payment' && invoiceData && (
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold mb-4">Payment Required</h3>
          <p className="mb-4">Please pay the invoice to generate your sigil:</p>
          
          <div className="bg-white p-4 rounded-lg mx-auto mb-4" style={{ width: 'fit-content' }}>
            <QRCode value={invoiceData.payment_link} size={200} />
          </div>
          
          <p className="text-sm mb-2">{invoiceData.sats_amount} sats</p>
          
          <div className="mb-6">
            <a
              href={invoiceData.payment_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block py-2 px-4 bg-orange-600 hover:bg-orange-500 rounded font-bold"
            >
              Open Invoice ⚡
            </a>
          </div>
          
          <p className="text-sm text-gray-400">
            Status: {status} - Checking for payment...
          </p>
          
          <button
            onClick={resetForm}
            className="mt-4 text-sm text-gray-400 hover:text-gray-300"
          >
            Cancel and start over
          </button>
        </div>
      )}

      {status === 'generating' && (
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold mb-4">Creating Your Sigil</h3>
          <p className="mb-6">
            Payment received! Your sigil is now being crafted by the AI. 
            This process takes approximately 30-60 seconds.
          </p>
          <div className="flex justify-center items-center space-x-2">
            <div className="animate-pulse h-3 w-3 bg-orange-500 rounded-full"></div>
            <div className="animate-pulse h-3 w-3 bg-orange-500 rounded-full delay-150"></div>
            <div className="animate-pulse h-3 w-3 bg-orange-500 rounded-full delay-300"></div>
          </div>
        </div>
      )}

      {status === 'completed' && sigilData && (
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 text-center">Your Sigil Is Ready</h3>
          
          {sigilData.image_url ? (
            <div className="mb-6 text-center">
              <img 
                src={sigilData.image_url} 
                alt="Generated Sigil" 
                className="max-w-full h-auto mx-auto rounded-lg border border-gray-800"
              />
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h4 className="font-bold mb-2">Sigil Description:</h4>
              <p className="whitespace-pre-line">{sigilData.description}</p>
            </div>
          )}
          
          {userNpub && (
            <div className="mt-6 mb-6 bg-purple-900/30 border border-purple-800 rounded-lg p-4">
              <h4 className="font-bold text-purple-300 mb-2">Share to Nostr</h4>
              <p className="text-sm text-gray-300 mb-3">
                Share your new sigil with the Nostr network. This will create a note visible to your followers.
              </p>
              <button
                onClick={publishSigilToNostr}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded flex items-center justify-center text-white"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm.28-152h-.56A63.94,63.94,0,0,0,64,127.73a8,8,0,0,0,16,.54A47.94,47.94,0,0,1,128,80.28,47.94,47.94,0,0,1,176,128.27,8,8,0,0,0,192,128,64,64,0,0,0,128.28,64ZM128,152a24,24,0,1,0-24-24A24,24,0,0,0,128,152Z" />
                </svg>
                Share to Nostr
              </button>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <button
              onClick={resetForm}
              className="py-2 px-4 bg-orange-600 hover:bg-orange-500 rounded font-bold"
            >
              Create Another Sigil
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 mb-4 bg-red-900 text-white rounded mx-6">
          <p>{error}</p>
        </div>
      )}

      <div className="p-4 bg-gray-800 text-xs text-center text-gray-400">
        All sigils are generated using sovereign technology. No data leaves your control.
        <br />
        Part of the <span className="text-orange-500">AIxBitcoin-Summer2025</span> internship project.
      </div>
    </div>
  );
};

export default SigilGenerator;