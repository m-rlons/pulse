'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Persona, ChatMessage } from '../lib/types';

interface PersonaChatProps {
  persona: Persona;
  onExit: () => void;
}

export default function PersonaChat({ persona, onExit }: PersonaChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'persona',
      content: `Hi there! I'm ${persona.name}. It's great to connect.`
    },
    {
      role: 'persona',
      content: "I'm ready to chat about my experiences and what I look for in classroom tools. What's on your mind?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
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
          message: input,
          persona,
          chatHistory: newMessages.slice(0, -1) // Send history *before* user's latest message
        })
      });

      if (!response.ok) {
        throw new Error('API Error: ' + (await response.json()).error);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'persona', content: data.message }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'persona', content: "I'm sorry, I encountered an error and can't respond right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] max-w-6xl mx-auto rounded-lg shadow-2xl bg-white">
      {/* Left side - Persona Info */}
      <div className="w-1/3 p-8 border-r bg-gray-50 rounded-l-lg flex flex-col">
        <button onClick={onExit} className="mb-6 text-sm text-gray-500 hover:text-gray-800 self-start">← Back to Results</button>
        {persona.imageUrl && (
          <img 
            src={persona.imageUrl} 
            alt={persona.name}
            className="w-full rounded-lg mb-6 shadow-md"
          />
        )}
        <h1 className="text-3xl font-bold mb-2">{persona.name}</h1>
        <p className="text-gray-600 mb-6">
          {persona.age} years old | {persona.teachingYears} years teaching
        </p>
        <div className="overflow-y-auto pr-2">
            <h3 className="font-semibold text-lg mb-2 text-gray-800">Summary</h3>
            <p className="text-sm text-gray-600 mb-4">{persona.description}</p>
            <h3 className="font-semibold text-lg mb-2 text-gray-800">Actionable Insights</h3>
            <p className="text-sm text-gray-600">{persona.insights}</p>
        </div>
      </div>

      {/* Right side - Chat */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b text-center">
          <h2 className="font-semibold text-xl">Chat with {persona.name}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'persona' && (
                <img src={persona.imageUrl || '/default-avatar.png'} alt="persona avatar" className="w-8 h-8 rounded-full"/>
              )}
              <div
                className={`max-w-md px-4 py-2 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-2 justify-start">
               <img src={persona.imageUrl || '/default-avatar.png'} alt="persona avatar" className="w-8 h-8 rounded-full"/>
               <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-2xl rounded-bl-none">
                <div className="flex items-center justify-center gap-1">
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask a question..."
              className="flex-1 px-4 py-2 border bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 