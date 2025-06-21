import React from 'react';

export interface StatementCardProps {
  text: string;
}

export const StatementCard: React.FC<StatementCardProps> = ({ text }) => {
  return (
    <div className="rounded-2xl shadow-xl p-8 bg-why-white text-xl font-semibold text-heedless-black border border-curious-blue/20 select-none w-[300px] h-[500px] flex items-center justify-center">
      <span className="block text-center">{text}</span>
    </div>
  );
}; 