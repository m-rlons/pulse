'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bento } from '../../lib/types';
import { BentoBox } from '../../components/BentoBox';

export default function BentoPage() {
  const [bento, setBento] = useState<Bento | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGenerateBento = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const description = localStorage.getItem('businessDescription');
      if (!description) {
        throw new Error('Business description not found.');
      }

      const res = await fetch('/api/generate-bento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate bento');
      }

      const data: Bento = await res.json();
      setBento(data);
      // Save this bento under the new multi-bento structure.
      // We don't have a persona ID here, so we'll use a temporary one.
      // The persona page will associate it with the first persona created.
      // A better approach might be to create the persona first, but this works for now.
      const tempId = 'temp-persona-id';
      const bentoStore = { [tempId]: { 'Business Model': data } };
      localStorage.setItem('bentos', JSON.stringify(bentoStore));
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      // Optionally, redirect back to home if something fundamental fails
      setTimeout(() => router.push('/'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateBento();
  }, []);

  const handleApprove = () => {
    router.push('/swipe');
  };

  const handleRetry = () => {
    handleGenerateBento();
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <h2 className="text-2xl font-semibold text-gray-700">Generating your Business Bento...</h2>
        <p className="text-gray-500 mt-2">This might take a moment.</p>
        {/* You can add a spinner here */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4">
        <h2 className="text-2xl font-semibold text-red-700">Error Generating Bento</h2>
        <p className="text-red-500 mt-2">{error}</p>
        <p className="text-gray-500 mt-4">Redirecting you back to the start...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 flex flex-col items-center justify-center">
      {bento && (
        <>
          <BentoBox bento={bento} />
          <div className="flex justify-between items-center mt-8 md:mt-16 w-full max-w-5xl px-8">
            <button
              onClick={handleRetry}
              className="bg-gray-200 text-gray-800 px-8 py-4 rounded-full font-medium hover:bg-gray-300 transition-all text-lg"
            >
              Regenerate
            </button>
            
            <button
              onClick={handleApprove}
              className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-all"
            >
              Looks good, next
              <span className="ml-2">→</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
} 