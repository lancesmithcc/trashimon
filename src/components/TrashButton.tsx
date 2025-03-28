import React from 'react'
import { Trash2 } from 'lucide-react'
import trashButtonImg from './assets/trashbutt.png'

interface TrashButtonProps {
  onClick: () => void
}

export function TrashButton({ onClick }: TrashButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative px-4 md:px-8 py-3 md:py-4 rounded-full 
               shadow-xl hover:shadow-green-500/20
               transition-all transform hover:scale-105 animate-float
               flex items-center justify-center md:justify-start gap-2 md:gap-3 w-full
               overflow-hidden"
      style={{
        backgroundImage: `url(${trashButtonImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Overlay to ensure text visibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/80 to-green-500/80 hover:from-blue-600/80 hover:to-green-600/80"></div>
      
      {/* Content positioned above the background */}
      <div className="relative z-10 flex items-center justify-center md:justify-start gap-2 md:gap-3 w-full">
        <Trash2 size={24} className="text-white animate-pulse-custom" />
        <span 
          className="font-bold text-sm md:text-xl tracking-wide text-white force-anton"
        >
          PICKUP TRASH
        </span>
      </div>
    </button>
  )
} 