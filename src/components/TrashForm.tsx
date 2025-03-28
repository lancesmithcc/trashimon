import { useState } from 'react';
import { useTrashStore } from '../store/trashStore';
import { Camera, X, Trash2 } from 'lucide-react';

interface TrashFormProps {
  onClose: () => void;
  location: { lat: number; lng: number };
}

export default function TrashForm({ onClose, location }: TrashFormProps) {
  const { keywords, addTrashItem } = useTrashStore();
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [image, setImage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedKeywords.length > 0 && image) {
      addTrashItem({
        id: Date.now().toString(),
        latitude: location.lat,
        longitude: location.lng,
        imageUrl: image,
        keywords: selectedKeywords,
        timestamp: new Date(),
      });
      onClose();
    }
  };

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords(prev =>
      prev.includes(keyword)
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all animate-slideUp">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Record Trash Collection
            </h2>
            <p className="text-gray-600 text-sm mt-1">Help keep our city clean! 🌍</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Document the trash
            </label>
            <div className="flex justify-center items-center h-48 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 transition-all hover:border-blue-500">
              {image ? (
                <div className="relative w-full h-full">
                  <img
                    src={image}
                    alt="Trash"
                    className="h-full w-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="flex flex-col items-center text-gray-500 hover:text-blue-500 transition-colors"
                  onClick={() => {/* TODO: Implement camera functionality */}}
                >
                  <Camera size={32} />
                  <span className="mt-2 font-medium">Take Photo</span>
                  <span className="text-sm text-gray-400">Click to capture</span>
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What type of trash did you find?
            </label>
            <div className="flex flex-wrap gap-2">
              {keywords.map(({ keyword, color }) => (
                <button
                  key={keyword}
                  type="button"
                  onClick={() => toggleKeyword(keyword)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${
                    selectedKeywords.includes(keyword)
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{
                    borderLeft: `4px solid ${color}`,
                  }}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all transform hover:scale-102 ${
              !image || selectedKeywords.length === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg hover:shadow-xl'
            }`}
            disabled={!image || selectedKeywords.length === 0}
          >
            Save Collection
          </button>
        </form>
      </div>
    </div>
  );
}