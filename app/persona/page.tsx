'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Persona, Bento } from '../../lib/types';
import { Loader, ArrowLeft, Plus, Send, UploadCloud, Building } from 'lucide-react';
import { BentoBox } from '../../components/BentoBox';

function UnifiedPersonasArea() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [staffOpen, setStaffOpen] = useState(false);
  const [view, setView] = useState<'bio' | 'bento' | 'chat' | 'workspace'>('bio');
  const [isLoading, setIsLoading] = useState(true);
  const [staffExpanded, setStaffExpanded] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    // Initial greeting from persona
    { role: 'persona', content: selectedPersona ? `I'm ${selectedPersona.name}, it's so nice to meet you.` : '' },
    { role: 'persona', content: `I'm eager to get started.` },
  ]);
  const chatEndRef = useRef(null);
  const [showOptions, setShowOptions] = useState(false);
  const [bentoData, setBentoData] = useState<Bento | null>(null);

  useEffect(() => {
    const personasData = localStorage.getItem('personas');
    if (personasData) {
      const parsed = JSON.parse(personasData);
      setPersonas(parsed);
      if (parsed.length > 0) {
        setSelectedPersona(parsed[0]);
        // Also load the bento data if it exists
        const bentoStore = localStorage.getItem('bento');
        if (bentoStore) {
          const bentoForPersona = JSON.parse(bentoStore);
          // This assumes one bento for now, we can expand later
          setBentoData(bentoForPersona);
        }
      }
    }
    setIsLoading(false);
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      (chatEndRef.current as any).scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Reset chat when persona changes
  useEffect(() => {
    if (selectedPersona) {
      setChatMessages([
        { role: 'persona', content: `I'm ${selectedPersona.name}, it's so nice to meet you.` },
        { role: 'persona', content: `I'm eager to get started.` },
      ]);
    }
  }, [selectedPersona]);

  // Replace sendMessage and plus button logic:
  const insertModeEmoji = (emoji: string) => {
    if (!chatInput.startsWith(emoji)) {
      setChatInput(emoji + ' ' + chatInput.trim());
    }
    setShowOptions(false);
  };

  const parseModeFromInput = (input: string) => {
    if (input.startsWith('📸')) return { generateImage: true };
    if (input.startsWith('📄')) return { generateImage: false };
    return { generateImage: false };
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !selectedPersona) return;
    const opts = parseModeFromInput(chatInput);
    const cleanInput = chatInput.replace(/^([📸📄])\s*/, '');
    const userMessage = { role: 'user', content: cleanInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setShowOptions(false);
    try {
      const { imageUrl, ...personaDataForAPI } = selectedPersona;
      const res = await fetch('/api/chat-with-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: personaDataForAPI,
          chatHistory: [...chatMessages, userMessage],
          generateImage: opts.generateImage,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: 'persona', content: data.response }]);
      } else {
        const errorData = await res.json().catch(() => ({ details: 'Could not parse error response.' }));
        console.error("Chat API Error:", errorData);
        setChatMessages(prev => [...prev, { role: 'persona', content: `Sorry, something went wrong. ${errorData.details || ''}` }]);
      }
    } catch (e){
      console.error("Chat Fetch Error:", e);
      setChatMessages(prev => [...prev, { role: 'persona', content: 'Sorry, something went wrong.' }]);
    }
  };

  // Handle Enter key in chat input
  const handleChatInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handler for opening staff directory
  const handleOpenStaffDirectory = () => {
    setStaffOpen(true);
    setTimeout(() => setStaffExpanded(true), 10); // allow vertical scroll first, then expand width
  };

  // Handler for selecting a persona
  const handlePersonaSelect = (persona: Persona) => {
    setSelectedPersona(persona);
    // For now, we assume the single generated bento belongs to all personas.
    // This can be changed later to support multiple bentos.
    const bentoStore = localStorage.getItem('bento');
    if (bentoStore) {
      setBentoData(JSON.parse(bentoStore));
    } else {
      setBentoData(null);
    }
    setStaffExpanded(false);
    setTimeout(() => setStaffOpen(false), 600); // allow width contract first, then scroll down
    setView('bio');
  };

  // Animation transitions
  const transition = { duration: 1.2, ease: [0.76, 0, 0.24, 1] };
  const canvasX = view === 'chat' || view === 'workspace' ? '-66.66vw' : '0vw';
  const bioY = view === 'bento' ? '0vh' : '-100vh';
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
        style={{ width: staffExpanded ? '100vw' : '166.66vw', height: '100vh' }}
        animate={{ x: canvasX }}
        transition={transition}
      >
        {/* Column 1: Bio / Bento (66.66vw) */}
        <motion.div
          className="relative h-screen overflow-hidden"
          style={{ width: '66.66vw', display: staffExpanded ? 'none' : 'block' }}
        >
          <motion.div
            className="absolute inset-0 w-full"
            style={{ height: '200vh' }}
            animate={{ y: bioY }}
            transition={transition}
          >
            {/* Top: Bento View */}
            <div className="h-screen w-full flex flex-col justify-center items-center p-8 bg-gray-50 overflow-y-auto">
              {bentoData ? (
                <BentoBox bento={bentoData} />
              ) : (
                <div className="text-center text-gray-500">
                  <Building size={48} className="mx-auto mb-4" />
                  <h2 className="text-2xl font-bold">No Bento Box Yet</h2>
                  <p>Generate a Bento Box from the main screen to see it here.</p>
                </div>
              )}
            </div>
            {/* Bottom: Bio View */}
            <div className="h-screen w-full flex flex-col justify-center items-end p-16 bg-white">
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
            </div>
          </motion.div>
        </motion.div>

        {/* Column 2: Persona/Staff Directory (33.34vw or 100vw) */}
        <motion.div
          className="h-screen flex flex-col items-center relative overflow-hidden"
          style={{ width: staffExpanded ? '100vw' : '33.34vw', transition: 'width 1.2s cubic-bezier(0.76,0,0.24,1)' }}
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
                      onClick={() => setView('bento')}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${view === 'bento' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'}`}
                    >
                      Bento
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
                  <button onClick={() => handlePersonaSelect(selectedPersona)} className="mt-8 px-4 py-2 bg-gray-100 text-black rounded-full text-sm font-semibold hover:bg-gray-200 flex items-center gap-2"><ArrowLeft size={16}/> Back</button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Column 3: Workspace/Chat (66.66vw) - always present but out of view when staffExpanded */}
        <motion.div
          className="h-screen relative overflow-hidden"
          style={{ width: '66.66vw', display: staffExpanded ? 'none' : 'block' }}
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
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-3 px-4 rounded-2xl ${msg.role === 'user' ? 'bg-gray-200 text-black' : 'bg-black text-white'} max-w-md`}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                  </div>
                  <div className="mt-8">
                    <div className="flex gap-4 items-center relative">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={handleChatInputKeyDown}
                        style={{ paddingLeft: chatInput.startsWith('📸') || chatInput.startsWith('📄') ? '2.5rem' : undefined }}
                      />
                      <AnimatePresence>
                        {showOptions ? (
                          <motion.div
                            key="options"
                            initial={{ opacity: 0, x: 0 }}
                            animate={{ opacity: 1, x: -120 }}
                            exit={{ opacity: 0, x: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className="absolute right-24 flex flex-col gap-2 z-10"
                          >
                            <button
                              className="rounded-full px-6 py-3 font-semibold text-lg flex items-center gap-2 bg-blue-100 text-black hover:bg-blue-200 transition-colors shadow"
                              onClick={() => insertModeEmoji('📄')}
                            >
                              <span role="img" aria-label="document">📄</span> Create Document
                            </button>
                            <button
                              className="rounded-full px-6 py-3 font-semibold text-lg flex items-center gap-2 bg-red-100 text-black hover:bg-red-200 transition-colors shadow"
                              onClick={() => insertModeEmoji('📸')}
                            >
                              <span role="img" aria-label="image">📸</span> Create Image
                            </button>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                      <AnimatePresence>
                        {!showOptions ? (
                          <motion.button
                            key="plus"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className="rounded-full w-12 h-12 flex items-center justify-center bg-yellow-400 text-white text-2xl shadow hover:bg-yellow-500 transition-colors"
                            onClick={() => setShowOptions(true)}
                            style={{ marginRight: '0.5rem' }}
                          >
                            +
                          </motion.button>
                        ) : (
                          <motion.button
                            key="close"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className="rounded-full w-12 h-12 flex items-center justify-center bg-red-500 text-white text-2xl shadow hover:bg-red-600 transition-colors"
                            onClick={() => setShowOptions(false)}
                            style={{ marginRight: '0.5rem' }}
                          >
                            ×
                          </motion.button>
                        )}
                      </AnimatePresence>
                      <button
                        className="px-6 py-3 bg-black text-white rounded-full font-semibold flex items-center gap-2"
                        onClick={sendMessage}
                        disabled={!chatInput.trim()}
                      >
                        <Send size={20} />
                        <span className="sr-only">Send</span>
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
            onClick={handleOpenStaffDirectory}
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