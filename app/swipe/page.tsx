'use client';

import React, { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bento, Statement, AssessmentResult, Persona } from '../../lib/types';
import { SwipeInterface } from '../../components/SwipeInterface';
import { Loader } from 'lucide-react';
import { SwipeInterfaceSkeleton, PersonaPageSkeleton } from '../../components/Skeletons';

function SwipePageContent() {
  const [bento, setBento] = useState<Bento | null>(null);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [isFetchingStatements, setIsFetchingStatements] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personaGenerationPromise, setPersonaGenerationPromise] = useState<Promise<void> | null>(null);
  const [isContinuing, setIsContinuing] = useState(false);
  const hasStartedPersonaGeneration = useRef(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const refinementDimension = searchParams.get('refine');
  const personaId = searchParams.get('personaId');
  
  const [showIntro, setShowIntro] = useState(!refinementDimension);

  useEffect(() => {
    const savedBento = localStorage.getItem('bento');
    if (!savedBento) {
      setError('Bento box data not found. Please start over.');
      setIsFetchingStatements(false);
      return;
    }
    const parsedBento = JSON.parse(savedBento);
    setBento(parsedBento);

    const fetchStatements = async () => {
      try {
        const response = await fetch('/api/generate-statements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bento: parsedBento, refinementDimension }),
        });

        if (!response.ok || !response.body) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch statements');
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep the last, possibly incomplete, line

          for (const line of lines) {
            if (line.trim() === '') continue;
            try {
              const parsed = JSON.parse(line);
              if (parsed.type === 'statements') {
                const shuffledStatements = parsed.data.sort(() => Math.random() - 0.5);
                setStatements(shuffledStatements);
                setIsFetchingStatements(false); // Show UI as soon as text is ready
              } else if (parsed.type === 'image_update') {
                setStatements(prevStatements => 
                  prevStatements.map(s => 
                    s.id === parsed.data.id ? { ...s, imageUrl: parsed.data.imageUrl } : s
                  )
                );
              }
            } catch (e) {
              console.warn("Failed to parse stream chunk:", line, e);
            }
          }
        }

      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
        setIsFetchingStatements(false);
      } 
    };

    fetchStatements();
  }, [refinementDimension]);

  const handleStartOver = () => {
    localStorage.clear();
    router.push('/');
  };

  const handleAssessmentComplete = useCallback((results: AssessmentResult[]) => {
    if (hasStartedPersonaGeneration.current) return;
    hasStartedPersonaGeneration.current = true;

    const generateAndSavePersona = async () => {
      let allResults = results;
      let existingResults: AssessmentResult[] = [];
      const storageKey = personaId ? `assessmentResults_${personaId}` : 'assessmentResults';
      const existingResultsJSON = localStorage.getItem(storageKey);

      if (refinementDimension && existingResultsJSON) {
        existingResults = JSON.parse(existingResultsJSON);
        allResults = [...existingResults, ...results];
      }
      
      localStorage.setItem(storageKey, JSON.stringify(allResults));
      
      try {
        const response = await fetch('/api/generate-persona', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            bento, 
            results: allResults,
            existingPersonaId: personaId 
          }),
        });

        if (!response.ok) throw new Error('Failed to generate persona');
        
        const newOrUpdatedPersona: Persona = await response.json();
        
        // New logic: save to the 'personas' list
        const personasJSON = localStorage.getItem('personas');
        let personas: Persona[] = personasJSON ? JSON.parse(personasJSON) : [];

        if (personaId) {
          // This was a refinement, so update the existing persona
          personas = personas.map(p => p.id === personaId ? newOrUpdatedPersona : p);
        } else {
          // This is a new persona, so add it to the list
          personas.push(newOrUpdatedPersona);
        }

        localStorage.setItem('personas', JSON.stringify(personas));
        // Also set the 'current' persona for immediate redirection
        localStorage.setItem('persona', JSON.stringify(newOrUpdatedPersona));

      } catch (err: any) {
          throw err;
      }
    };
    
    setPersonaGenerationPromise(generateAndSavePersona());
  }, [bento, refinementDimension, personaId]);

  const handleContinue = async () => {
    setIsContinuing(true);
    if (personaGenerationPromise) {
      try {
        await personaGenerationPromise;
        router.push('/persona');
      } catch (err: any) {
        setError(err.message || 'Could not generate persona.');
        // Don't transition away, show error on the current screen
        setIsContinuing(false);
      }
    }
  };

  // Effect for keyboard navigation on the intro screen
  useEffect(() => {
    if (!showIntro) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') setShowIntro(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showIntro]);
  
  if (!showIntro && isFetchingStatements) {
    return <SwipeInterfaceSkeleton />;
  }

  if (isContinuing) {
    return <PersonaPageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500 text-xl p-8 text-center">
        <p>Something went wrong:</p>
        <p className="mt-2 text-base font-mono bg-red-100 p-4 rounded-md">{error}</p>
        <button onClick={handleStartOver} className="mt-6 bg-red-500 text-white font-bold py-3 px-6 rounded-md text-lg hover:bg-red-600">
          Start Over
        </button>
      </div>
    );
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
      <SwipeInterface 
        statements={statements} 
        onAssessmentComplete={handleAssessmentComplete}
        onContinue={handleContinue}
      />
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