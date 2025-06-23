'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Persona } from '../../lib/types';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function StaffPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const router = useRouter();

  useEffect(() => {
    const savedPersonas = localStorage.getItem('personas');
    if (savedPersonas) {
      setPersonas(JSON.parse(savedPersonas));
    }
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Your Staff</h1>
        <Link href="/onboarding-flow" className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
          <Plus size={20} />
          New Persona
        </Link>
      </header>
      
      {personas.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">You haven't generated any personas yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {personas.map(persona => (
            <Link key={persona.id} href={`/persona?id=${persona.id}`} className="block bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow border">
                <div className="aspect-square bg-gray-100 rounded-md mb-4 overflow-hidden">
                    {persona.imageUrl && (
                        <img src={persona.imageUrl} alt={persona.name} className="w-full h-full object-cover" />
                    )}
                </div>
                <h2 className="font-bold text-lg">{persona.name}</h2>
                <p className="text-sm text-gray-600">{persona.role}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 