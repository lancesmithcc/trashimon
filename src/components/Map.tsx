import { useCallback, useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { useTrashStore } from '../store/trashStore';
import { Trash2, Crosshair, X } from 'lucide-react';
import { Logo } from './Logo';
import Scoreboard from './Scoreboard';
import { AnimatedEmoji } from './AnimatedEmoji';
import { v4 as uuidv4 } from 'uuid';

const mapContainerStyle = {
  width: '100%',
  height: '100vh',
  className: 'map-container'
};

const center = {
  lat: 49.1659,
  lng: -123.9401,
};

const LOCATION_THRESHOLD = 50;
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const darkMapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#242f3e" }]
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#242f3e" }]
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#746855" }]
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }]
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#c1e364" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#c1e364" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }]
  }
];

interface TagSuggestionProps {
  onSelect: (tag: string) => void;
  onClose: () => void;
}

function TagSuggestions({ onSelect, onClose }: TagSuggestionProps) {
  const { keywords, addKeyword } = useTrashStore();
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<typeof keywords>([]);
  
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = keywords.filter(k => 
        k.keyword.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, keywords]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const existingTag = keywords.find(k => 
        k.keyword.toLowerCase() === inputValue.toLowerCase()
      );
      
      if (existingTag) {
        onSelect(existingTag.keyword);
      } else {
        addKeyword(inputValue.trim().toLowerCase());
        onSelect(inputValue.trim().toLowerCase());
      }
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn z-50">
      <div className="bg-gray-900 rounded-2xl p-4 md:p-6 w-full max-w-[90%] md:max-w-md shadow-2xl transform transition-all animate-slideUp border border-gray-800">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-green-400">Trash Tag</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type to search or add new tag..."
              className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 
                       focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500 text-sm md:text-base"
              autoFocus
            />
          </div>

          {suggestions.length > 0 && (
            <div className="mt-2 space-y-2 max-h-[30vh] overflow-y-auto">
              {suggestions.map(({ keyword, color, count }) => (
                <button
                  key={keyword}
                  type="button"
                  onClick={() => onSelect(keyword)}
                  className="w-full p-2 md:p-3 rounded-lg text-left transition-all hover:scale-102 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 
                           hover:shadow-md flex justify-between items-center bg-gray-800 text-sm md:text-base"
                  style={{
                    borderLeft: `4px solid ${color}`,
                  }}
                >
                  <span className="font-medium text-gray-200">{keyword}</span>
                  {count !== undefined && count > 0 && (
                    <span className="text-xs md:text-sm text-gray-400">{count} uses</span>
                  )}
                </button>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="w-full py-2 px-3 md:py-3 md:px-4 rounded-xl font-medium transition-all transform hover:scale-102
                     bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg hover:shadow-xl
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm md:text-base"
          >
            Add Tag
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Map() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const { locations, addTrashItem, cleanupExpiredLocations } = useTrashStore();
  const [location, setLocation] = useState(center);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  // State for emojis
  const [activeEmojis, setActiveEmojis] = useState<Array<{ id: string; emoji: string; top: string; left: string }>>([]);
  const availableEmojis = ['💩', '🤮'];

  // Function to remove an emoji when its animation completes
  const handleEmojiComplete = useCallback((idToRemove: string) => {
    setActiveEmojis(prev => prev.filter(e => e.id !== idToRemove));
  }, []);

  // Effect to add emojis periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (activeEmojis.length < 15) { // Limit the number of emojis on screen
        const newEmoji = {
          id: uuidv4(),
          emoji: availableEmojis[Math.floor(Math.random() * availableEmojis.length)],
          top: `${Math.random() * 90}%`, // Random top position (0-90% to avoid edges)
          left: `${Math.random() * 90}%`, // Random left position (0-90%)
        };
        setActiveEmojis(prev => [...prev, newEmoji]);
      }
    }, 1500); // Add a new emoji every 1.5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [activeEmojis.length]); // Rerun if emoji count changes (e.g., after removal)

  useEffect(() => {
    cleanupExpiredLocations();
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          setLocation(newLocation);
        },
        () => {
          // Silently handle geolocation errors
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const handleTagSelect = (tag: string) => {
    if (userLocation) {
      addTrashItem({
        id: Date.now().toString(),
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        imageUrl: '',
        keywords: [tag],
        timestamp: new Date(),
      });
    }
    setShowTagSuggestions(false);
  };

  const centerOnUser = () => {
    if (userLocation) {
      setLocation(userLocation);
    }
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps</div>;

  return (
    <div className="relative w-full h-full">
      {/* Logo positioned top-left */}
      <div className="absolute top-4 md:top-8 left-4 z-10 w-16 h-auto md:w-64">
        <Logo />
      </div>

      {/* Animated Emojis */}
      {activeEmojis.map(({ id, emoji, top, left }) => (
        <AnimatedEmoji
          key={id}
          id={id}
          emoji={emoji}
          top={top}
          left={left}
          onComplete={handleEmojiComplete}
        />
      ))}

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={15}
        center={location}
        options={{
          styles: darkMapStyle,
          backgroundColor: '#242f3e',
        }}
      >
        {locations.map((item) => {
          const tagColor = useTrashStore.getState().keywords.find(k => k.keyword === item.keywords[0])?.color || '#FF0000';
          const expiryDate = new Date(item.expiresAt);
          const now = new Date();
          const timeLeft = expiryDate.getTime() - now.getTime();
          const opacity = Math.max(0.3, Math.min(0.9, timeLeft / ONE_WEEK_MS));
          
          return (
            <Marker
              key={item.id}
              position={{ lat: item.latitude, lng: item.longitude }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: tagColor,
                fillOpacity: opacity,
                strokeWeight: 2,
                strokeColor: '#FFFFFF',
              }}
            />
          );
        })}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#60A5FA',
              fillOpacity: 0.7,
              strokeWeight: 2,
              strokeColor: '#FFFFFF',
            }}
          />
        )}
      </GoogleMap>

      {/* UI Buttons */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-3">
        <button
          onClick={() => setShowTagSuggestions(true)}
          className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 
                     text-white font-bold py-3 px-3 rounded-full shadow-lg 
                     hover:shadow-xl transition-all transform hover:scale-105 focus:outline-none"
          aria-label="Add Trash"
        >
          <Trash2 size={24} />
        </button>
        {userLocation && (
          <button
            onClick={centerOnUser}
            className="bg-white/80 backdrop-blur-sm hover:bg-white 
                       text-gray-700 font-bold py-3 px-3 rounded-full shadow-lg 
                       hover:shadow-xl transition-all transform hover:scale-105 focus:outline-none"
            aria-label="Center on Me"
          >
            <Crosshair size={24} />
          </button>
        )}
      </div>

      {/* Scoreboard */}
       <div className="absolute top-4 right-4 z-10 w-64">
         <Scoreboard />
       </div>

      {/* Tag Suggestions Modal */}
      {showTagSuggestions && (
        <TagSuggestions
          onSelect={handleTagSelect}
          onClose={() => setShowTagSuggestions(false)}
        />
      )}
    </div>
  );
}