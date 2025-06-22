'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

export default function OnboardingFlow() {
  const [businessDescription, setBusinessDescription] = useState('')
  const router = useRouter()

  const handleNext = () => {
    if (businessDescription.trim()) {
      localStorage.setItem('businessDescription', businessDescription)
      router.push('/bento')
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleNext();
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [businessDescription, handleNext]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-8">
      <div className="max-w-4xl w-full flex flex-col justify-between min-h-[75vh] animate-fade-in">
        <div>
          <h1 className="text-8xl font-black text-gray-900 tracking-tighter">
            What does your<br />company do?
          </h1>
          <p className="text-2xl text-gray-500 mt-6">
            (In simple language, explain your company)
          </p>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="flex items-end justify-between">
          <div className="flex-grow mr-8">
            <input
              type="text"
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              placeholder="what do you do?"
              className="w-full p-4 border-b-2 border-gray-300 focus:outline-none focus:border-black text-2xl bg-transparent"
              autoFocus
            />
          </div>
          <div className="relative">
             <button
                type="submit"
                className="bg-black text-white font-semibold py-3 px-6 rounded-md text-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                disabled={!businessDescription.trim()}
              >
                Next
              </button>
              <span className="absolute top-full left-1/2 -translate-x-1/2 w-full text-center text-gray-500 text-sm mt-2 flex items-center justify-center gap-2">
                <ArrowRight size={14} /> Or Press Enter
              </span>
          </div>
        </form>
      </div>
    </div>
  )
} 