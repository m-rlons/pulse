'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Persona, ChatMessage } from '../../lib/types';
import PersonaChat from '../../components/PersonaChat';
import { Loader, Edit, ArrowLeft } from 'lucide-react';

function PersonaPageContent() {
  const router = useRouter();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'chat' | 'edit'>('chat');

  useEffect(() => {
    try {
      const personaData = localStorage.getItem('persona');
      const chatHistoryData = localStorage.getItem('chatHistory');

      if (personaData) {
        setPersona(JSON.parse(personaData));
      } else {
        throw new Error('No persona data found. Please create a persona first.');
      }

      if (chatHistoryData) {
        setInitialMessages(JSON.parse(chatHistoryData));
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefineClick = (dimension: string) => {
    // Note: chat history is already saved in the chat component
    router.push(`/swipe?refine=${encodeURIComponent(dimension)}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <Loader className="animate-spin mb-4" size={48} />
        <div className="text-2xl font-semibold">Loading Persona...</div>
      </div>
    );
  }

  if (error || !persona) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-2xl text-red-500">{error || 'Could not load persona.'}</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-white text-black overflow-hidden relative">
      <AnimatePresence>
        {view === 'chat' && (
          <motion.div
            key="chat-view"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute top-0 right-0 h-full w-1/2"
          >
            <PersonaChat
              persona={persona}
              handleRefineClick={handleRefineClick}
              initialMessages={initialMessages}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {view === 'edit' && (
           <motion.div
            key="edit-view"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute top-0 left-0 h-full w-1/2 p-12 overflow-y-auto"
           >
            <button onClick={() => setView('chat')} className="absolute top-8 right-8 flex items-center gap-2 text-sm font-semibold">
                <ArrowLeft size={16} />
                Back To Chat
            </button>
            <h1 className="text-4xl font-bold">{persona.name}</h1>
            <p className="text-lg text-gray-600 mt-1">{persona.age} years old</p>
            <p className="text-lg text-gray-600">{persona.role} - {persona.experience}</p>
            
            <div className="mt-8 space-y-6 text-base">
              <div>
                <h3 className="font-bold mb-2 text-gray-800">Bio</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{persona.bio}</p>
              </div>
              <div>
                <h3 className="font-bold mb-2 text-gray-800">Interests</h3>
                <p className="text-gray-700">{persona.interests}</p>
              </div>
              <div>
                <h3 className="font-bold mb-2 text-gray-800">Disinterests</h3>
                <p className="text-gray-700">{persona.disinterests}</p>
              </div>
            </div>
            <div className="mt-8 text-sm text-gray-500">
                <p>Scroll down to continue reading</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layoutId="persona-image"
        className="absolute bottom-0 w-1/2 h-4/5"
        style={{
            left: view === 'chat' ? 0 : 'auto',
            right: view === 'edit' ? 0 : 'auto',
        }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {persona.imageUrl && (
            <Image
                src={persona.imageUrl}
                alt={persona.name}
                fill
                className="object-contain object-bottom"
                priority
            />
        )}
        {view === 'chat' && (
            <button
                onClick={() => setView('edit')}
                className="absolute top-8 left-8 flex items-center gap-2 text-sm font-semibold z-10"
            >
                <Edit size={16} />
                Edit Persona
            </button>
        )}
      </motion.div>
    </div>
  );
}

export default function PersonaPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <Loader className="animate-spin mb-4" size={48} />
        <div className="text-2xl font-semibold">Loading Page...</div>
      </div>
    }>
      <PersonaPageContent />
    </Suspense>
  );
} 