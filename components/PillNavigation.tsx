'use client';

import React from 'react';
import { MessageSquare, User, Briefcase } from 'lucide-react';

interface PillNavigationProps {
  currentView: 'persona' | 'chat' | 'workspace';
  setView: (view: 'persona' | 'chat' | 'workspace') => void;
}

const navItems = [
  { id: 'persona', label: 'Persona', icon: User },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'workspace', label: 'Workspace', icon: Briefcase },
];

export default function PillNavigation({ currentView, setView }: PillNavigationProps) {
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
      <div className="
        flex items-center gap-2 p-2 
        bg-white/30 backdrop-blur-lg 
        rounded-full shadow-lg
        border border-white/20
        transition-all duration-300
        hover:bg-white/40
      ">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id as any)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-300
              ${currentView === item.id 
                ? 'bg-white text-black shadow-inner' 
                : 'text-white hover:bg-white/20'
              }
            `}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 