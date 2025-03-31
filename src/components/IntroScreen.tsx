import React from 'react';
import { Logo } from './Logo';

interface IntroScreenProps {
  onStart: () => void;
  isExiting: boolean;
}

export function IntroScreen({ onStart, isExiting }: IntroScreenProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6 animate-fadeIn ${isExiting ? 'animate-fadeOutScale' : ''}`}>
      <div className="w-32 h-auto mb-8 md:w-64">
        <Logo />
      </div>

      <div className="text-center mb-8 max-w-md">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-green-400">Welcome to Trashimon!</h1>
        <p className="text-lg md:text-xl mb-6 text-gray-300">Help clean up our town, one piece of trash at a time.</p>
        
        <h2 className="text-xl md:text-2xl font-semibold mb-3 text-green-300">How to Play:</h2>
        <ul className="list-disc list-inside text-left space-y-2 text-gray-400 mx-auto max-w-sm">
          <li>Explore the map to find real-world trash locations.</li>
          <li>When you're near trash, tap the <span className="inline-block bg-green-500 rounded-full p-1 leading-none mx-1 text-xs">🗑️</span> button.</li>
          <li>Add descriptive tags (e.g., "plastic bottle", "fast food wrapper").</li>
          <li>Your tagged location appears on the map for 1 week to show trash hotspots!!</li>
        </ul>
      </div>

      <button 
        onClick={onStart}
        className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 
                   text-white font-bold py-3 px-8 md:py-4 md:px-10 rounded-full shadow-xl hover:shadow-green-500/30
                   transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900
                   text-lg md:text-xl tracking-wide"
      >
        LET'S CLEAN UP THIS STANKIN' TOWN!
      </button>
    </div>
  );
} 