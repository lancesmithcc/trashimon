import { create } from 'zustand';
import { TrashItem, KeywordColor, TrashLocation } from '../types/trash';

interface TrashState {
  trashItems: TrashItem[];
  locations: TrashLocation[];
  keywords: KeywordColor[];
  addTrashItem: (item: TrashItem) => Promise<void>;
  addKeyword: (keyword: string) => Promise<void>;
  getPopularTags: () => KeywordColor[];
  cleanupExpiredLocations: () => Promise<void>;
}

const generateColor = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B786F'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const saveToFile = async (filename: string, data: any) => {
  try {
    const response = await fetch('/.netlify/functions/save-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename, data }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving data:', error);
    throw error;
  }
};

const loadFromFile = async (filename: string) => {
  try {
    const response = await fetch(`/.netlify/functions/get-data?filename=${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
};

export const useTrashStore = create<TrashState>((set, get) => ({
  trashItems: [],
  locations: [],
  keywords: [],
  
  addTrashItem: async (item) => {
    try {
      set((state) => {
        const updatedKeywords = state.keywords.map(k => {
          if (item.keywords.includes(k.keyword)) {
            return { ...k, count: (k.count || 0) + 1 };
          }
          return k;
        });

        const now = new Date();
        const expiresAt = new Date(now.getTime() + ONE_WEEK_MS);
        
        const newLocation: TrashLocation = {
          id: item.id,
          latitude: item.latitude,
          longitude: item.longitude,
          keywords: item.keywords,
          createdAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
        };

        const updatedLocations = [...state.locations, newLocation];
        
        return {
          trashItems: [...state.trashItems, item],
          locations: updatedLocations,
          keywords: updatedKeywords
        };
      });

      // Save to Netlify Functions after state update
      const { locations, keywords } = get();
      await Promise.all([
        saveToFile('locations.json', { locations }),
        saveToFile('tags.json', { tags: keywords })
      ]);
    } catch (error) {
      console.error('Error adding trash item:', error);
    }
  },

  addKeyword: async (keyword) => {
    try {
      const newKeyword = { 
        keyword, 
        color: generateColor(), 
        count: 0 
      };

      set((state) => ({
        keywords: [...state.keywords, newKeyword]
      }));

      // Save to Netlify Functions after state update
      const { keywords } = get();
      await saveToFile('tags.json', { tags: keywords });
    } catch (error) {
      console.error('Error adding keyword:', error);
    }
  },

  getPopularTags: () => {
    const { keywords } = get();
    return [...keywords].sort((a, b) => (b.count || 0) - (a.count || 0));
  },

  cleanupExpiredLocations: async () => {
    try {
      set((state) => {
        const now = new Date();
        const activeLocations = state.locations.filter(location => {
          const expiryDate = new Date(location.expiresAt);
          return expiryDate > now;
        });
        
        return {
          ...state,
          locations: activeLocations
        };
      });

      // Save to Netlify Functions after state update
      const { locations } = get();
      await saveToFile('locations.json', { locations });
    } catch (error) {
      console.error('Error cleaning up locations:', error);
    }
  }
}));

// Initialize data
const initializeStore = async () => {
  try {
    const [tagsData, locationsData] = await Promise.all([
      loadFromFile('tags.json'),
      loadFromFile('locations.json')
    ]);

    useTrashStore.setState({
      keywords: tagsData.tags,
      locations: locationsData.locations
    });
  } catch (error) {
    console.error('Error initializing store:', error);
  }
};

initializeStore();

// Run cleanup every hour
setInterval(() => {
  useTrashStore.getState().cleanupExpiredLocations();
}, 60 * 60 * 1000);