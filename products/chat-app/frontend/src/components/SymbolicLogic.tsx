import React from 'react';
import { SYMBOLIC_LAYER } from '../nostr';

interface GlossaryReference {
  term: string;
  reference: string;
  description?: string;
}

const GLOSSARY_REFERENCES: GlossaryReference[] = [
  {
    term: 'signal',
    reference: 'Meta AI, Glossary.md',
    description: 'Accumulation of internal state and agent learning'
  },
  {
    term: 'quorum',
    reference: 'ETHOS-ALPHA001.md',
    description: 'Evaluated legitimacy of input'
  },
  {
    term: 'signal-weight',
    reference: 'ETHOS-ALPHA001.md',
    description: 'Trust mechanics for input evaluation'
  },
  {
    term: 'fallback-thresholds',
    reference: 'ETHOS-ALPHA001.md',
    description: 'Criteria for fallback mechanisms'
  },
  {
    term: 'encoded_will',
    reference: 'Claude, Section 5 pending',
    description: 'Final consensus product'
  }
];

export const SymbolicLogic: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Section 3: Symbolic Logic & Consensus Chain
        </h2>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
            GLYPH: SYMBOL-Ø3
          </span>
          <span className="text-gray-500 text-sm">
            Transformation of memory into coordinated action
          </span>
        </div>
      </div>

      {/* Motif */}
      <div className="mb-6">
        <p className="text-lg italic text-purple-700">
          "{SYMBOLIC_LAYER.motif}"
        </p>
      </div>

      {/* Symbolic Logic Chain */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Symbolic Logic Chain
        </h3>
        <div className="bg-purple-50 p-6 rounded-lg">
          <pre className="font-mono text-purple-900 whitespace-pre text-center">
            {SYMBOLIC_LAYER.format.preview}
          </pre>
        </div>
        <p className="mt-4 text-gray-600 text-sm">
          This diagram represents the transformation of internal glyph states into coordinated action through verifiable logic.
        </p>
      </div>

      {/* Glossary References */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Glossary References
        </h3>
        <div className="space-y-3">
          {GLOSSARY_REFERENCES.map((ref) => (
            <div key={ref.term} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <code className="px-2 py-1 bg-gray-200 rounded text-sm font-mono">
                    {ref.term}
                  </code>
                  <span className="text-sm text-gray-500">
                    — See: {ref.reference}
                  </span>
                </div>
                {ref.description && (
                  <p className="mt-1 text-sm text-gray-600">
                    {ref.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Narrative Bridge */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-900 italic">
          "Where data once stood silent, glyphs now speak in pattern. MEMORY begins not as fact, but as signal. TRUST is not faith—but quorum. And CONSENSUS is not control—it is the shared will, encoded and verifiable. Here, we begin to walk the chain..."
        </p>
        <p className="mt-2 text-sm text-blue-700">
          — Claude, Narrative Bridge
        </p>
      </div>
    </div>
  );
}; 