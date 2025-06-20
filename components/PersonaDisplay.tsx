import React, { useState } from 'react';
import { Persona } from '../lib/types';

export interface PersonaDisplayProps {
  persona: Persona;
  onRestart: () => void;
}

export const PersonaDisplay: React.FC<PersonaDisplayProps> = ({ persona, onRestart }) => {
  const [showDescriptor, setShowDescriptor] = useState(false);
  return (
    <div className="rounded-lg shadow-lg p-8 bg-why-white max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-curious-blue mb-2">{persona.title}</h2>
      <div className="text-lg font-semibold text-golly-gold mb-4">{persona.personaName}</div>
      <div className="mb-4 text-heedless-black">{persona.summary}</div>
      <button
        className="text-xs text-curious-blue underline mb-4"
        onClick={() => setShowDescriptor(v => !v)}
        type="button"
      >
        {showDescriptor ? 'Hide' : 'Show'} Visual Descriptor
      </button>
      {showDescriptor && (
        <div className="mb-4 p-2 bg-curious-blue/5 text-xs rounded text-heedless-black whitespace-pre-wrap">
          {persona.visualDescriptor}
        </div>
      )}
      <div className="mb-4">
        <h3 className="font-bold text-inquisitive-red mb-2">Actionable Insights</h3>
        <ul className="list-disc pl-6 space-y-1">
          {persona.actionableInsights.map((insight, idx) => (
            <li key={idx}>
              <span className="font-semibold text-heedless-black">{insight.title}:</span> {insight.insight}
            </li>
          ))}
        </ul>
      </div>
      <button
        className="px-4 py-2 rounded bg-curious-blue text-why-white font-semibold mt-4"
        onClick={onRestart}
      >
        Start Over
      </button>
    </div>
  );
}; 