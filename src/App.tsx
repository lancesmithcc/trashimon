import React, { useState, useEffect } from 'react';
import Map from './components/Map';
import { IntroScreen } from './components/IntroScreen';

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const handleStart = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowIntro(false);
    }, 500);
  };

  return (
    <div className="relative w-full h-full">
      <Map />

      {showIntro && (
        <div className="absolute inset-0 z-50">
          <IntroScreen onStart={handleStart} isExiting={isExiting} />
        </div>
      )}
    </div>
  );
}

export default App;