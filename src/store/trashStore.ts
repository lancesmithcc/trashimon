import { create } from 'zustand';
import { TrashItem, KeywordColor, TrashLocation, StankZone } from '../types/trash';
import { supabase } from '../lib/supabaseClient';

interface TrashState {
  trashItems: TrashItem[];
  locations: TrashLocation[];
  keywords: KeywordColor[];
  stankZones: StankZone[];
  addTrashItem: (item: TrashItem) => Promise<void>;
  addKeyword: (keyword: string) => Promise<void>;
  getPopularTags: () => KeywordColor[];
  cleanupExpiredLocations: () => Promise<void>;
  cleanupExpiredKeywords: () => Promise<void>;
  fetchStankZones: () => Promise<void>;
  addStankZone: (latitude: number, longitude: number, notes: string | null) => Promise<StankZone | null>;
  updateStankZoneNotes: (zoneId: string, notes: string) => Promise<StankZone | null>;
  deleteStankZone: (zoneId: string) => Promise<void>;
}

const generateColor = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B786F'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const useTrashStore = create<TrashState>((set, get) => ({
  trashItems: [],
  locations: [],
  keywords: [],
  stankZones: [],
  
  addTrashItem: async (item) => {
    try {
      // First, update local state for immediate UI feedback
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

        return {
          trashItems: [...state.trashItems, item],
          locations: [...state.locations, newLocation],
          keywords: updatedKeywords
        };
      });

      // Then save to Supabase
      const now = new Date();
      const expiresAt = new Date(now.getTime() + ONE_WEEK_MS);
      
      // Insert into trash_locations table
      await supabase
        .from('trash_locations')
        .insert({
          id: item.id,
          latitude: item.latitude,
          longitude: item.longitude,
          keywords: item.keywords,
          created_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          image_url: item.imageUrl
        });

      // Update keyword counts and last_used_at
      const nowIso = new Date().toISOString();
      for (const keyword of item.keywords) {
        // Upsert - update if exists, insert if not
        await supabase
          .from('keywords')
          .upsert({ 
            keyword,
            color: get().keywords.find(k => k.keyword === keyword)?.color || generateColor(),
            count: (get().keywords.find(k => k.keyword === keyword)?.count || 0) + 1,
            last_used_at: nowIso
          }, { 
            onConflict: 'keyword',
            ignoreDuplicates: false 
          });
      }
    } catch (error) {
      console.error('Error adding trash item:', error);
    }
  },

  addKeyword: async (keyword) => {
    try {
      const nowIso = new Date().toISOString();
      const newKeywordData = { 
        keyword, 
        color: generateColor(), 
        count: 0,
        last_used_at: nowIso
      };

      // Update local state (add lastUsedAt)
      set((state) => ({
        keywords: [...state.keywords, { ...newKeywordData, lastUsedAt: nowIso } ]
      }));

      // Save to Supabase
      await supabase
        .from('keywords')
        .insert(newKeywordData);
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
      // Update local state
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

      // Delete expired items from Supabase
      const now = new Date().toISOString();
      await supabase
        .from('trash_locations')
        .delete()
        .lt('expires_at', now);
    } catch (error) {
      console.error('Error cleaning up locations:', error);
    }
  },

  cleanupExpiredKeywords: async () => {
    try {
      const oneWeekAgo = new Date(Date.now() - ONE_WEEK_MS).toISOString();
      
      // Delete expired items from Supabase
      const { error } = await supabase
        .from('keywords')
        .delete()
        .lt('last_used_at', oneWeekAgo);

      if (error) {
        console.error('Error cleaning up keywords:', error);
      } else {
        // Optionally: Fetch updated keywords and update local state
        // This prevents showing deleted keywords until next full init
        const { data: currentKeywords, error: fetchError } = await supabase
          .from('keywords')
          .select('*');
        if (!fetchError && currentKeywords) {
          set({ 
            keywords: currentKeywords.map(k => ({ 
              keyword: k.keyword, 
              color: k.color, 
              count: k.count, 
              lastUsedAt: k.last_used_at 
            })) 
          });
        }
      }
    } catch (error) {
      console.error('Error during keyword cleanup:', error);
    }
  },

  fetchStankZones: async () => {
    // Implementation of fetchStankZones
  },

  addStankZone: async (latitude: number, longitude: number, notes: string | null) => {
    // Implementation of addStankZone
  },

  updateStankZoneNotes: async (zoneId: string, notes: string) => {
    // Implementation of updateStankZoneNotes
  },

  deleteStankZone: async (zoneId: string) => {
    // Implementation of deleteStankZone
  },
}));

// --- Store Initialization ---
const initializeStore = async () => {
  // ... (initialization logic) ...
};

// Call initialization function when the module loads
initializeStore(); // Uncomment this line

// Run cleanup periodically (e.g., every hour)
// const cleanupInterval = setInterval(() => { // Keep interval commented for now if preferred
//   console.log("Running cleanup tasks...");
//   const store = useTrashStore.getState();
//   store.cleanupExpiredLocations();
//   store.cleanupExpiredKeywords();
// }, 60 * 60 * 1000); // 1 hour