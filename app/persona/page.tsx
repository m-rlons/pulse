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

    // Animation logic
    const transition = { duration: 1.2, ease: [0.76, 0, 0.24, 1] };
    // Horizontal slide for canvas
    const x = view === 'bio' ? '0vw' : '-66.66vw';
    // Vertical slide for interactive column
    const y = view === 'workspace' ? '0vh' : '-100vh';

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
        <div className="min-h-screen w-full bg-white text-black relative overflow-hidden">
            <motion.div
                className="absolute top-0 left-0 flex"
                style={{ width: '166.66vw', height: '100vh' }}
                animate={{ x }}
                transition={transition}
            >
                {/* Column 1: Bio */}
                <div className="w-[66.66vw] h-screen flex flex-col justify-center items-end p-16">
                    <div className="w-full flex flex-col gap-8">
                        <BioView persona={persona} />
                        {/* Future: Add more stacked panes here if needed */}
                    </div>
                </div>
                {/* Column 2: Persona */}
                <div className="w-[33.34vw] h-screen flex flex-col justify-end items-center">
                    <div className="w-full flex justify-center items-end">
                        {persona.imageUrl && (
                            <Image 
                                src={persona.imageUrl} 
                                alt={persona.name} 
                                width={600} height={900}
                                className="h-[90vh] w-full object-contain object-bottom"
                                priority 
                            />
                        )}
                    </div>
                </div>
                {/* Column 3: Interactive */}
                <div className="w-[66.66vw] h-screen flex flex-col justify-center items-start p-16 relative overflow-hidden">
                    <motion.div
                        className="w-full h-[200vh] absolute top-0 left-0"
                        animate={{ y }}
                        transition={transition}
                    >
                        <div className="w-full h-screen flex flex-col gap-8">
                            <WorkspaceView persona={persona} />
                            {/* Future: Add more stacked panes here if needed */}
                        </div>
                        <div className="w-full h-screen flex flex-col gap-8">
                            <ChatView persona={persona} />
                            {/* Future: Add more stacked panes here if needed */}
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Static Staff Directory Link */}
            <div className="fixed top-8 left-8 z-30">
                <Link href="/staff" className="flex items-center gap-2 text-sm font-semibold bg-gray-100/80 backdrop-blur-md px-4 py-2 rounded-full hover:bg-gray-200/80 transition-colors border border-gray-200">
                    <ArrowLeft size={16} />
                    Staff Directory
                </Link>
            </div>

            {/* Navigation Controls */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
                <div className="flex items-center gap-2 p-1.5 bg-gray-200/80 backdrop-blur-lg rounded-full shadow-lg border border-gray-300">
                    <button onClick={() => setView('bio')} className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${view === 'bio' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'}`}>Bio</button>
                    <button onClick={() => setView('chat')} className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${view === 'chat' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'}`}>Chat</button>
                    <button onClick={() => setView('workspace')} className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${view === 'workspace' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'}`}>Workspace</button>
                </div>
            </div>
        </div>
    );
}

// --- View-Specific Components (Content Panes) ---

const BioView: React.FC<{ persona: Persona }> = ({ persona }) => (
    <div className="absolute right-0 w-1/2 h-full overflow-y-auto">
         <div className="max-w-xl mx-auto px-12 py-32">
            <Link href={`/swipe?refine=core&personaId=${persona.id}`} className="text-sm font-semibold text-gray-400 hover:text-black transition-colors">↳ Edit</Link>
            <h1 className="text-6xl font-bold mt-2 text-black">{persona.name}</h1>
            <p className="text-xl text-gray-500 mt-2">{persona.age} years old</p>
            <p className="text-xl text-gray-500">{persona.role} - {persona.experience}</p>
            <div className="mt-12 space-y-8 text-base text-gray-800 border-t border-gray-200 pt-8">
                <div><h3 className="font-bold mb-2 text-black tracking-wider uppercase text-sm">Bio</h3><p className="whitespace-pre-wrap leading-relaxed">{persona.bio}</p></div>
                <div><h3 className="font-bold mb-2 text-black tracking-wider uppercase text-sm">Interests</h3><p className="leading-relaxed">{persona.interests}</p></div>
                <div><h3 className="font-bold mb-2 text-black tracking-wider uppercase text-sm">Disinterests</h3><p className="leading-relaxed">{persona.disinterests}</p></div>
            </div>
            <p className="mt-12 text-sm text-gray-400">↓ SCROLL TO CONTINUE READING</p>
        </div>
    </div>
);

const ChatView: React.FC<{ persona: Persona }> = ({ persona }) => {
    // NOTE: Using a simplified, non-functional chat view for layout first.
    // The functional chat logic can be wired back in after layout is approved.
    return (
        <div className="absolute right-0 w-1/2 h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-8 space-y-4">
                {/* Example Chat Bubbles */}
                <div className="flex justify-start"><div className="p-3 px-4 rounded-2xl bg-black text-white max-w-md">I'm Julia, it's so nice to meet you.</div></div>
                <div className="flex justify-start"><div className="p-3 px-4 rounded-2xl bg-black text-white max-w-md">I'm eager to get started.</div></div>
                 <div className="flex justify-start"><div className="p-3 px-4 rounded-2xl bg-black text-white max-w-md">Should I introduce myself or do you want to jump straight into it?</div></div>
                 <div className="flex justify-start"><div className="p-3 px-4 rounded-2xl bg-black text-white max-w-md">I can help with marketing plans, copy editing, or just business strategy.</div></div>
            </div>
            <div className="p-8">
                <input className="w-full p-4 border border-gray-400 rounded-lg" placeholder="what do you do?" />
            </div>
        </div>
    );
};

const WorkspaceView: React.FC<{ persona: Persona }> = ({ persona }) => (
    <div className="w-full h-full flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Generated Documents</h1>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-12">
            <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
            <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
            <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
            <div className="flex items-center justify-center font-semibold text-gray-500">View More</div>
        </div>
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Uploaded Documents</h1>
        </div>
        <div className="grid grid-cols-4 gap-4">
            <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
            <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
             <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
            <div className="flex items-center justify-center font-semibold text-gray-500">View More</div>
        </div>
         <button className="absolute bottom-8 right-8 font-semibold">Upload New File</button>
    </div>
);


export default function PersonaPage() {
    return <Suspense fallback={null}><PersonaPageContent /></Suspense>;
} 