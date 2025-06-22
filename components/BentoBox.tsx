import React from 'react';
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
  return (
    <div className="rounded-2xl shadow-2xl p-8 bg-white max-w-6xl mx-auto">
      <div className="space-y-8">
        <h2 className="text-4xl font-bold text-center mb-8 text-gray-800">Business Bento</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Product/Service */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
            <h3 className="font-bold text-xl mb-3 text-blue-800">Product/Service</h3>
            <p className="text-gray-700 leading-relaxed">{bento.productService}</p>
          </div>

          {/* Positioning */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
            <h3 className="font-bold text-xl mb-3 text-purple-800">Positioning</h3>
            <p className="text-gray-700 leading-relaxed">{bento.positioning}</p>
          </div>

          {/* Direct Competitors */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-xl mb-4 text-gray-900">Direct Competitors</h3>
            <div className="flex flex-wrap gap-4">
              {bento.competitors.map((competitor, index) => (
                <div key={index} className="flex items-center gap-3">
                  {competitorLogos[competitor] ? (
                    <img 
                      src={competitorLogos[competitor]} 
                      alt={competitor}
                      className="w-12 h-12 rounded-xl object-contain bg-gray-50 p-2 border border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                      {competitor.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">{competitor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Why We Exist - Full Width */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100">
          <h3 className="font-bold text-2xl mb-4 text-green-800">Why We Exist</h3>
          <p className="text-gray-700 leading-relaxed text-lg">{bento.whyWeExist}</p>
        </div>

        {/* Original fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100">
            <h3 className="font-bold text-xl mb-3 text-blue-800">Business Model</h3>
            <p className="text-gray-700 leading-relaxed">{bento.businessModel}</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-2xl border border-red-100">
            <h3 className="font-bold text-xl mb-3 text-red-800">Customer Challenge</h3>
            <p className="text-gray-700 leading-relaxed">{bento.customerChallenge}</p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4 justify-end mt-8">
        <button
          className="px-8 py-4 rounded-full bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-lg"
          onClick={onRetry}
          disabled={isLoading}
        >
          {isLoading ? 'Regenerating...' : 'Retry'}
        </button>
        <button
          className="px-8 py-4 rounded-full bg-black text-white font-semibold hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-lg"
          onClick={onApprove}
          disabled={isLoading}
        >
          {isLoading ? 'Please wait...' : 'Looks good, next'}
          <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
}; 