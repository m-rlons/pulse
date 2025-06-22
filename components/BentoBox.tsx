import React from 'react';
import { Bento } from '../lib/types';

export interface BentoBoxProps {
  bento: Bento;
  onApprove: () => void;
  onRetry: () => void;
  isLoading: boolean;
}

export const BentoBox: React.FC<BentoBoxProps> = ({ bento, onApprove, onRetry, isLoading }) => {
  return (
    <div className="rounded-lg shadow-lg p-8 bg-white max-w-4xl mx-auto">
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-center mb-8">Business Bento</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Product/Service */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-2 text-gray-800">Product/Service</h3>
            <p className="text-sm text-gray-600">{bento.productService}</p>
          </div>

          {/* Positioning */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-2 text-gray-800">Positioning</h3>
            <p className="text-sm text-gray-600">{bento.positioning}</p>
          </div>

          {/* Direct Competitors */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-2 text-gray-800">Direct Competitors</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {bento.competitors.map((competitor, index) => (
                <span key={index} className="text-sm bg-white px-3 py-1 rounded-full border border-gray-200">
                  {competitor}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Why We Exist - Full Width */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold text-lg mb-2 text-gray-800">Why We Exist</h3>
          <p className="text-sm text-gray-600">{bento.whyWeExist}</p>
        </div>

        {/* Original fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h3 className="font-semibold text-lg mb-2 text-blue-800">Business Model</h3>
            <p className="text-sm text-blue-700">{bento.businessModel}</p>
          </div>

          <div className="bg-red-50 p-6 rounded-lg border border-red-100">
            <h3 className="font-semibold text-lg mb-2 text-red-800">Customer Challenge</h3>
            <p className="text-sm text-red-700">{bento.customerChallenge}</p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4 justify-end mt-8">
        <button
          className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={onRetry}
          disabled={isLoading}
        >
          {isLoading ? 'Regenerating...' : 'Retry'}
        </button>
        <button
          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={onApprove}
          disabled={isLoading}
        >
          {isLoading ? 'Please wait...' : 'Approve & Continue'}
        </button>
      </div>
    </div>
  );
}; 