'use client';

import React, { useState } from 'react';
import { Bento, PanelContent } from '../lib/types';

// --- Individual Panel Components ---

const TextPanel: React.FC<{ title: string; content: string }> = ({ title, content }) => (
  <>
    <h3 className="font-bold text-lg text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-700 leading-relaxed text-sm flex-grow">{content}</p>
  </>
);

const LargeTextPanel: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <span className="text-gray-500 text-sm uppercase tracking-wider">{label}</span>
    <span className="text-5xl font-extrabold text-black mt-2">{value}</span>
  </div>
);

const CompetitorLogo: React.FC<{ name: string; domain: string }> = ({ name, domain }) => {
  const [hasError, setHasError] = useState(false);
  const logoUrl = `https://logo.clearbit.com/${domain}`;

  return (
    <a href={`https://${domain}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
        {hasError ? (
          <div className="w-full h-full rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 font-bold">
            {name.charAt(0)}
          </div>
        ) : (
          <img 
            src={logoUrl} 
            alt={`${name} logo`}
            className="w-full h-full object-contain rounded-lg"
            onError={() => setHasError(true)}
          />
        )}
      </div>
      <span className="text-sm font-medium text-gray-800">{name}</span>
    </a>
  );
};

const CompetitorPanel: React.FC<{ title: string; competitors: { name: string; domain: string }[] }> = ({ title, competitors }) => (
  <>
    <h3 className="font-bold text-lg text-gray-900 mb-4">{title}</h3>
    <div className="grid grid-cols-2 gap-4 flex-grow">
      {competitors.map((c, i) => <CompetitorLogo key={i} {...c} />)}
    </div>
  </>
);

// --- The Main Renderer Switch ---

const PanelRenderer: React.FC<{ data: PanelContent }> = ({ data }) => {
  switch (data.type) {
    case 'text':
      return <TextPanel {...data} />;
    case 'feature-large-text':
      return <LargeTextPanel {...data} />;
    case 'competitors':
      return <CompetitorPanel {...data} />;
    default:
      return <div>Unsupported panel type</div>;
  }
};

// --- The BentoBox Container ---

export interface BentoBoxProps {
  bento: Bento;
  // The interactive props are temporarily unused as we focus on the new layout.
  // onApprove: () => void;
  // onRetry: () => void;
  // isLoading: boolean;
}

export const BentoBox: React.FC<BentoBoxProps> = ({ bento }) => {
  if (!bento || !bento.panels) {
    return <div>Loading Bento...</div>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 md:mb-12 text-center">
        {bento.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </h1>
      <div className="grid grid-cols-3 gap-4 md:gap-6">
        {bento.panels.map((panel, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
            style={{
              gridColumn: `span ${panel.colSpan} / span ${panel.colSpan}`,
              gridRow: `span ${panel.rowSpan} / span ${panel.rowSpan}`,
            }}
          >
            <PanelRenderer data={panel.data} />
          </div>
        ))}
      </div>
    </div>
  );
}; 