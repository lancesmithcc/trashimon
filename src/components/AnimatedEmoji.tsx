import React, { useEffect, useState } from 'react';

interface AnimatedEmojiProps {
  id: string;
  emoji: string;
  top: string;
  left: string;
  duration?: number; // Duration in ms for the emoji to be visible
  onComplete: (id: string) => void;
}

const EMOJI_FADE_DURATION = 500; // ms for fade in/out transitions
const DEFAULT_VISIBLE_DURATION = 3000; // ms emoji stays visible at full opacity

export function AnimatedEmoji({ 
  id, 
  emoji, 
  top, 
  left, 
  duration = DEFAULT_VISIBLE_DURATION, 
  onComplete 
}: AnimatedEmojiProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Fade in shortly after mounting
  useEffect(() => {
    const fadeInTimer = setTimeout(() => {
      setIsVisible(true);
    }, 50); // Small delay to ensure transition triggers

    return () => clearTimeout(fadeInTimer);
  }, []);

  // Schedule fade out and removal
  useEffect(() => {
    if (isVisible) {
      const fadeOutTimer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      const removeTimer = setTimeout(() => {
        onComplete(id);
      }, duration + EMOJI_FADE_DURATION); // Remove after fade out completes

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(removeTimer);
      };
    }
    // Intentionally not dependent on onComplete or id to avoid rescheduling
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, duration]); 

  return (
    <div
      className={`absolute text-4xl md:text-5xl transition-opacity duration-${EMOJI_FADE_DURATION} ease-in-out`}
      style={{
        top,
        left,
        opacity: isVisible ? 1 : 0,
        zIndex: 5, // Below main UI but above map tiles potentially
        textShadow: '0 2px 4px rgba(0,0,0,0.5)', // Add some shadow for visibility
        pointerEvents: 'none', // Prevent interaction
      }}
    >
      {emoji}
    </div>
  );
} 