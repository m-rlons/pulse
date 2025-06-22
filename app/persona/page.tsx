'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Persona, ChatMessage, AssessmentResult, Statement, Document } from '../../lib/types';
import { Loader, Send, MessageSquare, FileText, BarChart2 } from 'lucide-react';
import PillNavigation from '../../components/PillNavigation'; // Assuming this component exists

const DIMENSIONS = ["spend", "loyalty", "investment", "interest", "social", "novelty"];

// --- View Components ---

const PersonaView: React.FC<{ persona: Persona; assessmentResults: AssessmentResult[]; onEdit: (dim: string) => void }> = ({ persona, assessmentResults, onEdit }) => {
  const [activeTab, setActiveTab] = useState<'bio' | 'data' | 'refine'>('bio');
  
  const BioPanel = () => (
      <div className="p-8"><h2 className="text-2xl font-bold mb-1">{persona.name}</h2>{/*...bio details...*/}</div>
  );
  
  const DataPanel = () => {
      // ... data panel implementation with dimension scores and swipe history
      return <div className="p-8">Data Panel Content</div>
  };

  const RefinePanel = () => (
      <div className="p-8"><h2 className="text-xl font-bold mb-4">Refine a Dimension</h2><div className="flex flex-wrap gap-2">{DIMENSIONS.map(dim => (<button key={dim} onClick={() => onEdit(dim)} className="...">{dim}</button>))}</div></div>
  );

  const renderInfoPanel = () => {
      switch(activeTab) {
          case 'bio': return <BioPanel />;
          case 'data': return <DataPanel />;
          case 'refine': return <RefinePanel />;
      }
  }

  return (
    <div className="flex h-full w-full">
      <div className="w-1/2 h-full relative bg-gray-100">
        <Image src={persona.imageUrl!} alt={persona.name} layout="fill" className="object-cover" priority />
      </div>
      <div className="w-1/2 h-full flex flex-col border-l">
        <nav className="flex-shrink-0 border-b">
          <button onClick={() => setActiveTab('bio')} className={`px-4 py-3 font-medium text-sm ${activeTab === 'bio' ? 'text-black border-b-2 border-black' : 'text-gray-500'}`}>Bio</button>
          <button onClick={() => setActiveTab('data')} className={`px-4 py-3 font-medium text-sm ${activeTab === 'data' ? 'text-black border-b-2 border-black' : 'text-gray-500'}`}>Data</button>
          <button onClick={() => setActiveTab('refine')} className={`px-4 py-3 font-medium text-sm ${activeTab === 'refine' ? 'text-black border-b-2 border-black' : 'text-gray-500'}`}>Refine</button>
        </nav>
        <div className="flex-grow overflow-y-auto">
            {renderInfoPanel()}
        </div>
      </div>
    </div>
  );
};

const ChatView: React.FC<{ persona: Persona }> = ({ persona }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load chat history from localStorage based on persona.id
        const chatHistoryData = localStorage.getItem(`chatHistory_${persona.id}`);
        if (chatHistoryData) {
            setMessages(JSON.parse(chatHistoryData));
        } else {
            setMessages([{ role: 'persona', content: `Hello, I'm ${persona.name}. Ask me anything.` }]);
        }
    }, [persona.id, persona.name]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        // ... API call to /api/chat-with-persona and stream handling ...

        setIsLoading(false);
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex-1 overflow-y-auto p-8 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {/* Message bubble styling */}
                        <div className={`max-w-md p-4 rounded-2xl ${ msg.role === 'persona' ? 'bg-gray-100' : 'bg-black text-white' }`}>
                            <p>{msg.content}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t">
                <form onSubmit={(e) => {e.preventDefault(); handleSend();}} className="relative">
                    <input value={input} onChange={(e) => setInput(e.target.value)} disabled={isLoading} className="w-full p-4 rounded-full bg-gray-100" placeholder="Ask anything..."/>
                    <button type="submit" disabled={isLoading} className="absolute right-4 top-1/2 -translate-y-1/2"><Send size={20} /></button>
                </form>
            </div>
        </div>
    );
};

const WorkspaceView: React.FC<{ persona: Persona }> = ({ persona }) => {
    return <div className="p-8">Workspace for {persona.name}</div>;
};


// --- Main Page ---

function PersonaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const personaId = searchParams.get('id');
  
  const [persona, setPersona] = useState<Persona | null>(null);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'persona' | 'chat' | 'workspace'>('persona');

  useEffect(() => {
    if (!personaId) { /* ... */ return; }
    // ... data loading logic for persona and assessmentResults ...
  }, [personaId]);

  const handleEditDimension = (dimension: string) => {
    router.push(`/swipe?refine=${dimension}&personaId=${personaId}`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!persona) return <div>Persona not found.</div>;

  const renderView = () => {
    switch(currentView) {
      case 'persona':
        return <PersonaView persona={persona} assessmentResults={assessmentResults} onEdit={handleEditDimension} />;
      case 'chat':
        return <ChatView persona={persona} />;
      case 'workspace':
        return <WorkspaceView persona={persona} />;
    }
  }

  return (
    <div className="w-full h-screen">
      {renderView()}
      <PillNavigation currentView={currentView} setView={setCurrentView} />
    </div>
  );
}

export default function PersonaPage() {
  return <Suspense fallback={<div>Loading...</div>}><PersonaPageContent /></Suspense>;
} 