'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Persona } from '../../lib/types';
import { PersonaDisplay } from '../../components/PersonaDisplay';
import PersonaChat from '../../components/PersonaChat';

export default function PersonaPage() {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [isChatting, setIsChatting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedPersona = localStorage.getItem('persona');
    if (savedPersona) {
      setPersona(JSON.parse(savedPersona));
    } else {
      // If no persona is found, maybe redirect to the beginning
      router.push('/');
    }
  }, [router]);

  const handleRestart = () => {
    // Clear all relevant local storage and go home
    localStorage.removeItem('persona');
    localStorage.removeItem('bento');
    localStorage.removeItem('businessDescription');
    router.push('/');
  };

  if (!persona) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <h2 className="text-2xl font-semibold text-gray-700">Loading your Persona...</h2>
      </div>
    );
  }

  if (isChatting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <PersonaChat persona={persona} onExit={() => setIsChatting(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <PersonaDisplay 
        persona={persona} 
        onRestart={handleRestart}
        onChat={() => setIsChatting(true)}
      />
    </div>
  );
} 