'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, TargetAndTransition } from 'framer-motion';
import { ArrowLeft, ArrowRight, ArrowDown } from 'lucide-react';
import { Statement, AssessmentResult } from '../lib/types';

const gradients = [
  'bg-gradient-to-br from-orange-400 via-pink-500 to-purple-400',
  'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-400',
  'bg-gradient-to-br from-green-400 via-teal-500 to-blue-400',
  'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-400',
  'bg-gradient-to-br from-purple-400 via-pink-500 to-red-400'
];

export interface SwipeInterfaceProps {
  statements: Statement[];
  onAssessmentComplete: (results: AssessmentResult[]) => void;
  onContinue: () => void;
}

export const SwipeInterface: React.FC<SwipeInterfaceProps> = ({ statements, onAssessmentComplete, onContinue }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'down' | 'up' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const allAnswered = currentIndex >= statements.length;

  // Effect to automatically trigger completion when all questions are answered
  useEffect(() => {
    if (allAnswered) {
      onAssessmentComplete(results);
    }
  }, [allAnswered, results, onAssessmentComplete]);

  const handleSwipe = useCallback(
    (direction: 'left' | 'right' | 'down') => {
      if (isAnimating || allAnswered) return;
      
      setIsAnimating(true);
      setExitDirection(direction);

      let score = 0;
      if (direction === 'left') score = -1;
      if (direction === 'right') score = 1;

      setResults(prev => [...prev, { dimension: statements[currentIndex].dimension, score, text: statements[currentIndex].text }]);
      
      setCurrentIndex(c => c + 1);
      setTimeout(() => setIsAnimating(false), 300);
    },
    [currentIndex, statements, allAnswered, isAnimating]
  );

  const handlePrevious = useCallback(() => {
    if (currentIndex === 0 || isAnimating) return;
    setIsAnimating(true);
    setExitDirection('up'); // Animate the old card back in from the top
    setResults(prev => prev.slice(0, -1));
    setCurrentIndex(c => c - 1);
    setTimeout(() => setIsAnimating(false), 300);
  }, [currentIndex, isAnimating]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating) return;
      
      if (e.key === 'ArrowLeft') handleSwipe('left');
      if (e.key === 'ArrowRight') handleSwipe('right');
      if (e.key === 'ArrowDown') handleSwipe('down');
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && allAnswered) {
        onContinue();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipe, onContinue, allAnswered, isAnimating]);
  
  const handleDragEnd = (_: any, info: { offset: { x: number, y: number } }) => {
    if (isAnimating || allAnswered) return;
    if (info.offset.x < -100) handleSwipe('left');
    else if (info.offset.x > 100) handleSwipe('right');
    else if (info.offset.y > 100) handleSwipe('down');
  };

  const getExitAnimation = (direction: typeof exitDirection): TargetAndTransition => {
    switch (direction) {
      case 'left': return { opacity: 0, x: -300, rotate: -15 };
      case 'right': return { opacity: 0, x: 300, rotate: 15 };
      case 'down': return { opacity: 0, y: 300, scale: 0.8 };
      case 'up': return { opacity: 0, y: -300, scale: 0.8 }; // For previous card exit
      default: return { opacity: 0 };
    }
  };

  const cardVariants = {
    initial: (direction: typeof exitDirection) => ({
      opacity: 0,
      y: direction === 'up' ? -300 : 50,
      scale: 0.95,
    }),
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    exit: (direction: typeof exitDirection) => getExitAnimation(direction),
  };

  const progress = statements.length > 0 ? (currentIndex / statements.length) * 100 : 0;

  return (
    <div className="w-full h-screen flex flex-col items-center justify-between p-8 bg-white">
        {/* Progress Bar */}
        <div className="w-full max-w-2xl px-4">
            <div className="relative h-3 bg-gray-100 rounded-full">
                <motion.div 
                    className="absolute top-0 left-0 h-full bg-black rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                />
            </div>
        </div>

      <div ref={containerRef} className="relative w-full flex justify-center items-center h-[450px]">
        <AnimatePresence custom={exitDirection}>
          {!allAnswered ? (
            <motion.div
              key={currentIndex}
              className="absolute"
              variants={cardVariants}
              custom={exitDirection}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag={true}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              whileDrag={{ scale: 1.05 }}
              style={{ touchAction: 'none', cursor: 'grab' }}
            >
              <div className={`relative w-80 h-96 rounded-3xl p-8 text-white ${!statements[currentIndex].imageUrl && gradients[currentIndex % gradients.length]} shadow-2xl flex items-center justify-center overflow-hidden`}>
                {statements[currentIndex].imageUrl ? (
                  <>
                    <img src={statements[currentIndex].imageUrl} alt="Statement context" className="absolute top-0 left-0 w-full h-full object-cover" />
                    <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-40"></div>
                  </>
                ) : (
                  <div className="absolute top-0 left-0 w-full h-full border-2 border-dashed border-gray-300 rounded-3xl animate-pulse"></div>
                )}
                <p className="relative z-10 text-3xl font-bold text-center lowercase leading-tight">
                  {statements[currentIndex].text}
                </p>
              </div>
            </motion.div>
          ) : (
             <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="text-center">
                <h2 className="text-3xl font-bold">All done!</h2>
                <p className="text-gray-600 mt-2">Ready to see your persona?</p>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="w-full max-w-2xl flex justify-between items-center">
        <button
            onClick={handlePrevious}
            disabled={currentIndex === 0 || allAnswered}
            className="bg-red-500 text-white px-5 py-3 rounded-md font-semibold hover:bg-red-600 transition-colors text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-500 flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Previous Question
        </button>

        {allAnswered ? (
            <div className="flex items-center gap-4">
                <span className="text-gray-500 text-sm">Or Press Cmd + Enter</span>
                <button
                    onClick={onContinue}
                    className="bg-black text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors text-base"
                >
                    Continue
                </button>
            </div>
        ) : (
            <div className="flex flex-col items-end">
                <div className="flex gap-3">
                    <button onClick={() => handleSwipe('left')} className="w-16 h-12 bg-red-500 rounded-md flex items-center justify-center text-white shadow-sm hover:bg-red-600 transition-colors"><ArrowLeft size={24} /></button>
                    <button onClick={() => handleSwipe('down')} className="w-16 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-700 shadow-sm hover:bg-gray-300 transition-colors"><ArrowDown size={24} /></button>
                    <button onClick={() => handleSwipe('right')} className="w-16 h-12 bg-blue-500 rounded-md flex items-center justify-center text-white shadow-sm hover:bg-blue-600 transition-colors"><ArrowRight size={24} /></button>
                </div>
                <p className="text-xs text-gray-400 mt-2">swipe or use your arrow keys to disagree, skip, or agree</p>
            </div>
        )}
      </div>
    </div>
  );
}; 