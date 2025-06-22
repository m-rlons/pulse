'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingFlow() {
  const [step, setStep] = useState(1)
  const [businessDescription, setBusinessDescription] = useState('')
  const router = useRouter()

  const handleNext = () => {
    if (step === 1 && businessDescription.trim()) {
      localStorage.setItem('businessDescription', businessDescription)
      setStep(2)
    } else if (step === 2) {
      router.push('/bento') // Navigate to the bento page after onboarding
    }
  }

  const handleStartOver = () => {
    localStorage.removeItem('businessDescription');
    setBusinessDescription('')
    setStep(1)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Prevent default form submission
        
        // Ensure the button isn't disabled before proceeding
        if (step === 1 && businessDescription.trim()) {
          handleNext();
        } else if (step === 2) {
          handleNext();
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [step, businessDescription, handleNext]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="max-w-2xl w-full">
        {step === 1 ? (
          // Step 1: What does your company do?
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-5xl font-bold text-center text-gray-900">
              What does your<br />company do?
            </h1>
            <p className="text-xl text-gray-500 text-center">
              (In simple language, explain your company)
            </p>
            
            <textarea
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              placeholder="e.g., We're a subscription-based library of academic strategies..."
              className="w-full p-6 border border-gray-200 rounded-2xl min-h-[150px] text-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
            
            <div className="flex justify-between items-center">
               <button
                onClick={handleStartOver}
                className="bg-red-500 text-white px-8 py-4 rounded-full font-medium hover:bg-red-600 transition-all"
              >
                Start Over
              </button>

              <button
                onClick={handleNext}
                disabled={!businessDescription.trim()}
                className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Sounds good, next
                <span className="ml-1 text-gray-400 text-sm">(Enter↵)</span>
              </button>
            </div>
          </div>
        ) : (
          // Step 2: Understanding values
          <div className="space-y-8 text-center animate-fade-in">
            <h1 className="text-5xl font-bold text-gray-900">
              We need to<br />
              understand your<br />
              customer's values.
            </h1>
            <p className="text-xl text-gray-500">
              You're going to swipe through some questions.
            </p>
            
            <div className="flex justify-between mt-16">
              <button
                onClick={handleStartOver}
                className="bg-red-500 text-white px-8 py-4 rounded-full font-medium hover:bg-red-600 transition-all"
              >
                Start Over
              </button>
              
              <button
                onClick={handleNext}
                className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                Sounds good, next
                <span className="ml-1 text-gray-400 text-sm">(Enter↵)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 