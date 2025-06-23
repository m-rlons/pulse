'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Persona, ChatMessage } from '../../lib/types';
import { Loader, Send, ArrowLeft } from 'lucide-react';

// --- Main Page Component ---
function PersonaPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const personaId = searchParams.get('id');
    const [persona, setPersona] = useState<Persona | null>(null);
    const [view, setView] = useState<'bio' | 'chat' | 'workspace'>('bio');

    useEffect(() => {
        if (personaId) {
            const personasData = localStorage.getItem('personas');
            if (personasData) {
                const personas: Persona[] = JSON.parse(personasData);
                const currentPersona = personas.find(p => p.id === personaId);
                setPersona(currentPersona || null);
            }
        }
    }, [personaId]);

    if (!persona) {
        return <div className="h-screen w-full flex items-center justify-center"><Loader className="animate-spin" /></div>;
    }

    return (
        <div className="h-screen w-full bg-black text-white overflow-hidden">
            {/* Background Persona Image */}
            <motion.div 
                className="absolute inset-0 z-0"
                animate={{ scale: view === 'workspace' ? 1.05 : 1, opacity: view === 'workspace' ? 0.3 : 0.6 }}
                transition={{ duration: 0.5 }}
            >
                {persona.imageUrl && (
                    <Image src={persona.imageUrl} alt={persona.name} layout="fill" className="object-cover" priority />
                )}
            </motion.div>

            {/* Top Left Navigation */}
            <div className="absolute top-8 left-8 z-20">
                <Link href="/staff" className="flex items-center gap-2 text-sm font-semibold bg-black/30 backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-black/50 transition-colors">
                    <ArrowLeft size={16} />
                    Staff Directory
                </Link>
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 h-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                    >
                        {view === 'bio' && <BioView persona={persona} />}
                        {view === 'chat' && <ChatView persona={persona} />}
                        {view === 'workspace' && <WorkspaceView persona={persona} />}
                    </motion.div>
                </AnimatePresence>
            </div>


            {/* Floating Navigation */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
                 <div className="flex items-center gap-2 p-2 bg-black/30 backdrop-blur-lg rounded-full shadow-lg border border-white/20">
                    <button onClick={() => setView('bio')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${view === 'bio' ? 'bg-white text-black' : 'hover:bg-white/20'}`}>Bio</button>
                    <button onClick={() => setView('chat')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${view === 'chat' ? 'bg-white text-black' : 'hover:bg-white/20'}`}>Chat</button>
                    <button onClick={() => setView('workspace')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${view === 'workspace' ? 'bg-white text-black' : 'hover:bg-white/20'}`}>Workspace</button>
                </div>
            </div>
        </div>
    );
}


// --- View-specific Components ---

const BioView: React.FC<{ persona: Persona }> = ({ persona }) => {
    return (
        <div className="h-full flex items-center justify-start text-left p-24">
            <div className="max-w-md">
                <Link href={`/swipe?refine=core&personaId=${persona.id}`} className="text-sm font-semibold text-gray-300 hover:text-white">↳ Edit</Link>
                <h1 className="text-6xl font-bold mt-2">{persona.name}</h1>
                <p className="text-xl text-gray-300 mt-2">{persona.age} years old</p>
                <p className="text-xl text-gray-300">{persona.role} - {persona.experience}</p>
                
                <div className="mt-12 space-y-6 text-base text-gray-200 border-t border-gray-700 pt-6">
                    <div><h3 className="font-bold mb-2 text-white">Bio</h3><p className="whitespace-pre-wrap">{persona.bio}</p></div>
                    <div><h3 className="font-bold mb-2 text-white">Interests</h3><p>{persona.interests}</p></div>
                    <div><h3 className="font-bold mb-2 text-white">Disinterests</h3><p>{persona.disinterests}</p></div>
                </div>
                 <p className="mt-12 text-sm text-gray-500">↓ SCROLL TO CONTINUE READING</p>
            </div>
        </div>
    );
};

const ChatView: React.FC<{ persona: Persona }> = ({ persona }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    // Mock sending logic
    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, { role: 'user', content: input }]);
        setInput('');
    };
    return (
         <div className="h-full flex flex-col items-center justify-end p-8">
            <div className="w-full max-w-2xl space-y-4 mb-4">
                 {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        <div className={`max-w-md p-4 rounded-2xl ${ msg.role === 'persona' ? 'bg-gray-800' : 'bg-blue-600' }`}>
                            <p>{msg.content}</p>
                        </div>
                    </div>
                ))}
            </div>
             <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="w-full max-w-2xl">
                <input value={input} onChange={(e) => setInput(e.target.value)} className="w-full p-4 bg-black/50 rounded-lg backdrop-blur-sm" placeholder="what do you do?" />
            </form>
        </div>
    );
};

const WorkspaceView: React.FC<{ persona: Persona }> = ({ persona }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center p-12">
            <h1 className="text-4xl font-bold">Workspace</h1>
            <p className="text-lg text-gray-400 mt-2">Documents for {persona.name}</p>
            <div className="mt-8 grid grid-cols-2 gap-8">
                <div>
                    <h2 className="font-semibold">Generated Documents</h2>
                    <div className="mt-4 grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white/10 rounded-lg"></div>)}</div>
                </div>
                 <div>
                    <h2 className="font-semibold">Uploaded Documents</h2>
                    <div className="mt-4 grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white/10 rounded-lg"></div>)}</div>
                </div>
            </div>
        </div>
    );
};


export default function PersonaPage() {
    return <Suspense fallback={<div>Loading...</div>}><PersonaPageContent /></Suspense>;
} 