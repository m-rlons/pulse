'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Persona } from '../lib/types';
import { ArrowLeft, ChevronDown } from 'lucide-react';

export interface PersonaDisplayProps {
  persona: Persona;
  onBackToChat: () => void;
}

export const PersonaDisplay: React.FC<PersonaDisplayProps> = ({ persona, onBackToChat }) => {
  const router = useRouter();

  const handleAnswerMore = () => {
    // This assumes we want to go back to the swipe page to refine the persona
    router.push('/swipe');
  };

  return (
    <div className="flex h-screen bg-white text-black p-12">
      {/* Left side: Details */}
      <div className="w-1/2 flex flex-col justify-between pr-12">
        <div>
          <button onClick={onBackToChat} className="text-sm font-semibold mb-8 flex items-center gap-2 hover:underline">
            <ArrowLeft size={16} />
            Back To Chat
          </button>
          
          <div className="mb-2">
            <span className="text-sm font-semibold">Edit</span>
          </div>

          <h1 className="text-5xl font-bold">{persona.name}</h1>
          <p className="text-xl text-gray-600 mt-2">{persona.age} years old</p>
          <p className="text-xl text-gray-600">{persona.role} - {persona.experience}</p>
          
          <div className="mt-12 space-y-8 text-lg">
            <div>
              <h2 className="font-bold mb-2">Bio</h2>
              <p className="text-gray-700">{persona.bio}</p>
            </div>
            <div>
              <h2 className="font-bold mb-2">Interests</h2>
              <p className="text-gray-700">{persona.interests}</p>
            </div>
            <div>
              <h2 className="font-bold mb-2">Disinterests</h2>
              <p className="text-gray-700">{persona.disinterests}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
            <button
              onClick={handleAnswerMore}
              className="bg-red-500 text-white px-8 py-4 rounded-lg font-medium hover:bg-red-600 transition-all text-lg"
            >
              Answer More Questions
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <ChevronDown size={16} />
                <span>SCROLL TO CONTINUE READING</span>
            </div>
        </div>
      </div>

      {/* Right side: Image */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="w-full max-w-lg">
          {persona.imageUrl ? (
            <Image
              src={persona.imageUrl}
              alt={persona.name}
              width={512}
              height={512}
              className="rounded-lg object-cover w-full aspect-square"
              priority
            />
          ) : (
            <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">No Image Available</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 