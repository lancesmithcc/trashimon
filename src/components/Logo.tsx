import React from 'react'
import logoImage from './assets/logo.png';

export const Logo = () => (
  <a href="https://www.vanislearmpit.com/"><img 
    src={logoImage} 
    alt="Trashimon Logo"
    style={{ 
      filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))'
    }}
  /></a>
);