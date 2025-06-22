'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bento } from '../lib/types';

const CompetitorLogo = ({ name, domain }: { name: string; domain: string }) => {
  const [hasError, setHasError] = useState(false);
  const logoUrl = `https://logo.clearbit.com/${domain}`;

  return (
    <a href={`https://${domain}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-xl">
        {hasError ? (
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 font-bold text-lg">
            {name.charAt(0)}
          </div>
        ) : (
          <img 
            src={logoUrl} 
            alt={`${name} logo`}
            className="w-full h-full object-contain rounded-xl"
            onError={() => setHasError(true)}
          />
        )}
      </div>
    </a>
  );
};

export interface BentoBoxProps {
  bento: Bento;
  onApprove: () => void;
  onRetry: () => void;
  isLoading: boolean;
}

export const BentoBox: React.FC<BentoBoxProps> = ({ bento, onApprove, onRetry, isLoading }) => {
  const router = useRouter();

  return (
    <div className="w-full max-w-5xl mx-auto p-8 animate-fade-in bg-white">
      <h1 className="text-4xl font-bold mb-12">Business Bento</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1 */}
        <div className="space-y-6">
          <h3 className="font-semibold text-gray-900">Product/Service</h3>
          <p className="text-gray-700 leading-relaxed">
            {bento.productService}
          </p>
        </div>
        
        {/* Column 2 */}
        <div className="space-y-6">
          <h3 className="font-semibold text-gray-900">Positioning</h3>
          <p className="text-gray-700 leading-relaxed">
            {bento.positioning}
          </p>
        </div>
        
        {/* Column 3 */}
        <div className="space-y-6">
          <h3 className="font-semibold text-gray-900">Direct Competitors</h3>
          <div className="flex flex-wrap gap-2">
            {bento.competitors.map((competitor, index) => (
              <CompetitorLogo key={index} name={competitor.name} domain={competitor.domain} />
            ))}
          </div>
        </div>
      </div>
      
      {/* Full-width Row */}
      <div className="mt-10 pt-10 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900">Why We Exist</h3>
        <p className="text-gray-700 leading-relaxed mt-4 max-w-3xl">
          {bento.whyWeExist}
        </p>
      </div>
      
      <div className="flex justify-between items-center mt-16">
        <button
          onClick={() => router.push('/')}
          className="bg-red-500 text-white px-8 py-4 rounded-full font-medium hover:bg-red-600 transition-all text-lg"
        >
          Start Over
        </button>
        
        <button
          onClick={onApprove}
          disabled={isLoading}
          className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
        >
          Looks good, next
          <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
}; 