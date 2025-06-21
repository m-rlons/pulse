import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, TargetAndTransition } from 'framer-motion';
import { Statement, AssessmentResult } from '../lib/types';
import { StatementCard } from './StatementCard';

export interface SwipeInterfaceProps {
  statements: Statement[];
  onComplete: (results: AssessmentResult[]) => void;
}

export const SwipeInterface: React.FC<SwipeInterfaceProps> = ({ statements, onComplete }) => {
  const [current, setCurrent] = useState(0);
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
      if (isAnimating || current >= statements.length) return;
      
      setIsAnimating(true);
      setExitDirection(direction);

      let score = 0;
      if (direction === 'left') score = -1;
      if (direction === 'right') score = 1;

      const newResults = [...results, { dimension: statements[current].dimension, score }];
      setResults(newResults);

      // Wait for exit animation to complete before finishing
      setTimeout(() => {
        if (current === statements.length - 1) {
          onComplete(newResults);
        }
      }, 300);
      
      setCurrent(c => c + 1);

      // Animation lock
      setTimeout(() => setIsAnimating(false), 300);
    },
    [current, statements, onComplete, results, isAnimating]
  );

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
      <div className="mb-4 text-golly-gold font-medium">
        {Math.min(current + 1, statements.length)} / {statements.length}
      </div>
      <div ref={containerRef} className="relative w-full flex justify-center items-center h-[520px]">
        <AnimatePresence custom={exitDirection}>
          {current < statements.length && (
            <motion.div
              key={statements[current].dimension}
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
              <StatementCard text={statements[current].text} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex flex-col items-center mt-4 w-[300px]">
        <div className="flex justify-between w-full">
          <span className="text-sm text-inquisitive-red font-semibold">← Disagree</span>
          <span className="text-sm text-curious-blue font-semibold">Agree →</span>
        </div>
        <span className="text-sm text-heedless-black/70 mt-2">↓ Skip/Neutral</span>
        <span className="text-xs text-heedless-black/50 mt-1">or use arrow keys</span>
      </div>
    </div>
  );
}; 