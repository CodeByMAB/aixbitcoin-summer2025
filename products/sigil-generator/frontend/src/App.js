import React, { useState } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [sigil, setSigil] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5002/api/sigil/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate sigil');
      }

      setSigil(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-3xl font-bold text-center mb-8">Sovereign Sigil Generator</h1>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                      Enter your intention
                    </label>
                    <textarea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      rows="4"
                      placeholder="Describe the intention for your sigil..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading || !prompt}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : 'Generate Sigil'}
                  </button>
                </form>

                {error && (
                  <div className="mt-4 text-red-600">
                    {error}
                  </div>
                )}

                {sigil && (
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Your Sigil</h2>
                    <div className="aspect-w-1 aspect-h-1">
                      <img
                        src={`data:image/png;base64,${sigil.image}`}
                        alt="Generated sigil"
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <p className="mt-4 text-gray-600">{sigil.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 