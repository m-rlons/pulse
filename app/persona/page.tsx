'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Persona } from '../../lib/types';
import PersonaChat from '../../components/PersonaChat';
import { Loader } from 'lucide-react';

function PersonaPageContent() {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const personaData = localStorage.getItem('persona');
    if (personaData) {
      const parsedPersona = JSON.parse(personaData);
      setPersona(parsedPersona);
      setLoading(false);
    } else {
      setError('No persona data found. Please create a persona first.');
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader className="animate-spin mb-4" size={48} />
        <div className="text-2xl font-semibold">Loading Persona...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl text-red-500">{error}</div>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl font-semibold">Could not load persona.</div>
      </div>
    );
  }

  return <PersonaChat persona={persona} />;
}

export default function PersonaPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader className="animate-spin mb-4" size={48} />
        <div className="text-2xl font-semibold">Loading Page...</div>
      </div>
    }>
      <PersonaPageContent />
    </Suspense>
  );
} 