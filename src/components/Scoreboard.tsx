import React, { useState } from 'react';
import { Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { useTrashStore } from '../store/trashStore';

export default function Scoreboard() {
  const { getPopularTags } = useTrashStore();
  const topTags = getPopularTags().slice(0, 5);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-800 w-full overflow-hidden">
      <div 
        className="flex items-center justify-between gap-2 p-4 cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <Trophy size={20} className="text-yellow-400" />
          <h2 className="text-lg font-bold text-white">Top Trash Collected</h2>
        </div>
        {isMinimized ? (
          <ChevronDown size={20} className="text-gray-400" />
        ) : (
          <ChevronUp size={20} className="text-gray-400" />
        )}
      </div>
      
      {!isMinimized && (
        <div className="space-y-2 p-4 pt-0">
          {topTags.map(({ keyword, color, count }, index) => (
            <div
              key={keyword}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-800/50 border border-gray-700"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-700 text-white font-bold text-sm">
                  {index + 1}
                </span>
                <span 
                  className="font-medium text-white capitalize"
                  style={{ color }}
                >
                  {keyword}
                </span>
              </div>
              <span className="text-gray-400 text-sm">
                {count || 0} items
              </span>
            </div>
          ))}

          {topTags.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No trash items recorded yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}