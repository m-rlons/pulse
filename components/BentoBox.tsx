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
    <div className="rounded-lg shadow-lg p-8 bg-why-white max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-curious-blue mb-4">Business Model</h2>
      <div className="mb-6 p-4 rounded bg-curious-blue/10 text-heedless-black">
        {bento.businessModel}
      </div>
      <h2 className="text-xl font-bold text-inquisitive-red mb-4">Customer Challenge</h2>
      <div className="mb-8 p-4 rounded bg-inquisitive-red/10 text-heedless-black">
        {bento.customerChallenge}
      </div>
      <div className="flex gap-4 justify-end">
        <button
          className="px-4 py-2 rounded bg-inquisitive-red text-why-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={onRetry}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Retry'}
        </button>
        <button
          className="px-4 py-2 rounded bg-curious-blue text-why-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={onApprove}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Approve & Continue'}
        </button>
      </div>
    </div>
  );
}; 