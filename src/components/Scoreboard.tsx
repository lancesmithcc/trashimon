import React from 'react';
import { Trophy } from 'lucide-react';
import { useTrashStore } from '../store/trashStore';

export default function Scoreboard() {
  const { getPopularTags } = useTrashStore();
  const topTags = getPopularTags().slice(0, 5);

  return (
    <div className="absolute bottom-24 right-6 bg-gray-900/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-gray-800 w-64">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={20} className="text-yellow-400" />
        <h2 className="text-lg font-bold text-white font-lexend">Top Trash Collected</h2>
      </div>
      
      <div className="space-y-2">
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
    </div>
  );
}