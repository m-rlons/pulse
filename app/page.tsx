'use client';

import React, { useState, useCallback } from 'react';
import { AppStage, Bento, Statement, Persona, AssessmentResult } from '../lib/types';
import { BentoBox } from '../components/BentoBox';
import { SwipeInterface } from '../components/SwipeInterface';
import { PersonaDisplay } from '../components/PersonaDisplay';

export default function HomePage() {
  // === STATE MANAGEMENT ===
  const [stage, setStage] = useState<AppStage>('INPUT');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [businessInput, setBusinessInput] = useState<string>('');
  const [bento, setBento] = useState<Bento | null>(null);
  const [statements, setStatements] = useState<Statement[]>([]);
  const [persona, setPersona] = useState<Persona | null>(null);

  // === API HANDLER FUNCTIONS ===
  const handleGenerateBento = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-bento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessInput }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to generate bento');
      const data: Bento = await res.json();
      setBento(data);
      setStage('BENTO_APPROVAL');
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [businessInput]);

  const handleGenerateStatements = useCallback(async () => {
    if (!bento) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-statements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bento),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to generate statements');
      const data = await res.json();
      setStatements(data.statements);
      setStage('ASSESSMENT');
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [bento]);

  const handleGeneratePersona = useCallback(async (results: AssessmentResult[]) => {
    if (!bento) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bento, results }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to generate persona');
      const data: Persona = await res.json();
      setPersona(data);
      setStage('PERSONA_RESULT');
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [bento]);

  const handleRestart = useCallback(() => {
    setStage('INPUT');
    setIsLoading(false);
    setError(null);
    setBusinessInput('');
    setBento(null);
    setStatements([]);
    setPersona(null);
  }, []);

  // === RENDER LOGIC ===
  const renderCurrentStage = () => {
    switch (stage) {
      case 'INPUT':
        return (
          <form
            className="max-w-xl mx-auto bg-why-white rounded-lg shadow-lg p-8 flex flex-col gap-4"
            onSubmit={e => {
              e.preventDefault();
              handleGenerateBento();
            }}
          >
            <label className="font-semibold text-curious-blue text-lg mb-2" htmlFor="businessInput">
              Describe your business and customer in a few sentences:
            </label>
            <textarea
              id="businessInput"
              className="border border-curious-blue/30 rounded p-3 min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-curious-blue"
              value={businessInput}
              onChange={e => setBusinessInput(e.target.value)}
              disabled={isLoading}
              required
            />
            <button
              type="submit"
              className="px-4 py-2 rounded bg-curious-blue text-why-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              disabled={isLoading || !businessInput.trim()}
            >
              {isLoading ? 'Loading...' : 'Analyze'}
            </button>
          </form>
        );
      case 'BENTO_APPROVAL':
        return bento && (
          <BentoBox
            bento={bento}
            onApprove={handleGenerateStatements}
            onRetry={handleGenerateBento}
            isLoading={isLoading}
          />
        );
      case 'ASSESSMENT':
        return (
          <SwipeInterface
            statements={statements}
            onComplete={handleGeneratePersona}
          />
        );
      case 'PERSONA_RESULT':
        return persona && (
          <PersonaDisplay
            persona={persona}
            onRestart={handleRestart}
          />
        );
      default:
        return null;
    }
  };

  return (
    <main className="container mx-auto p-4 min-h-screen bg-why-white">
      <h1 className="text-3xl font-bold text-curious-blue mb-6 text-center">Pulse</h1>
      {isLoading && <div className="text-center text-golly-gold mb-4">Loading...</div>}
      {error && <div className="text-center text-inquisitive-red mb-4">Error: {error}</div>}
      {!isLoading && renderCurrentStage()}
    </main>
  );
} 