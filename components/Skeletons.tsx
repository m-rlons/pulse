import React from 'react';

export const SwipeInterfaceSkeleton = () => (
  <div className="w-full h-screen flex flex-col items-center justify-between p-8 bg-white animate-pulse">
    {/* Progress Bar Skeleton */}
    <div className="w-full max-w-2xl px-4">
      <div className="h-3 bg-gray-200 rounded-full" />
    </div>

    {/* Card Skeleton */}
    <div className="relative w-full flex justify-center items-center h-[450px]">
      <div className="w-80 h-96 rounded-3xl bg-gray-200" />
    </div>

    {/* Controls Skeleton */}
    <div className="w-full max-w-2xl flex justify-between items-center">
      <div className="h-12 w-40 bg-gray-200 rounded-md" />
      <div className="flex gap-3">
        <div className="w-16 h-12 bg-gray-200 rounded-md" />
        <div className="w-16 h-12 bg-gray-200 rounded-md" />
        <div className="w-16 h-12 bg-gray-200 rounded-md" />
      </div>
    </div>
  </div>
);

export const PersonaPageSkeleton = () => (
    <div className="h-screen w-full bg-white text-black overflow-hidden flex animate-pulse">
      {/* Left side: Persona Image Skeleton */}
      <div className="w-1/2 h-full bg-gray-200" />

      {/* Right side: Chat Skeleton */}
      <div className="w-1/2 h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Message Skeleton */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" />
            <div className="w-3/4 h-16 bg-gray-300 rounded-2xl" />
          </div>
          {/* User Message Skeleton */}
          <div className="flex items-start gap-3 justify-end">
            <div className="w-2/3 h-12 bg-gray-200 rounded-2xl" />
          </div>
           {/* Message Skeleton */}
           <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0" />
            <div className="w-1/2 h-20 bg-gray-300 rounded-2xl" />
          </div>
        </div>

        {/* Input Form Skeleton */}
        <div className="p-4">
          <div className="w-full h-14 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
) 