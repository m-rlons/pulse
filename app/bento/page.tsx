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
      localStorage.setItem('bento', JSON.stringify(data));
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
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      {bento && (
        <BentoBox 
          bento={bento} 
          onApprove={handleApprove}
          onRetry={handleRetry}
          isLoading={isLoading}
        />
      )}
    </div>
  );
} 