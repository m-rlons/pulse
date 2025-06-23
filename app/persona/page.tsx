'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Persona, ChatMessage, Document } from '../../lib/types';
import { Loader, ArrowLeft, Send, UploadCloud, FileText, Trash2 } from 'lucide-react';

// --- Reusable View Components ---

const BioContent: React.FC<{ persona: Persona }> = ({ persona }) => (
    <div className="w-full h-full overflow-y-auto bg-white">
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
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    // Load chat history on mount
    useEffect(() => {
        const storedMessages = localStorage.getItem(`chatHistory_${persona.id}`);
        if (storedMessages) {
            setMessages(JSON.parse(storedMessages));
        } else {
            setMessages([{ role: 'persona', content: `Hello! I'm ${persona.name}. I'm ready to chat about our business context. What's on your mind?` }]);
        }
        setIsMounted(true);
    }, [persona.id, persona.name]);

    // Save chat history on change
    useEffect(() => {
        if (isMounted) { // Prevent saving initial empty/default state
            localStorage.setItem(`chatHistory_${persona.id}`, JSON.stringify(messages));
        }
    }, [messages, persona.id, isMounted]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);
        
        // Add a placeholder for the persona's response
        setMessages(prev => [...prev, { role: 'persona', content: '' }]);

        try {
            const response = await fetch('/api/chat-with-persona', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    persona,
                    chatHistory: newMessages.slice(0, -1) // Don't include the user's latest message in the history sent
                }),
            });

            if (!response.body) throw new Error("Response body is null");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                const chunk = decoder.decode(value, { stream: true });
                
                setMessages(currentMessages => {
                    const latestMessages = [...currentMessages];
                    const lastMessage = latestMessages[latestMessages.length - 1];
                    if (lastMessage.role === 'persona') {
                        lastMessage.content += chunk;
                    }
                    return latestMessages;
                });
            }

        } catch (error) {
            console.error("Chat API error:", error);
            setMessages(currentMessages => {
                const latestMessages = [...currentMessages];
                const lastMessage = latestMessages[latestMessages.length - 1];
                if (lastMessage.role === 'persona' && lastMessage.content === '') {
                    lastMessage.content = "Sorry, I couldn't get a response. Please try again.";
                }
                return latestMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full w-full flex flex-col bg-black/5 backdrop-blur-xl">
             <div className="flex-1 overflow-y-auto p-4 md:p-8">
                 <div className="max-w-3xl mx-auto space-y-6">
                     {messages.map((msg, index) => (
                         <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                             <div className={`max-w-xl p-3 px-4 rounded-2xl shadow-sm ${msg.role === 'persona' ? 'bg-white/80' : 'bg-blue-500 text-white'}`}>
                                 <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                             </div>
                         </div>
                     ))}
                     {isLoading && messages[messages.length - 1]?.role === 'persona' && (
                         <div className="flex items-start gap-3">
                            <div className="max-w-xl p-3 px-4 rounded-2xl shadow-sm bg-white/80">
                                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></span>
                                <span className="inline-block w-2 h-2 ml-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                                <span className="inline-block w-2 h-2 ml-1 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                         </div>
                     )}
                     <div ref={messagesEndRef} />
                 </div>
             </div>
             <div className="p-4 md:p-8 border-t border-white/10">
                 <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="max-w-3xl mx-auto">
                     <div className="relative">
                         <input 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            className="w-full p-4 pr-12 bg-white/80 rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" 
                            placeholder={`Message ${persona.name}...`}
                            disabled={isLoading}
                        />
                         <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500 disabled:hover:text-gray-500 disabled:opacity-50 transition-colors">
                            <Send size={20} />
                         </button>
                     </div>
                 </form>
             </div>
         </div>
    );
};

const WorkspaceView: React.FC<{ persona: Persona }> = ({ persona }) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const fetchFiles = React.useCallback(async () => {
        if (!persona.id) return;
        setIsLoading(true);
        try {
            const response = await fetch(`/api/files?personaId=${persona.id}`);
            const data = await response.json();
            if (data.success) {
                setDocuments(data.files);
            } else {
                console.error("Failed to fetch files:", data.error);
                setDocuments([]); // Set to empty array on error
            }
        } catch (error) {
            console.error("Error fetching files:", error);
            setDocuments([]);
        } finally {
            setIsLoading(false);
        }
    }, [persona.id]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);
    
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !persona.id) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('personaId', persona.id);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.success) {
                fetchFiles(); // Refresh the file list
            } else {
                alert(`Upload failed: ${data.error}`);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred during upload.');
        } finally {
            setIsUploading(false);
            // Reset file input
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="h-full w-full flex flex-col items-center justify-center p-4 md:p-12 bg-black/5 backdrop-blur-xl">
             <div className="w-full max-w-4xl h-full flex flex-col">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-black">{persona.name}'s Workspace</h1>
                    <p className="text-lg text-gray-700 mt-2">Upload documents to provide context for your chat.</p>
                </div>

                <div className="flex-1 bg-white/80 rounded-xl border border-gray-200/80 shadow-sm p-4 flex flex-col">
                    <div className="flex items-center justify-between p-2 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-black">Uploaded Documents</h2>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        <button 
                            onClick={handleUploadClick}
                            disabled={isUploading}
                            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isUploading ? <Loader size={18} className="animate-spin" /> : <UploadCloud size={18}/>}
                            {isUploading ? 'Uploading...' : 'Upload Document'}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto mt-2">
                        {isLoading ? (
                            <div className="h-full flex items-center justify-center"><Loader className="animate-spin text-gray-400" /></div>
                        ) : documents.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                                {documents.map((doc) => (
                                    <li key={doc.name} className="flex items-center justify-between p-3">
                                        <div className="flex items-center gap-3">
                                            <FileText className="text-gray-500" />
                                            <span className="font-medium text-black">{doc.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>{(doc.size / 1024).toFixed(2)} KB</span>
                                            <span>{new Date(doc.lastModified).toLocaleDateString()}</span>
                                            <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                                <FileText size={48} className="mb-4 text-gray-400" />
                                <h3 className="text-lg font-semibold">No documents yet</h3>
                                <p>Upload a document to get started.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


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
            setError("No persona ID provided in the URL.");
            setIsLoading(false);
            return;
        }
        try {
            const personasData = localStorage.getItem('personas');
            if (!personasData) throw new Error("No personas found in storage.");
            const personas: Persona[] = JSON.parse(personasData);
            const currentPersona = personas.find(p => p.id === personaId);
            if (!currentPersona) throw new Error("Persona with the specified ID was not found.");
            setPersona(currentPersona);
        } catch (e: any) {
            setError(e.message || "An unknown error occurred while loading the persona.");
        } finally {
            setIsLoading(false);
        }
    }, [personaId]);

    if (isLoading) {
        return <div className="h-screen w-full flex items-center justify-center bg-white"><Loader className="animate-spin text-gray-400" /></div>;
    }
    
    if (error) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-white text-black p-8 text-center">
                <h1 className="text-2xl font-bold text-red-500">Could not load Persona</h1>
                <p className="mt-2 text-gray-600 max-w-md">{error}</p>
                <Link href="/staff" className="mt-6 px-4 py-2 bg-gray-100 text-black rounded-full text-sm font-semibold hover:bg-gray-200">Go to Staff Directory</Link>
            </div>
        );
    }

    if (!persona) return null;

    const transition = { duration: 0.8, ease: "easeInOut" };

    return (
        <div className="h-screen w-full bg-white text-black relative overflow-hidden">
            
            {/* Top Left Navigation */}
            <div className="absolute top-8 left-8 z-20">
                <Link href="/staff" className="flex items-center gap-2 text-sm font-semibold bg-gray-100/80 backdrop-blur-md px-4 py-2 rounded-full hover:bg-gray-200/80 transition-colors border border-gray-200">
                    <ArrowLeft size={16} />
                    Staff Directory
                </Link>
            </div>

            {/* Animated Persona Image Background */}
            <motion.div
                className="absolute top-0 right-0 h-full z-0"
                animate={{ width: view === 'bio' ? '50%' : '100%' }}
                transition={transition}
            >
                {persona.imageUrl && (
                    <motion.div
                        className="h-full w-full relative"
                        animate={{ opacity: view === 'bio' ? 1 : 0.05 }}
                        transition={transition}
                    >
                        <Image src={persona.imageUrl} alt={persona.name} layout="fill" className="object-cover" priority />
                    </motion.div>
                )}
            </motion.div>

            {/* Main Content Canvas */}
            <div className="relative z-10 h-full">
                <AnimatePresence mode="wait" initial={false}>
                    {view === 'bio' && (
                        <motion.div
                            key="bio"
                            initial={{ x: '-50vw' }}
                            animate={{ x: '0vw' }}
                            exit={{ x: '-50vw' }}
                            transition={transition}
                            className="w-1/2 h-full"
                        >
                           <BioContent persona={persona} />
                        </motion.div>
                    )}

                    {view === 'chat' && (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="h-full w-full"
                        >
                            <ChatView persona={persona} />
                        </motion.div>
                    )}

                    {view === 'workspace' && (
                        <motion.div
                            key="workspace"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="h-full w-full"
                        >
                            <WorkspaceView persona={persona} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Floating Navigation */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
                 <div className="flex items-center gap-2 p-1.5 bg-gray-100/80 backdrop-blur-lg rounded-full shadow-lg border border-gray-200">
                    <button onClick={() => setView('bio')} className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${view === 'bio' ? 'bg-black text-white' : 'hover:bg-gray-200'}`}>Bio</button>
                    <button onClick={() => setView('chat')} className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${view === 'chat' ? 'bg-black text-white' : 'hover:bg-gray-200'}`}>Chat</button>
                    <button onClick={() => setView('workspace')} className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${view === 'workspace' ? 'bg-black text-white' : 'hover:bg-gray-200'}`}>Workspace</button>
                </div>
            </div>
        </div>
    );
}

export default function PersonaPage() {
    return <Suspense fallback={null}><PersonaPageContent /></Suspense>;
} 