'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bento, Statement, AssessmentResult, Persona } from '../../lib/types';
import { SwipeInterface } from '../../components/SwipeInterface';
import { Loader } from 'lucide-react';

function SwipePageContent() {
  const [bento, setBento] = useState<Bento | null>(null);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const refinementDimension = searchParams.get('refine');

  useEffect(() => {
    const savedBento = localStorage.getItem('bento');
    if (!savedBento) {
      setError('Bento box data not found. Please start over.');
      setIsLoading(false);
      return;
    }
    const parsedBento = JSON.parse(savedBento);
    setBento(parsedBento);

    const fetchStatements = async () => {
      try {
        console.log(`Fetching statements... Refinement: ${refinementDimension}`);
        const response = await fetch('/api/generate-statements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bento: parsedBento, refinementDimension }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch statements');
        }
        
        const data = await response.json();
        const shuffledStatements = data.statements.sort(() => Math.random() - 0.5);
        setStatements(shuffledStatements);
        
        // Only show the intro screen on the initial, full assessment.
        if (!refinementDimension) {
          setShowIntro(true);
        }

      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatements();
  }, [refinementDimension]);

  const handleStartOver = () => {
    localStorage.removeItem('bento');
    localStorage.removeItem('assessmentResults');
    localStorage.removeItem('persona');
    localStorage.removeItem('chatHistory');
    router.push('/');
  };

  const handleAssessmentComplete = async (results: AssessmentResult[]) => {
    setIsLoading(true);
    let allResults = results;

    // If this was a refinement, we need to merge with previous results
    if (refinementDimension) {
        const existingResultsJSON = localStorage.getItem('assessmentResults');
        if (existingResultsJSON) {
            const existingResults: AssessmentResult[] = JSON.parse(existingResultsJSON);
            // Filter out old results for the dimension we just refined
            const otherResults = existingResults.filter(r => r.dimension !== refinementDimension);
            allResults = [...otherResults, ...results];
        }
    }

    localStorage.setItem('assessmentResults', JSON.stringify(allResults));
    
    try {
      const response = await fetch('/api/generate-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bento, results: allResults }),
      });
      if (!response.ok) throw new Error('Failed to generate persona');
      
      const persona: Persona = await response.json();
      localStorage.setItem('persona', JSON.stringify(persona));
      
      router.push('/persona');

    } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
    }
  };

  // Effect for keyboard navigation on the intro screen
  useEffect(() => {
    if (!showIntro) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        setShowIntro(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showIntro]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800">
        <Loader className="animate-spin mb-4" size={48} />
        <p className="text-xl font-medium">
          {refinementDimension 
            ? `Generating new questions for "${refinementDimension}"...`
            : "Generating your assessment..."}
        </p>
      </div>
    );
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500 text-xl">{error}</div>;
  }
  
  if (showIntro) {
    return (
      <div className="flex flex-col h-screen bg-white text-black p-12 animate-fade-in">
        <div className="flex-grow flex flex-col justify-center">
          <h1 className="text-8xl font-black text-gray-900 tracking-tighter leading-tight">
            We need to<br />
            understand your<br />
            customer's values.
          </h1>
          <p className="text-3xl text-gray-500 mt-8">
            You're going to swipe through some questions.
          </p>
        </div>
        <div className="flex justify-between items-center">
          <button
            onClick={handleStartOver}
            className="bg-red-500 text-white font-bold py-3 px-6 rounded-md text-lg hover:bg-red-600 transition-colors"
          >
            Start Over
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowIntro(false)}
              className="bg-black text-white font-semibold py-3 px-6 rounded-md text-lg hover:bg-gray-800 transition-colors"
            >
              Sounds good, next
            </button>
            <span className="text-gray-500 text-sm">Or Press Enter</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SwipeInterface statements={statements} onComplete={handleAssessmentComplete} />
    </div>
  );
}

export default function SwipePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800">
        <Loader className="animate-spin mb-4" size={48} />
        <p className="text-xl font-medium">Loading Assessment...</p>
      </div>
    }>
      <SwipePageContent />
    </Suspense>
  );
} 