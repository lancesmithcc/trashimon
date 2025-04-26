import React, { useCallback, useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { useTrashStore } from '../store/trashStore';
import { StankZone } from '../types/trash';
import { Trash2, Crosshair, X, LocateFixed } from 'lucide-react';
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
    libraries: ['geometry'],
  });

  const { 
    locations, 
    addTrashItem, 
    cleanupExpiredLocations,
    stankZones,
    fetchStankZones,
    addStankZone,
    updateStankZoneNotes,
    deleteStankZone,
  } = useTrashStore();

  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [location, setLocation] = useState(center);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [isAddingStankZone, setIsAddingStankZone] = useState(false);
  const [selectedStankZone, setSelectedStankZone] = useState<StankZone | null>(null);
  const [trashClickLocation, setTrashClickLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [activeEmojis, setActiveEmojis] = useState<Array<{ id: string; emoji: string; top: string; left: string }>>([]);
  const availableEmojis = ['💩', '🤮'];

  const handleEmojiComplete = useCallback((idToRemove: string) => {
    setActiveEmojis(prev => prev.filter(e => e.id !== idToRemove));
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (activeEmojis.length < 15) {
        const newEmoji = {
          id: uuidv4(),
          emoji: availableEmojis[Math.floor(Math.random() * availableEmojis.length)],
          top: `${Math.random() * 90}%`,
          left: `${Math.random() * 90}%`,
        };
        setActiveEmojis(prev => [...prev, newEmoji]);
      }
    }, 1500);

    return () => clearInterval(intervalId);
  }, [activeEmojis.length]);

  useEffect(() => {
    cleanupExpiredLocations();
    fetchStankZones();
  }, [cleanupExpiredLocations, fetchStankZones]);

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

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);
    if (userLocation) {
        // Don't pan automatically on load, let user control
        // map.panTo(userLocation); 
    }
  }, [userLocation]);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (isAddingStankZone && e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      addStankZone(lat, lng, null); 
      setIsAddingStankZone(false); 
    } else if (!isAddingStankZone && e.latLng) {
        const clickLat = e.latLng.lat();
        const clickLng = e.latLng.lng();

        const nearbyLocation = locations.find(loc => {
            const distance = google.maps.geometry?.spherical.computeDistanceBetween(
                new google.maps.LatLng(clickLat, clickLng),
                new google.maps.LatLng(loc.latitude, loc.longitude)
            );
            return distance !== undefined && distance < LOCATION_THRESHOLD + 20; 
        });
        
        const nearbyStankZone = stankZones.find(zone => {
             const distance = google.maps.geometry?.spherical.computeDistanceBetween(
                new google.maps.LatLng(clickLat, clickLng),
                new google.maps.LatLng(zone.latitude, zone.longitude)
            );
            return distance !== undefined && distance < LOCATION_THRESHOLD + 20;
        });

        if (!nearbyLocation && !nearbyStankZone) {
            setTrashClickLocation({ lat: clickLat, lng: clickLng });
            setShowTagSuggestions(true); 
        } else if (nearbyStankZone) {
             handleStankZoneMarkerClick(nearbyStankZone);
        } else {
            console.log("Clicked near existing trash location:", nearbyLocation?.id);
        }
    }
  }, [isAddingStankZone, addStankZone, locations, stankZones]);

  const handleTagSelect = (tag: string) => {
    if (trashClickLocation) { 
      const newItem = { 
          id: uuidv4(),
          latitude: trashClickLocation.lat, 
          longitude: trashClickLocation.lng, 
          keywords: [tag],
          imageUrl: '', 
          timestamp: new Date(),
      };
      addTrashItem(newItem);
      setTrashClickLocation(null);
    } else {
        console.warn("Tried to select tag without a click location stored.");
    }
    setShowTagSuggestions(false);
  };

  const centerOnUser = () => {
    if (userLocation && mapRef) {
      mapRef.panTo(userLocation);
      mapRef.setZoom(15);
    }
  };

  const handleStankZoneMarkerClick = (zone: StankZone) => {
    setSelectedStankZone(zone); 
  };

  const handleCloseStankZonePopup = () => {
    setSelectedStankZone(null);
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps</div>;

  const mapOptions = {
    styles: darkMapStyle,
    backgroundColor: '#242f3e',
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: false,
    gestureHandling: 'greedy',
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 md:top-8 left-4 z-10 w-16 h-auto md:w-64">
        <Logo />
      </div>

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
        options={mapOptions}
        onLoad={onMapLoad}
        onClick={onMapClick}
        mapContainerClassName={isAddingStankZone ? 'cursor-crosshair' : ''}
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
        {stankZones.map((zone) => (
          <Marker
            key={zone.id}
            position={{ lat: zone.latitude, lng: zone.longitude }}
            icon={{ 
              url: '/icons/stank.svg',
              scaledSize: new google.maps.Size(35, 35)
            }}
            title={`Stank Zone (Click to view notes)`}
            onClick={() => handleStankZoneMarkerClick(zone)}
            zIndex={1}
          />
        ))}
      </GoogleMap>

      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-3">
        <button
          onClick={() => {
              setIsAddingStankZone(false);
              setShowTagSuggestions(true); 
              setTrashClickLocation(userLocation);
          }}
          className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 
                     text-white font-bold py-3 px-3 rounded-full shadow-lg 
                     hover:shadow-xl transition-all transform hover:scale-105 focus:outline-none"
          aria-label="Add Trash"
        >
          <Trash2 size={24} />
        </button>
        
         <button 
            onClick={() => setIsAddingStankZone(true)} 
            disabled={isAddingStankZone} 
            className={`p-3 rounded-full shadow-lg transition-all transform hover:scale-105 focus:outline-none
                       ${isAddingStankZone 
                          ? 'bg-yellow-500/90 cursor-not-allowed animate-pulse ring-2 ring-yellow-300' 
                          : 'bg-gray-800/80 hover:bg-gray-700/90 backdrop-blur-sm'}`}
            aria-label="Add Stank Zone"
            title="Add a Stank Zone (Click map)"
         >
            <img 
                src="/icons/stank.svg" 
                alt="Add Stank Zone" 
                className={`w-6 h-6 ${isAddingStankZone ? 'opacity-60' : ''}`}
            />
         </button>

        {userLocation && (
          <button
            onClick={centerOnUser}
            className="bg-white/80 backdrop-blur-sm hover:bg-white 
                       text-gray-700 font-bold py-3 px-3 rounded-full shadow-lg 
                       hover:shadow-xl transition-all transform hover:scale-105 focus:outline-none"
            aria-label="Center on Me"
          >
            <LocateFixed size={24} />
          </button>
        )}
      </div>

       <div className="absolute top-4 right-4 z-10 w-64">
         <Scoreboard />
       </div>

      {showTagSuggestions && (
        <TagSuggestions
          onSelect={handleTagSelect}
          onClose={() => {
              setShowTagSuggestions(false);
              setTrashClickLocation(null);
          }}
        />
      )}
      
      {selectedStankZone && (
        <StankZonePopup 
          zone={selectedStankZone} 
          onClose={handleCloseStankZonePopup}
          onSaveNotes={updateStankZoneNotes}
          onDelete={deleteStankZone}
        />
      )}

      {isAddingStankZone && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600/90 text-white px-4 py-2 rounded-full shadow-lg z-10 flex items-center space-x-2 animate-fadeIn">
            <span className='text-sm font-medium'>Click map to place Stank Zone</span>
            <button onClick={() => setIsAddingStankZone(false)} className="text-white hover:text-gray-200">
                <X size={18}/>
            </button>
        </div>
      )}
    </div>
  );
}

interface StankZonePopupProps {
  zone: StankZone;
  onClose: () => void;
  onSaveNotes: (zoneId: string, notes: string) => Promise<StankZone | null>;
  onDelete: (zoneId: string) => Promise<void>;
}

function StankZonePopup({ zone, onClose, onSaveNotes, onDelete }: StankZonePopupProps) {
  const [notes, setNotes] = useState(zone.notes || '');
  const [isEditing, setIsEditing] = useState(!zone.notes);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSaveNotes(zone.id, notes);
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to mark this zone as clean?')) {
      setIsDeleting(true);
      await onDelete(zone.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn z-50">
      <div className="bg-gray-900 rounded-2xl p-4 md:p-6 w-full max-w-[90%] md:max-w-md shadow-2xl transform transition-all animate-slideUp border border-yellow-600 border-opacity-50">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-yellow-400 flex items-center">
             <img src="/icons/stank.svg" alt="Stank Zone" className="w-6 h-6 mr-2 opacity-80"/> 
             Stank Zone Details
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Close popup"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
            {isEditing ? (
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this area..."
                    className="w-full h-24 p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 
                             focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder-gray-500 text-sm"
                    autoFocus
                />
            ) : (
                <p className="text-gray-300 text-sm min-h-[3rem] max-h-[10rem] overflow-y-auto bg-gray-800/50 p-2 rounded"> 
                    {notes || <span className="italic text-gray-500">No notes added yet.</span>}
                </p>
            )}

            <div className="flex flex-col md:flex-row gap-3 pt-2">
                {isEditing ? (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 py-2 px-4 rounded-xl font-medium transition-colors text-sm
                                 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Saving...' : 'Save Notes'}
                    </button>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex-1 py-2 px-4 rounded-xl font-medium transition-colors text-sm
                                 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {notes ? 'Edit Notes' : 'Add Notes'}
                    </button>
                )}

                 <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 py-2 px-4 rounded-xl font-medium transition-colors text-sm
                             bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isDeleting ? 'Cleaning...' : 'Mark as Clean'}
                </button>
            </div>
             <p className="text-xs text-gray-500 text-center mt-2">
                Reported: {new Date(zone.created_at).toLocaleString()} 
                {zone.created_at !== zone.updated_at && ` | Updated: ${new Date(zone.updated_at).toLocaleString()}`}
             </p>
        </div>
      </div>
    </div>
  );
}