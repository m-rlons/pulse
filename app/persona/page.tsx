'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Persona, ChatMessage, Document } from '../../lib/types';
import { Loader, ArrowLeft, Send, UploadCloud, FileText, Trash2 } from 'lucide-react';

// --- Main Page Component ---
function PersonaPageContent() {
    const [persona, setPersona] = useState<Persona | null>(null);
    const [view, setView] = useState<'bio' | 'chat' | 'workspace'>('bio');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const personaId = searchParams.get('id');

    useEffect(() => {
        if (!personaId) {
            setError("No persona ID specified.");
            setIsLoading(false);
            return;
        }
        try {
            const personasData = localStorage.getItem('personas');
            if (!personasData) throw new Error("No personas found.");
            const personas: Persona[] = JSON.parse(personasData);
            const currentPersona = personas.find(p => p.id === personaId);
            if (!currentPersona) throw new Error("Persona not found.");
            setPersona(currentPersona);
        } catch (e: any) {
            setError(e.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [personaId]);

    // Animation transitions
    const transition = { duration: 1.2, ease: [0.76, 0, 0.24, 1] };
    
    // Canvas position states
    const canvasX = view === 'bio' ? '0vw' : '-66.66vw';
    const interactiveY = view === 'workspace' ? '0vh' : '-100vh';

    if (isLoading) {
        return <div className="min-h-screen w-full flex items-center justify-center bg-white"><Loader className="animate-spin text-gray-400" /></div>;
    }
    
    if (error || !persona) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white text-black p-8 text-center">
                <h1 className="text-2xl font-bold text-red-500">Could not load Persona</h1>
                <p className="mt-2 text-gray-600 max-w-md">{error || "Persona data is missing."}</p>
                <Link href="/staff" className="mt-6 px-4 py-2 bg-gray-100 text-black rounded-full text-sm font-semibold hover:bg-gray-200">Go to Staff Directory</Link>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 w-screen h-screen bg-white text-black overflow-hidden">
            {/* Main Canvas - 166.66vw wide */}
            <motion.div
                className="absolute top-0 left-0 flex"
                style={{ width: '166.66vw', height: '100vh' }}
                animate={{ x: canvasX }}
                transition={transition}
            >
                {/* Column 1: Bio (66.66vw) */}
                <div className="w-[66.66vw] h-screen flex flex-col justify-center items-end p-16">
                    <div className="w-full max-w-2xl">
                        <Link href={`/swipe?refine=core&personaId=${persona.id}`} className="text-sm font-semibold text-gray-400 hover:text-black transition-colors">↳ Edit</Link>
                        <h1 className="text-6xl font-bold mt-2 text-black">{persona.name}</h1>
                        <p className="text-xl text-gray-500 mt-2">{persona.age} years old</p>
                        <p className="text-xl text-gray-500">{persona.role} - {persona.experience}</p>
                        <div className="mt-12 space-y-8 text-base text-gray-800 border-t border-gray-200 pt-8">
                            <div><h3 className="font-bold mb-2 text-black tracking-wider uppercase text-sm">Bio</h3><p className="whitespace-pre-wrap leading-relaxed">{persona.bio}</p></div>
                            <div><h3 className="font-bold mb-2 text-black tracking-wider uppercase text-sm">Interests</h3><p className="leading-relaxed">{persona.interests}</p></div>
                            <div><h3 className="font-bold mb-2 text-black tracking-wider uppercase text-sm">Disinterests</h3><p className="leading-relaxed">{persona.disinterests}</p></div>
                        </div>
                    </div>
                </div>

                {/* Column 2: Persona (33.34vw) */}
                <div className="w-[33.34vw] h-screen flex flex-col justify-end items-center relative">
                    {persona.imageUrl && (
                        <Image 
                            src={persona.imageUrl} 
                            alt={persona.name} 
                            width={600} height={900}
                            className="h-[90vh] w-full object-contain object-bottom"
                            priority 
                        />
                    )}
                    {/* Navigation Controls overlayed on persona image */}
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
                </div>

                {/* Column 3: Interactive (66.66vw) */}
                <div className="w-[66.66vw] h-screen relative overflow-hidden">
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
                                                I'm {persona.name}, it's so nice to meet you.
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
                </div>
            </motion.div>

            {/* Static Navigation Elements */}
            <div className="fixed top-8 left-8 z-30">
                <Link href="/staff" className="flex items-center gap-2 text-sm font-semibold bg-gray-100/80 backdrop-blur-md px-4 py-2 rounded-full hover:bg-gray-200/80 transition-colors border border-gray-200">
                    <ArrowLeft size={16} />
                    Staff Directory
                </Link>
            </div>
        </div>
    );
}

// Remove the separate view components since they're now integrated into the main component
export default function PersonaPage() {
    return <Suspense fallback={null}><PersonaPageContent /></Suspense>;
} 