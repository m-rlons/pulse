'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Persona, ChatMessage, AssessmentResult, Statement, Document } from '../../lib/types';
import { Loader, Edit, Send, MessageSquare, FileText, BarChart2, Paperclip, X } from 'lucide-react';

const DIMENSIONS = ["spend", "loyalty", "investment", "interest", "social", "novelty"];

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleSend: (e: React.FormEvent) => Promise<void>;
  documents: Document[];
  selectedDocument: string | null;
  setSelectedDocument: React.Dispatch<React.SetStateAction<string | null>>;
  personaName: string;
}

// Moved ChatPanel outside to prevent re-creation on render
const ChatPanel: React.FC<ChatPanelProps> = ({ messages, isLoading, input, setInput, handleSend, documents, selectedDocument, setSelectedDocument, personaName }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  return (
    <div className="w-full h-full flex flex-col">
       <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'persona' && (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" />
            )}
            <div className={`max-w-md p-4 rounded-2xl ${ msg.role === 'persona' ? 'bg-black text-white' : 'bg-gray-100 text-black' }`}>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" />
              <div className="max-w-md p-4 rounded-2xl bg-black text-white">
                  <Loader className="animate-spin" size={20} />
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4">
        {documents.length > 0 && (
          <div className="mb-2">
            {selectedDocument ? (
              <div className="flex items-center justify-between p-2 text-sm bg-violet-100 text-violet-800 rounded-md">
                <div className="flex items-center gap-2">
                  <Paperclip size={14} />
                  <span className="font-medium">{selectedDocument}</span>
                </div>
                <button onClick={() => setSelectedDocument(null)} className="p-1 rounded-full hover:bg-violet-200">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <select
                onChange={(e) => setSelectedDocument(e.target.value || null)}
                className="w-full p-2 text-sm text-gray-500 bg-gray-50 rounded-md border-gray-200 focus:outline-none focus:ring-1 focus:ring-black"
                value={selectedDocument || ''}
              >
                <option value="">Attach a document...</option>
                {documents.map((doc) => (
                  <option key={doc.name} value={doc.name}>{doc.name}</option>
                ))}
              </select>
            )}
          </div>
        )}
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`what do you do, ${personaName}?`}
            className="w-full p-4 pr-12 text-black bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-black"
            disabled={isLoading}
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black disabled:opacity-50" disabled={isLoading || !input.trim()}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

interface BioPanelProps {
  persona: Persona;
}

// Moved BioPanel outside
const BioPanel: React.FC<BioPanelProps> = ({ persona }) => (
  <div className="p-8 h-full overflow-y-auto text-white">
    <h1 className="text-4xl font-bold">{persona.name}</h1>
    <p className="text-lg text-gray-300 mt-1">{persona.age} years old</p>
    <p className="text-lg text-gray-300">{persona.role} - {persona.experience}</p>
    
    <div className="mt-8 space-y-6 text-base text-gray-200">
      <div>
        <h3 className="font-bold mb-2 text-white">Bio</h3>
        <p className="whitespace-pre-wrap">{persona.bio}</p>
      </div>
      <div>
        <h3 className="font-bold mb-2 text-white">Interests</h3>
        <p>{persona.interests}</p>
      </div>
      <div>
        <h3 className="font-bold mb-2 text-white">Disinterests</h3>
        <p>{persona.disinterests}</p>
      </div>
       <div>
        <h3 className="font-bold mb-2 text-white">Actionable Insights</h3>
        <p className="whitespace-pre-wrap">{persona.insights}</p>
      </div>
    </div>
  </div>
);

interface DataPanelProps {
  assessmentResults: AssessmentResult[];
}

// Moved DataPanel outside
const DataPanel: React.FC<DataPanelProps> = ({ assessmentResults }) => {
  const dimensionScores = DIMENSIONS.reduce((acc, dim) => {
    const relevantResults = assessmentResults.filter(r => r.dimension === dim);
    if (relevantResults.length === 0) {
      acc[dim] = 0;
      return acc;
    }
    const sum = relevantResults.reduce((sum, r) => sum + r.score, 0);
    acc[dim] = sum / relevantResults.length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-8 h-full overflow-y-auto text-white">
      <h1 className="text-4xl font-bold">Persona Data</h1>
      
      <div className="mt-8">
        <h3 className="font-bold mb-4 text-white text-xl">Dimension Scores</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(dimensionScores).map(([dim, score]) => (
            <div key={dim} className="bg-gray-800/50 p-4 rounded-lg">
              <p className="text-sm capitalize text-gray-300">{dim}</p>
              <p className={`text-3xl font-bold ${score > 0 ? 'text-green-400' : score < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-bold mb-4 text-white text-xl">Full Swipe History</h3>
        <div className="space-y-2 text-sm">
          {assessmentResults.map((result, i) => {
             const score = result.score;
             const text = result.text || `A statement about ${result.dimension}`;
             return (
              <div key={i} className="bg-gray-800/50 p-3 rounded-md flex justify-between items-center">
                <span className="text-gray-300">{text}</span>
                <span className={`font-bold text-xs px-2 py-1 rounded-full ${
                  score === 1 ? 'bg-green-500/20 text-green-300' : 
                  score === -1 ? 'bg-red-500/20 text-red-300' :
                  'bg-gray-500/20 text-gray-300'
                }`}>
                  {score === 1 ? 'AGREE' : score === -1 ? 'DISAGREE' : 'SKIP'}
                </span>
              </div>
             )
          })}
        </div>
      </div>
    </div>
  );
};

function PersonaPageContent() {
  const router = useRouter();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'chat' | 'bio' | 'data'>('chat');
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([]);
  const [allStatements, setAllStatements] = useState<Statement[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  useEffect(() => {
    // Load persona and initial chat history
    try {
      const personaData = localStorage.getItem('persona');
      const chatHistoryData = localStorage.getItem('chatHistory');
      const resultsData = localStorage.getItem('assessmentResults');
      const statementsData = localStorage.getItem('statements');

      if (personaData) {
        const parsedPersona = JSON.parse(personaData);
        setPersona(parsedPersona);
        // Set initial greeting if no history exists
        if (!chatHistoryData) {
          setMessages([{ role: 'persona', content: `Hello, I'm ${parsedPersona.name}. Ask me anything.` }]);
        }
      } else {
        throw new Error('No persona data found. Please create a persona first.');
      }

      if (chatHistoryData) {
        setMessages(JSON.parse(chatHistoryData));
      }
      if (resultsData) {
        setAssessmentResults(JSON.parse(resultsData));
      }
      if (statementsData) {
        setAllStatements(JSON.parse(statementsData));
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const response = await fetch('/api/files');
        const data = await response.json();
        if (data.success) {
          setDocuments(data.files);
        }
      } catch (e) {
        console.error("Failed to fetch documents for chat:", e);
      }
    }
    fetchDocuments();
  }, []);
  
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat-with-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona,
          chatHistory: messages,
          message: input,
          document: selectedDocument,
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      const finalMessages = [...newMessages, { role: 'persona' as const, content: data.responseText }];
      setMessages(finalMessages);
      localStorage.setItem('chatHistory', JSON.stringify(finalMessages));
      
    } catch (error) {
      console.error('Failed to get response:', error);
      const finalMessages = [...newMessages, { role: 'persona' as const, content: "I'm sorry, I'm having trouble connecting right now." }];
      setMessages(finalMessages);
      localStorage.setItem('chatHistory', JSON.stringify(finalMessages));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDimension = (dimension: string) => {
    router.push(`/swipe?refine=${dimension}`);
  };

  if (isLoading && !persona) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <Loader className="animate-spin mb-4" size={48} />
        <div className="text-2xl font-semibold">Loading Persona...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-2xl text-red-500">{error}</div>
      </div>
    );
  }
  
  if (!persona) return null; // Should be handled by loading/error states

  const renderPanel = () => {
    switch (view) {
      case 'chat':
        return <ChatPanel 
          messages={messages} 
          isLoading={isLoading} 
          input={input} 
          setInput={setInput} 
          handleSend={handleSend}
          documents={documents}
          selectedDocument={selectedDocument}
          setSelectedDocument={setSelectedDocument}
          personaName={persona.name}
        />;
      case 'bio':
        return <BioPanel persona={persona} />;
      case 'data':
        return <DataPanel assessmentResults={assessmentResults} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-full bg-black md:bg-white text-black overflow-hidden md:flex">
      {/* Background Image (Mobile) & Left Panel (Desktop) */}
      <div className="absolute inset-0 md:relative md:w-1/2 h-full md:z-10">
        <Image
            src={persona.imageUrl!}
            alt={persona.name}
            fill
            className="object-cover object-center md:object-contain md:object-bottom"
            priority
        />
        {/* Mobile View Toggle */}
        <div className="md:hidden absolute top-8 left-8 z-20 flex gap-2">
           <select 
              onChange={(e) => setView(e.target.value as any)}
              className="bg-black/50 text-white backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-semibold appearance-none"
              value={view}
            >
              <option value="chat">Chat</option>
              <option value="bio">Bio</option>
              <option value="data">Data</option>
            </select>
           <select 
              onChange={(e) => handleEditDimension(e.target.value)}
              className="bg-black/50 text-white backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-semibold appearance-none"
              defaultValue=""
            >
              <option value="" disabled>Edit</option>
              {DIMENSIONS.map(dim => (
                <option key={dim} value={dim} className="capitalize text-black">{dim}</option>
              ))}
            </select>
        </div>
         {/* Desktop Edit Button */}
         <div className="hidden md:flex absolute top-8 left-8 items-center gap-2 z-10">
            <select 
              onChange={(e) => handleEditDimension(e.target.value)}
              className="bg-white/50 backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-semibold appearance-none"
              defaultValue=""
            >
              <option value="" disabled>Edit a Dimension</option>
              {DIMENSIONS.map(dim => (
                <option key={dim} value={dim} className="capitalize">{dim}</option>
              ))}
            </select>
        </div>
      </div>

      {/* Right side Panels (Desktop) / Overlay Panels (Mobile) */}
      <div className="md:w-1/2 h-full flex flex-col bg-gray-900">
        {/* Mobile View */}
        <div className="md:hidden absolute inset-0 z-10 bg-black/50 backdrop-blur-md overflow-y-auto">
          {renderPanel()}
        </div>
        {/* Desktop View */}
        <div className="hidden md:flex w-full h-full flex-col">
          <div className="flex-shrink-0 p-4 border-b border-gray-700">
             <div className="flex items-center gap-2">
                <button onClick={() => setView('chat')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm ${view === 'chat' ? 'bg-white text-black' : 'text-gray-300 hover:bg-gray-800'}`}><MessageSquare size={16}/> Chat</button>
                <button onClick={() => setView('bio')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm ${view === 'bio' ? 'bg-white text-black' : 'text-gray-300 hover:bg-gray-800'}`}><FileText size={16}/> Bio</button>
                <button onClick={() => setView('data')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm ${view === 'data' ? 'bg-white text-black' : 'text-gray-300 hover:bg-gray-800'}`}><BarChart2 size={16}/> Data</button>
             </div>
          </div>
           {renderPanel()}
        </div>
      </div>
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