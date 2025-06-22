'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Persona } from '../../lib/types';
import PersonaChat from '../../components/PersonaChat';
import { PersonaDisplay } from '../../components/PersonaDisplay';

export default function PersonaPage() {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [view, setView] = useState<'chat' | 'edit'>('chat');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const personaData = localStorage.getItem('persona');
    if (personaData) {
      const parsedPersona = JSON.parse(personaData);
      setPersona(parsedPersona);
      setLoading(false);
      // If there's no image, it might be the first time.
      // Or if it's explicitly null from a failed generation.
      if (!parsedPersona.imageUrl) {
        console.log("No image found, but persona data exists. Chat can proceed.");
      }
    } else {
      setError('No persona data found. Please create a persona first.');
      setLoading(false);
      // Optionally redirect
      // router.push('/'); 
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
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
        <div className="text-2xl font-semibold">Generating your persona...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-white text-black">
      {view === 'chat' && (
        <PersonaChat
          persona={persona}
          onEdit={() => setView('edit')}
        />
      )}
      {view === 'edit' && (
        <PersonaDisplay
          persona={persona}
          onBackToChat={() => setView('chat')}
        />
      )}
    </div>
  );
} 