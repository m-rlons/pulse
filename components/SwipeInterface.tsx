import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSwipe = useCallback(
    (direction: 'left' | 'right') => {
      if (isAnimating || current >= statements.length) return;
      setIsAnimating(true);
      let score = 0;
      if (direction === 'left') score = -1;
      if (direction === 'right') score = 1;
      setTimeout(() => {
        setResults(prev => [
          ...prev,
          { dimension: statements[current].dimension, score },
        ]);
        if (current === statements.length - 1) {
          setTimeout(() => onComplete([...results, { dimension: statements[current].dimension, score }]), 300);
        } else {
          setCurrent(c => c + 1);
        }
        setIsAnimating(false);
      }, 250);
    },
    [current, statements, onComplete, results, isAnimating]
  );

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (info.offset.x < -100) {
      handleSwipe('left');
    } else if (info.offset.x > 100) {
      handleSwipe('right');
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-4 text-golly-gold font-medium">{current + 1} / {statements.length}</div>
      <div ref={containerRef} className="relative w-full flex justify-center h-72 min-h-[18rem]">
        <AnimatePresence>
          {current < statements.length && (
            <motion.div
              key={statements[current].dimension}
              className="absolute w-full flex justify-center"
              initial={{ opacity: 0, scale: 0.95, x: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: -100 }}
              transition={{ duration: 0.25 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={handleDragEnd}
              style={{ touchAction: 'pan-x', cursor: 'grab' }}
            >
              <StatementCard text={statements[current].text} />
              <div className="flex justify-between mt-2 px-4">
                <span className="text-xs text-inquisitive-red">Swipe Left = Disagree</span>
                <span className="text-xs text-curious-blue">Swipe Right = Agree</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}; 