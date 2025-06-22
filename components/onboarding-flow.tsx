'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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
        
        <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="flex items-center gap-4">
          <input
            type="text"
            value={businessDescription}
            onChange={(e) => setBusinessDescription(e.target.value)}
            placeholder="what do you do?"
            className="w-full p-4 border-b-2 border-gray-300 focus:outline-none focus:border-black text-2xl bg-transparent"
            autoFocus
          />
           <button
            type="submit"
            className="px-6 py-3 bg-black text-white rounded-md text-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400"
            disabled={!businessDescription.trim()}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  )
} 