import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, TargetAndTransition } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Statement, AssessmentResult } from '../lib/types';

export interface SwipeInterfaceProps {
  statements: Statement[];
  onComplete: (results: AssessmentResult[]) => void;
}

// Add these gradient backgrounds for the cards
const gradients = [
  'bg-gradient-to-br from-orange-400 via-pink-500 to-purple-400',
  'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-400',
  'bg-gradient-to-br from-green-400 via-teal-500 to-blue-400',
  'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-400',
  'bg-gradient-to-br from-purple-400 via-pink-500 to-red-400'
];

export const SwipeInterface: React.FC<SwipeInterfaceProps> = ({ statements, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'down' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent page scroll on touch devices
    const preventScroll = (e: TouchEvent) => e.preventDefault();
    document.body.style.overflow = 'hidden';
    document.addEventListener('touchmove', preventScroll, { passive: false });
    
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  const handleSwipe = useCallback(
    (direction: 'left' | 'right' | 'down') => {
      if (isAnimating || currentIndex >= statements.length) return;
      
      setIsAnimating(true);
      setExitDirection(direction);

      let score = 0;
      if (direction === 'left') score = -1;
      if (direction === 'right') score = 1;

      const newResults = [...results, { dimension: statements[currentIndex].dimension, score }];
      setResults(newResults);

      // Wait for exit animation to complete before finishing
      setTimeout(() => {
        if (currentIndex === statements.length - 1) {
          onComplete(newResults);
        }
      }, 300);
      
      setCurrentIndex(c => c + 1);

      // Animation lock
      setTimeout(() => setIsAnimating(false), 300);
    },
    [currentIndex, statements, onComplete, results, isAnimating]
  );

  const skipStatement = useCallback(() => {
    handleSwipe('down');
  }, [handleSwipe]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating) return;
      if (e.key === 'ArrowLeft') handleSwipe('left');
      if (e.key === 'ArrowRight') handleSwipe('right');
      if (e.key === 'ArrowDown') handleSwipe('down');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipe, isAnimating]);
  
  const handleDragEnd = (_: any, info: { offset: { x: number, y: number } }) => {
    if (isAnimating) return;
    if (info.offset.x < -100) handleSwipe('left');
    else if (info.offset.x > 100) handleSwipe('right');
    else if (info.offset.y > 100) handleSwipe('down');
  };

  const getExitAnimation = (direction: typeof exitDirection): TargetAndTransition => {
    switch (direction) {
      case 'left': return { opacity: 0, x: -300, rotate: -20 };
      case 'right': return { opacity: 0, x: 300, rotate: 20 };
      case 'down': return { opacity: 0, y: 300, scale: 0.5 };
      default: return { opacity: 0 };
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-6 text-gray-600 font-medium text-lg">
        {Math.min(currentIndex + 1, statements.length)} / {statements.length}
      </div>
      
      <div ref={containerRef} className="relative w-full flex justify-center items-center h-[520px]">
        <AnimatePresence custom={exitDirection}>
          {currentIndex < statements.length && (
            <motion.div
              key={statements[currentIndex].dimension}
              className="absolute h-full w-full max-w-sm flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={getExitAnimation(exitDirection)}
              transition={{ duration: 0.3 }}
              drag={true}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              whileDrag={{ scale: 1.05 }}
              style={{ touchAction: 'none', cursor: 'grab' }}
            >
              {/* Update the card component */}
              <div className={`
                relative w-80 h-96 rounded-3xl p-8 text-white
                ${gradients[currentIndex % gradients.length]}
                shadow-2xl flex items-center justify-center
              `}>
                <p className="text-2xl font-bold text-center lowercase">
                  {statements[currentIndex].text}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Update the swipe buttons */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
        >
          <ChevronLeft size={32} />
        </button>
        
        <button
          onClick={skipStatement}
          className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
        >
          <ChevronDown size={32} />
        </button>
        
        <button
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
        >
          <ChevronRight size={32} />
        </button>
      </div>

      <div className="flex flex-col items-center mt-6 text-sm text-gray-500">
        <div className="flex gap-8 mb-2">
          <span className="flex items-center gap-1">
            <ChevronLeft size={16} />
            Disagree
          </span>
          <span className="flex items-center gap-1">
            Agree
            <ChevronRight size={16} />
          </span>
        </div>
        <span className="flex items-center gap-1">
          <ChevronDown size={16} />
          Skip/Neutral
        </span>
        <span className="text-xs mt-1">or use arrow keys</span>
      </div>
    </div>
  );
}; 