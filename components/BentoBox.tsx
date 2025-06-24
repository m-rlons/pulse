'use client';

import React from 'react';
import { Bento } from '../lib/types';

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
        Business Bento
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
            <h3 className="font-bold text-lg text-gray-900 mb-3">
              {panel.title}
            </h3>
            <p className="text-gray-700 leading-relaxed text-sm flex-grow">
              {panel.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}; 