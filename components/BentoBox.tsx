import React from 'react';
import { useRouter } from 'next/navigation';
import { Bento } from '../lib/types';

// Add competitor logo mapping
const competitorLogos: Record<string, string> = {
  'Kahoot': '/logos/kahoot.png',
  'Diff': '/logos/diff.png',
  'Magic School': '/logos/magic-school.png',
  'Nearpod': '/logos/nearpod.png',
  'Quizizz': '/logos/quizizz.png',
  'Blooket': '/logos/blooket.png',
  'Gimkit': '/logos/gimkit.png',
  'ClassDojo': '/logos/classdojo.png',
  'Seesaw': '/logos/seesaw.png',
  'Flipgrid': '/logos/flipgrid.png',
  'Padlet': '/logos/padlet.png',
  'Canva': '/logos/canva.png',
  'Google Classroom': '/logos/google-classroom.png',
  'Microsoft Teams': '/logos/teams.png',
  'Zoom': '/logos/zoom.png',
  'Slack': '/logos/slack.png',
  'Notion': '/logos/notion.png',
  'Trello': '/logos/trello.png',
  'Asana': '/logos/asana.png',
  'Monday.com': '/logos/monday.png'
};

export interface BentoBoxProps {
  bento: Bento;
  onApprove: () => void;
  onRetry: () => void;
  isLoading: boolean;
}

export const BentoBox: React.FC<BentoBoxProps> = ({ bento, onApprove, onRetry, isLoading }) => {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto p-8 animate-fade-in">
      <h1 className="text-4xl font-bold mb-8">Business Bento</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-2 text-sm text-gray-600">Product/Service</h3>
          <p className="text-gray-900">{bento.productService}</p>
        </div>
        
        <div className="card bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-2 text-sm text-gray-600">Positioning</h3>
          <p className="text-gray-900">{bento.positioning}</p>
        </div>
        
        <div className="card bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-semibold mb-2 text-sm text-gray-600">Direct Competitors</h3>
          <div className="flex flex-wrap gap-4 items-center mt-2">
            {bento.competitors.map((competitor, index) => (
              <div key={index} className="flex items-center gap-2">
                {competitorLogos[competitor] ? (
                  <img 
                    src={competitorLogos[competitor]} 
                    alt={competitor}
                    className="w-10 h-10 rounded-lg object-contain"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                    {competitor.charAt(0)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="card bg-white p-6 rounded-2xl shadow-sm mt-6">
        <h3 className="font-semibold mb-2 text-sm text-gray-600">Why We Exist</h3>
        <p className="text-gray-900">{bento.whyWeExist}</p>
      </div>
      
      <div className="flex justify-between mt-16">
        <button
          onClick={() => router.push('/')}
          className="bg-red-500 text-white px-8 py-4 rounded-full font-medium hover:bg-red-600 transition-all"
        >
          Start Over
        </button>
        
        <button
          onClick={onApprove}
          disabled={isLoading}
          className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
        >
          Looks good, next
          <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
}; 