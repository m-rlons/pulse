'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Persona, ChatMessage } from '../lib/types';
import { Loader, Send, MessageSquarePlus } from 'lucide-react';

interface PersonaChatProps {
  persona: Persona;
  handleRefineClick: (dimension: string) => void;
  initialMessages: ChatMessage[];
}

const PersonaChat: React.FC<PersonaChatProps> = ({ persona, handleRefineClick, initialMessages }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(initialMessages.length === 0);
  const [refinement, setRefinement] = useState<{dimension: string | null}>({ dimension: null });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Fetch initial message from the persona
  useEffect(() => {
    const getInitialMessage = async () => {
      if (messages.length > 0) {
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
            message: "Give me a friendly, in-character greeting to start our conversation."
          }),
        });
        if (!response.ok) throw new Error('Failed to get initial message');
        const data = await response.json();
        const newMessages : ChatMessage[] = [{ role: 'persona', content: data.responseText }];
        setMessages(newMessages);
        localStorage.setItem('chatHistory', JSON.stringify(newMessages));
      } catch (error) {
        console.error(error);
        const newMessages : ChatMessage[] = [{ role: 'persona', content: `Hello, I'm ${persona.name}. It's nice to meet you.` }];
        setMessages(newMessages);
        localStorage.setItem('chatHistory', JSON.stringify(newMessages));
      } finally {
        setIsLoading(false);
      }
    };
    getInitialMessage();
  }, [persona, messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
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
      const finalMessages = [...newMessages, { role: 'persona' as const, content: data.responseText }];
      setMessages(finalMessages);
      localStorage.setItem('chatHistory', JSON.stringify(finalMessages));
      
      if (data.isCorrection && data.dimension) {
        setRefinement({ dimension: data.dimension });
      }

    } catch (error) {
      console.error('Failed to get response:', error);
      const finalMessages = [...newMessages, { role: 'persona' as const, content: "I'm sorry, I'm having trouble connecting right now." }];
      setMessages(finalMessages);
      localStorage.setItem('chatHistory', JSON.stringify(finalMessages));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-black">
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
              onClick={() => handleRefineClick(refinement.dimension!)}
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
  );
};

export default PersonaChat; 