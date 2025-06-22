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
  onComplete: (results: AssessmentResult[]) => void;
}

export const SwipeInterface: React.FC<SwipeInterfaceProps> = ({ statements, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'down' | 'up' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const allAnswered = currentIndex >= statements.length;

  const handleSwipe = useCallback(
    (direction: 'left' | 'right' | 'down') => {
      if (isAnimating || allAnswered) return;
      
      setIsAnimating(true);
      setExitDirection(direction);

      let score = 0;
      if (direction === 'left') score = -1;
      if (direction === 'right') score = 1;

      setResults(prev => [...prev, { dimension: statements[currentIndex].dimension, score }]);
      
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

  const handleContinue = useCallback(() => {
    if (allAnswered) {
      onComplete(results);
    }
  }, [allAnswered, onComplete, results]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating) return;
      
      if (e.key === 'ArrowLeft') handleSwipe('left');
      if (e.key === 'ArrowRight') handleSwipe('right');
      if (e.key === 'ArrowDown') handleSwipe('down');
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && allAnswered) {
        handleContinue();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipe, handleContinue, allAnswered, isAnimating]);
  
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

  const progress = statements.length > 0 ? (currentIndex / statements.length) * 100 : 0;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-8">
        {/* Progress Bar */}
        <div className="w-full max-w-lg">
            <div className="relative h-2 bg-gray-200 rounded-full">
                <motion.div 
                    className="absolute top-0 left-0 h-full bg-black rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                />
                <motion.div 
                    className="absolute top-1/2 -ml-3 h-6 w-6 bg-blue-500 rounded-full border-4 border-white shadow"
                    style={{ y: '-50%' }}
                    animate={{ x: `${progress}%` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                />
            </div>
        </div>

      <div ref={containerRef} className="relative w-full flex justify-center items-center h-96">
        <AnimatePresence custom={exitDirection}>
          {!allAnswered ? (
            <motion.div
              key={currentIndex}
              className="absolute"
              initial={{ opacity: 0, y: exitDirection === 'up' ? -300 : 0, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={getExitAnimation(exitDirection)}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag={true}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              whileDrag={{ scale: 1.05 }}
              style={{ touchAction: 'none', cursor: 'grab' }}
            >
              <div className={`relative w-80 h-96 rounded-3xl p-8 text-white ${gradients[currentIndex % gradients.length]} shadow-2xl flex items-center justify-center`}>
                <p className="text-3xl font-bold text-center lowercase">
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
      <div className="w-full flex justify-between items-center">
        <button
            onClick={handlePrevious}
            disabled={currentIndex === 0 || allAnswered}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Previous Question
        </button>

        {allAnswered ? (
            <div className="flex items-center gap-4">
                <span className="text-gray-500 text-sm">Cmd + Enter</span>
                <button
                    onClick={handleContinue}
                    className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-all text-lg"
                >
                    Continue →
                </button>
            </div>
        ) : (
            <div className="flex flex-col items-center">
                <div className="flex gap-4">
                    <button onClick={() => handleSwipe('left')} className="w-14 h-14 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center text-red-500 shadow-md hover:scale-110 transition-transform"><ArrowLeft size={28} /></button>
                    <button onClick={() => handleSwipe('down')} className="w-14 h-14 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center text-gray-700 shadow-md hover:scale-110 transition-transform"><ArrowDown size={28} /></button>
                    <button onClick={() => handleSwipe('right')} className="w-14 h-14 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center text-blue-500 shadow-md hover:scale-110 transition-transform"><ArrowRight size={28} /></button>
                </div>
                <p className="text-xs text-gray-400 mt-3">swipe or use your arrow keys to disagree, skip, or agree</p>
            </div>
        )}
      </div>
    </div>
  );
}; 