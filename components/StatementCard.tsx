import React from 'react';

export interface StatementCardProps {
  text: string;
}

export const StatementCard: React.FC<StatementCardProps> = ({ text }) => {
  return (
    <div className="rounded-2xl shadow-xl p-8 bg-why-white text-xl font-semibold text-heedless-black border border-curious-blue/20 transition-transform hover:scale-105 hover:shadow-2xl select-none min-w-[320px] max-w-md mx-auto">
      <span className="block text-center">{text}</span>
    </div>
  );
}; 