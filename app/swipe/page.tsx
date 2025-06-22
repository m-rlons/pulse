'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bento, Statement, AssessmentResult, Persona } from '../../lib/types';
import { SwipeInterface } from '../../components/SwipeInterface';

export default function SwipePage() {
  const [statements, setStatements] = useState<Statement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const generateStatements = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const bentoJSON = localStorage.getItem('bento');
        if (!bentoJSON) {
          throw new Error('Bento data not found.');
        }
        const bento: Bento = JSON.parse(bentoJSON);

        const res = await fetch('/api/generate-statements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bento),
        });

        if (!res.ok) {
          throw new Error('Failed to generate statements');
        }

        const data = await res.json();
        setStatements(data.statements);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
        setTimeout(() => router.push('/bento'), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    generateStatements();
  }, [router]);

  const handleComplete = async (results: AssessmentResult[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const bentoJSON = localStorage.getItem('bento');
      if (!bentoJSON) throw new Error('Bento data not found.');
      
      const bento = JSON.parse(bentoJSON);

      const res = await fetch('/api/generate-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bento, results }),
      });

      if (!res.ok) throw new Error('Failed to generate persona');

      const persona: Persona = await res.json();
      localStorage.setItem('persona', JSON.stringify(persona));
      router.push('/persona');
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
      setTimeout(() => router.push('/bento'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && statements.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <h2 className="text-2xl font-semibold text-gray-700">Generating your assessment questions...</h2>
        <p className="text-gray-500 mt-2">This should just take a second.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4">
        <h2 className="text-2xl font-semibold text-red-700">Error Generating Statements</h2>
        <p className="text-red-500 mt-2">{error}</p>
        <p className="text-gray-500 mt-4">Redirecting you back...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      {statements.length > 0 ? (
        <SwipeInterface statements={statements} onComplete={handleComplete} />
      ) : (
        // This will be shown briefly before statements are loaded, or if there's an issue not caught by the error state.
        <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700">Preparing assessment...</h2>
        </div>
      )}
    </div>
  );
} 