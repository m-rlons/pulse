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
    
    // --- Animation Variants ---
    const transition = { duration: 0.7, ease: "easeInOut" };

    const personaVariants = {
        bio: { x: "100%", y: "0%", scale: 1, opacity: 1 },
        chat: { x: "0%", y: "0%", scale: 1, opacity: 1 },
        workspace: { x: "50%", y: "100%", scale: 0.4, opacity: 1 }
    };

    // Add a placeholder image component
    const PersonaImagePlaceholder = ({ name }: { name: string }) => (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="text-6xl font-bold text-gray-300">
                {name.charAt(0)}
            </div>
        </div>
    );

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
        <div className="min-h-screen w-full bg-white text-black relative">
            {/* --- Static Staff Directory Link --- */}
            <div className="fixed top-8 left-8 z-30">
                <Link href="/staff" className="flex items-center gap-2 text-sm font-semibold bg-gray-100/80 backdrop-blur-md px-4 py-2 rounded-full hover:bg-gray-200/80 transition-colors border border-gray-200">
                    <ArrowLeft size={16} />
                    Staff Directory
                </Link>
            </div>

            {/* --- Animated Content Panes --- */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 z-10 flex"
                >
                    {view === 'bio' && (
                        <div className="w-full flex justify-between">
                            <BioView persona={persona} />
                            <motion.div 
                                className="w-1/2 h-full relative"
                                initial={{ x: 50 }}
                                animate={{ x: 0 }}
                                transition={transition}
                            >
                                {persona.imageUrl && (
                                    <Image 
                                        src={persona.imageUrl} 
                                        alt={persona.name} 
                                        layout="fill" 
                                        className="object-cover"
                                        priority 
                                    />
                                )}
                            </motion.div>
                        </div>
                    )}
                    {view === 'chat' && (
                        <div className="w-full flex">
                            <motion.div 
                                className="w-1/2 h-full relative"
                                initial={{ x: -50 }}
                                animate={{ x: 0 }}
                                transition={transition}
                            >
                                {persona.imageUrl && (
                                    <Image 
                                        src={persona.imageUrl} 
                                        alt={persona.name} 
                                        layout="fill" 
                                        className="object-cover"
                                        priority 
                                    />
                                )}
                            </motion.div>
                            <ChatView persona={persona} />
                        </div>
                    )}
                    {view === 'workspace' && (
                        <div className="w-full h-full flex flex-col">
                            <WorkspaceView persona={persona} />
                            <motion.div 
                                className="w-1/3 h-1/3 relative mx-auto"
                                initial={{ y: 50 }}
                                animate={{ y: 0 }}
                                transition={transition}
                            >
                                {persona.imageUrl && (
                                    <Image 
                                        src={persona.imageUrl} 
                                        alt={persona.name} 
                                        layout="fill" 
                                        className="object-cover"
                                        priority 
                                    />
                                )}
                            </motion.div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* --- Navigation --- */}
            <motion.div 
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30"
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                transition={{delay: 0.3}}
            >
                <div className="flex items-center gap-2 p-1.5 bg-gray-200/80 backdrop-blur-lg rounded-full shadow-lg border border-gray-300">
                    {view !== 'bio' && <button onClick={() => setView('bio')} className="px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors bg-white text-black">Bio</button>}
                    {view !== 'chat' && <button onClick={() => setView('chat')} className="px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors bg-white text-black">Chat</button>}
                    {view !== 'workspace' && <button onClick={() => setView('workspace')} className="px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors bg-white text-black">Workspace</button>}
                </div>
            </motion.div>
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