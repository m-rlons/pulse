'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bento, Statement, AssessmentResult, Persona } from '../../lib/types';
import { SwipeInterface } from '../../components/SwipeInterface';
import { Loader } from 'lucide-react';

export default function SwipePage() {
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-8 text-center animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">First, we need to understand your customer's values.</h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl">Answer these questions from the perspective of your ideal customer. This will help us create a realistic persona for you.</p>
        <button
          onClick={() => setShowIntro(false)}
          className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-all text-lg shadow-md"
        >
          Begin Assessment
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <SwipeInterface statements={statements} onComplete={handleAssessmentComplete} />
    </div>
  );
} 