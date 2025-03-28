import React from 'react'
import logoImage from './logo.png'

export function VanIsleArmpit() {
  return (
    <img 
      src={logoImage} 
      alt="Van Isle Armpit Logo"
      className="w-full h-auto"
      style={{ 
        maxWidth: '100%',
        filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))'
      }}
    />
  )
} 