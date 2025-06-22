import React, { useState } from 'react';
import { Persona } from '../lib/types';

interface PersonaDisplayProps {
  persona: Persona;
  onRestart: () => void;
  onChat: () => void;
}

export const PersonaDisplay: React.FC<PersonaDisplayProps> = ({ persona, onRestart, onChat }) => {
  const [showDescriptor, setShowDescriptor] = useState(false);
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800">{persona.name}</h1>
        <p className="text-lg text-gray-500 mt-2">
          {persona.age} years old | {persona.teachingYears} years of teaching experience
        </p>
      </div>
      <div className="mt-8 flex flex-col md:flex-row gap-8 items-start">
        {persona.imageUrl && (
          <img
            src={persona.imageUrl}
            alt={persona.name}
            className="w-full md:w-1/3 rounded-lg shadow-lg"
          />
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Summary</h2>
          <p className="text-gray-600 leading-relaxed mb-6">{persona.description}</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Actionable Insights</h2>
          <p className="text-gray-600 leading-relaxed">{persona.insights}</p>
        </div>
      </div>
      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={onRestart}
          className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
        >
          Start Over
        </button>
        <button
          onClick={onChat}
          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-md"
        >
          Chat with {persona.name}
        </button>
      </div>
    </div>
  );
}; 