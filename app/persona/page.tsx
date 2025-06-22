'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Persona, ChatMessage } from '../../lib/types';
import { Loader, Edit, Send } from 'lucide-react';

function PersonaPageContent() {
  const router = useRouter();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  // Load persona and initial chat history
  useEffect(() => {
    try {
      const personaData = localStorage.getItem('persona');
      const chatHistoryData = localStorage.getItem('chatHistory');

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
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="h-screen w-full bg-white text-black overflow-hidden flex">
      {/* Left side: Persona Image */}
      <div className="w-1/2 h-full relative z-10">
        <Image
            src={persona.imageUrl!}
            alt={persona.name}
            fill
            className="object-contain object-bottom"
            priority
        />
        <button
            onClick={() => router.push('/')} // Let's just have it go home for now
            className="absolute top-8 left-8 flex items-center gap-2 text-sm font-semibold z-10 bg-white/50 backdrop-blur-sm px-3 py-2 rounded-lg"
        >
            <Edit size={16} />
            Edit Persona
        </button>
      </div>

      {/* Right side: Chat */}
      <div className="w-1/2 h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-8 space-y-4">
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

        {/* Input Form - No border-t here */}
        <div className="p-4">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`what do you do, ${persona.name}?`}
              className="w-full p-4 pr-12 text-black bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-black"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black disabled:opacity-50"
              disabled={isLoading || !input.trim()}
            >
              <Send size={20} />
            </button>
          </form>
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