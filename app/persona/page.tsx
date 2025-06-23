'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Persona } from '../../lib/types';
import { Loader, ArrowLeft, Plus, Send, UploadCloud } from 'lucide-react';

function UnifiedPersonasArea() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [staffOpen, setStaffOpen] = useState(false);
  const [view, setView] = useState<'bio' | 'chat' | 'workspace'>('bio');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const personasData = localStorage.getItem('personas');
    if (personasData) {
      const parsed = JSON.parse(personasData);
      setPersonas(parsed);
      if (parsed.length > 0) {
        setSelectedPersona(parsed[0]);
      }
    }
    setIsLoading(false);
  }, []);

  // Handler for selecting a persona in the staff directory
  const handlePersonaSelect = (persona: Persona) => {
    setSelectedPersona(persona);
    setStaffOpen(false);
    setView('bio');
  };

  // Animation transitions
  const transition = { duration: 1.2, ease: [0.76, 0, 0.24, 1] };
  const canvasX = view === 'bio' ? '0vw' : '-66.66vw';
  const interactiveY = view === 'workspace' ? '0vh' : '-100vh';

  if (isLoading) {
    return <div className="min-h-screen w-full flex items-center justify-center bg-white"><Loader className="animate-spin text-gray-400" /></div>;
  }

  // If no persona is selected, show staff directory by default
  if (!selectedPersona || staffOpen) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-white text-black overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 flex"
          style={{ width: '100vw', height: '100vh' }}
        >
          {/* Staff Directory (full column) */}
          <motion.div
            className="h-screen flex flex-col items-center justify-start bg-white overflow-y-auto p-8 w-full"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={transition}
          >
            <div className="w-full flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Your Staff</h1>
              <Link href="/" className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
                <Plus size={20} />
                New Persona
              </Link>
            </div>
            {personas.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500">You haven't generated any personas yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {personas.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handlePersonaSelect(p)}
                    className="block w-full bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow border text-left"
                  >
                    <div className="aspect-square bg-gray-100 rounded-md mb-4 overflow-hidden">
                      {p.imageUrl && (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <h2 className="font-bold text-lg">{p.name}</h2>
                    <p className="text-sm text-gray-600">{p.role}</p>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Persona view (with navigation and workspace/chat)
  return (
    <div className="fixed inset-0 w-screen h-screen bg-white text-black overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 flex"
        style={{ width: '166.66vw', height: '100vh' }}
        animate={{ x: canvasX }}
        transition={transition}
      >
        {/* Column 1: Bio (66.66vw) - always visible */}
        <motion.div
          className="h-screen flex flex-col justify-center items-end p-16"
          style={{ width: '66.66vw' }}
          transition={transition}
        >
          {selectedPersona && (
            <div className="w-full max-w-2xl">
              <h1 className="text-6xl font-bold mt-2 text-black">{selectedPersona.name}</h1>
              <p className="text-xl text-gray-500 mt-2">{selectedPersona.age} years old</p>
              <p className="text-xl text-gray-500">{selectedPersona.role} - {selectedPersona.experience}</p>
              <div className="mt-12 space-y-8 text-base text-gray-800 border-t border-gray-200 pt-8">
                <div><h3 className="font-bold mb-2 text-black tracking-wider uppercase text-sm">Bio</h3><p className="whitespace-pre-wrap leading-relaxed">{selectedPersona.bio}</p></div>
                <div><h3 className="font-bold mb-2 text-black tracking-wider uppercase text-sm">Interests</h3><p className="leading-relaxed">{selectedPersona.interests}</p></div>
                <div><h3 className="font-bold mb-2 text-black tracking-wider uppercase text-sm">Disinterests</h3><p className="leading-relaxed">{selectedPersona.disinterests}</p></div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Column 2: Persona/Staff Directory (33.34vw) - content scrolls/animates vertically */}
        <motion.div
          className="h-screen flex flex-col items-center relative overflow-hidden"
          style={{ width: '33.34vw', transition: 'width 1.2s cubic-bezier(0.76,0,0.24,1)' }}
        >
          <motion.div
            className="absolute inset-0 w-full"
            style={{ height: '200vh' }}
            animate={{ y: staffOpen ? '-100vh' : '0vh' }}
            transition={transition}
          >
            {/* Top: Persona image + navigation (only when staffOpen is false) */}
            <div className="h-screen flex flex-col justify-end items-center relative">
              {!staffOpen && selectedPersona && selectedPersona.imageUrl && (
                <Image
                  src={selectedPersona.imageUrl}
                  alt={selectedPersona.name}
                  width={600} height={900}
                  className="h-[90vh] w-full object-contain object-bottom"
                  priority
                />
              )}
              {/* Navigation Controls overlayed on persona image */}
              {!staffOpen && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
                  <div className="flex items-center gap-2 p-1.5 bg-gray-200/80 backdrop-blur-lg rounded-full shadow-lg border border-gray-300">
                    <button
                      onClick={() => setView('bio')}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${view === 'bio' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'}`}
                    >
                      Bio
                    </button>
                    <button
                      onClick={() => setView('chat')}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${view === 'chat' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'}`}
                    >
                      Chat
                    </button>
                    <button
                      onClick={() => setView('workspace')}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${view === 'workspace' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'}`}
                    >
                      Workspace
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Bottom: Staff Directory (only when staffOpen is true) */}
            <div className="h-screen flex flex-col items-center justify-start bg-white overflow-y-auto p-8">
              {staffOpen && (
                <>
                  <div className="w-full flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Your Staff</h1>
                    <Link href="/" className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
                      <Plus size={20} />
                      New Persona
                    </Link>
                  </div>
                  {personas.length === 0 ? (
                    <div className="text-center py-20">
                      <p className="text-gray-500">You haven't generated any personas yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                      {personas.map(p => (
                        <button
                          key={p.id}
                          onClick={() => handlePersonaSelect(p)}
                          className="block w-full bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow border text-left"
                        >
                          <div className="aspect-square bg-gray-100 rounded-md mb-4 overflow-hidden">
                            {p.imageUrl && (
                              <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <h2 className="font-bold text-lg">{p.name}</h2>
                          <p className="text-sm text-gray-600">{p.role}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  <button onClick={() => setStaffOpen(false)} className="mt-8 px-4 py-2 bg-gray-100 text-black rounded-full text-sm font-semibold hover:bg-gray-200 flex items-center gap-2"><ArrowLeft size={16}/> Back</button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Column 3: Workspace/Chat (66.66vw) - always visible */}
        <motion.div
          className="h-screen relative overflow-hidden"
          style={{ width: '66.66vw' }}
          transition={transition}
        >
          {!staffOpen && (
            <motion.div
              className="absolute inset-0 w-full"
              style={{ height: '200vh' }}
              animate={{ y: interactiveY }}
              transition={transition}
            >
              {/* Row 1: Workspace (100vh) */}
              <div className="w-full h-screen p-16">
                <div className="h-full flex flex-col">
                  <h2 className="text-3xl font-bold mb-8">Workspace</h2>
                  <div className="flex-1 overflow-y-auto">
                    <div className="space-y-12">
                      <section>
                        <h3 className="text-xl font-semibold mb-6">Generated Documents</h3>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
                          <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
                          <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
                          <div className="flex items-center justify-center font-semibold text-gray-500">View More</div>
                        </div>
                      </section>
                      <section>
                        <h3 className="text-xl font-semibold mb-6">Uploaded Documents</h3>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
                          <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
                          <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
                          <div className="flex items-center justify-center font-semibold text-gray-500">View More</div>
                        </div>
                      </section>
                    </div>
                  </div>
                  <button className="mt-8 px-6 py-3 bg-black text-white rounded-lg font-semibold flex items-center gap-2">
                    <UploadCloud size={20} />
                    Upload New File
                  </button>
                </div>
              </div>

              {/* Row 2: Chat (100vh) */}
              <div className="w-full h-screen p-16">
                <div className="h-full flex flex-col">
                  <h2 className="text-3xl font-bold mb-8">Chat</h2>
                  <div className="flex-1 overflow-y-auto">
                    <div className="space-y-4">
                      <div className="flex justify-start">
                        <div className="p-3 px-4 rounded-2xl bg-black text-white max-w-md">
                          I'm {selectedPersona?.name}, it's so nice to meet you.
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="p-3 px-4 rounded-2xl bg-black text-white max-w-md">
                          I'm eager to get started.
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8">
                    <div className="flex gap-4">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10"
                      />
                      <button className="px-6 py-3 bg-black text-white rounded-lg font-semibold flex items-center gap-2">
                        <Send size={20} />
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Top-left Staff Directory button */}
      {!staffOpen && (
        <div className="fixed top-8 left-8 z-30">
          <button
            onClick={() => setStaffOpen(true)}
            className="flex items-center gap-2 text-sm font-semibold bg-gray-100/80 backdrop-blur-md px-4 py-2 rounded-full hover:bg-gray-200/80 transition-colors border border-gray-200"
          >
            <ArrowLeft size={16} />
            Staff Directory
          </button>
        </div>
      )}
    </div>
  );
}

export default function PersonaPage() {
  return <Suspense fallback={null}><UnifiedPersonasArea /></Suspense>;
} 