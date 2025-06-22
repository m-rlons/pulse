'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Persona, ChatMessage } from '../lib/types';
import { Loader, Send, User, Bot, CornerUpLeft, MessageSquarePlus } from 'lucide-react';

interface PersonaChatProps {
  persona: Persona;
}

const PersonaChat: React.FC<PersonaChatProps> = ({ persona }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refinement, setRefinement] = useState<{dimension: string | null}>({ dimension: null });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Fetch initial message from the persona
  useEffect(() => {
    const getInitialMessage = async () => {
      // Don't fetch if there are already messages (e.g., after a refinement loop)
      if(messages.length > 0) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/chat-with-persona', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            persona,
            chatHistory: [],
            message: "Give me a friendly, in-character greeting."
          }),
        });
        if (!response.ok) throw new Error('Failed to get initial message');
        const data = await response.json();
        setMessages([{ role: 'persona', content: data.responseText }]);
      } catch (error) {
        console.error(error);
        setMessages([{ role: 'persona', content: `Hello, I'm ${persona.name}. It's nice to meet you.` }]);
      } finally {
        setIsLoading(false);
      }
    };
    getInitialMessage();
  }, [persona]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setRefinement({ dimension: null }); // Clear any previous refinement suggestions

    try {
      const response = await fetch('/api/chat-with-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona,
          chatHistory: messages, // Pass current history
          message: input,
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'persona', content: data.responseText }]);
      
      if (data.isCorrection && data.dimension) {
        setRefinement({ dimension: data.dimension });
      }

    } catch (error) {
      console.error('Failed to get response:', error);
      setMessages(prev => [...prev, { role: 'persona', content: "I'm sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefineClick = () => {
    if(!refinement.dimension) return;
    // Save current chat history to local storage to persist it across navigation
    localStorage.setItem('chatHistory', JSON.stringify(messages));
    router.push(`/swipe?refine=${encodeURIComponent(refinement.dimension)}`);
  }

  // On component mount, check if there's a chat history in local storage
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setMessages(JSON.parse(savedHistory));
      localStorage.removeItem('chatHistory'); // Clear it after loading
    }
  }, []);


  return (
    <div className="flex h-screen bg-white text-black">
      {/* Left side: Persona Details */}
      <div className="w-1/2 flex flex-col p-8 border-r border-gray-200">
        {/* Top Details Section - This will scroll if content overflows */}
        <div className="flex-shrink-0 overflow-y-auto">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-sm font-semibold mb-4 text-gray-500">Your Generated Persona</h2>
            
            {/* Details */}
            <h1 className="text-4xl font-bold">{persona.name}</h1>
            <p className="text-lg text-gray-600 mt-1">{persona.age} years old</p>
            <p className="text-lg text-gray-600">{persona.role} - {persona.experience}</p>
            
            <div className="mt-8 space-y-6 text-base">
              <div>
                <h3 className="font-bold mb-2 text-gray-800">Bio</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{persona.bio}</p>
              </div>
              <div>
                <h3 className="font-bold mb-2 text-gray-800">Interests</h3>
                <p className="text-gray-700">{persona.interests}</p>
              </div>
              <div>
                <h3 className="font-bold mb-2 text-gray-800">Disinterests</h3>
                <p className="text-gray-700">{persona.disinterests}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-grow"></div>

        {/* Bottom Image Section */}
        <div className="flex-shrink-0 w-full max-w-md mx-auto">
          {persona.imageUrl ? (
            <Image
              src={persona.imageUrl}
              alt={persona.name}
              width={512}
              height={512}
              className="rounded-lg object-cover w-full aspect-square"
              priority
            />
          ) : (
            <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Image Generation Failed</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Right side: Chat Interface */}
      <div className="w-1/2 flex flex-col">
        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          {/* Messages */}
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
          
          {/* Loading Indicator */}
          {isLoading && messages.length > 0 && (
             <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" />
                <div className="max-w-md p-4 rounded-2xl bg-black text-white">
                    <Loader className="animate-spin" size={20} />
                </div>
             </div>
          )}

          {/* Refinement Button */}
          {refinement.dimension && !isLoading && (
            <div className="flex justify-center py-4">
              <button
                onClick={handleRefineClick}
                className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md"
              >
                <MessageSquarePlus size={20}/>
                Refine Understanding of "{refinement.dimension}"
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="what do you do?"
              className="w-full p-4 pr-12 text-black bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black"
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
};

export default PersonaChat; 