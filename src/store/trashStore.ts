import { create } from 'zustand';
import { TrashItem, KeywordColor, TrashLocation, StankZone } from '../types/trash';
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

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
  addStankZone: (latitude: number, longitude: number, notes: string | null) => Promise<void>;
  updateStankZoneNotes: (zoneId: string, notes: string) => Promise<void>;
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
    console.log('[fetchStankZones] Fetching stank zones');
    try {
      const { data, error } = await supabase
        .from('stank_zones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[fetchStankZones] Error fetching stank zones:', error);
        return;
      }

      if (data) {
        console.log('[fetchStankZones] Successfully fetched stank zones:', data.length);
        set({ stankZones: data as StankZone[] });
      }
    } catch (error) {
      console.error('[fetchStankZones] Error caught:', error);
    }
  },

  addStankZone: async (latitude, longitude, notes) => {
    console.log('[addStankZone] Action started:', { latitude, longitude, notes });
    
    const tempId = `temp-${uuidv4()}`; 
    const now = new Date().toISOString();
    // Optimistic update: No creator_id needed locally if anonymous
    const tempZone: StankZone = {
      id: tempId,
      latitude,
      longitude,
      notes,
      created_at: now,
      updated_at: now,
      creator_id: null, // Keep null as we are anonymous
    };

    set((state) => ({
      stankZones: [tempZone, ...state.stankZones]
    }));

    try {
      // REMOVED: User check
      // const { data: { user }, error: userError } = await supabase.auth.getUser();
      // console.log('[addStankZone] User check:', { user, userError });
      // if (userError || !user) {
      //   console.error('[addStankZone] User must be logged in. Reverting optimistic update.');
      //   set((state) => ({ stankZones: state.stankZones.filter(z => z.id !== tempId) }));
      //   return;
      // }

      // Data to insert - remove creator_id
      const newZoneData = {
        latitude,
        longitude,
        notes,
        // creator_id: user.id, // Removed
      };
      console.log('[addStankZone] Inserting data:', newZoneData);

      const { data, error } = await supabase
        .from('stank_zones')
        .insert(newZoneData)
        .select()
        .single();

      console.log('[addStankZone] Supabase response:', { data, error });

      if (error) {
        console.error("Supabase insert error (stank_zones):", error);
        set((state) => ({ stankZones: state.stankZones.filter(z => z.id !== tempId) }));
        throw error;
      }

      if (data) {
        console.log('[addStankZone] Replacing temp zone with real data:', data);
        set((state) => ({
          stankZones: state.stankZones.map(zone => 
            zone.id === tempId ? (data as StankZone) : zone
          )
        }));
      } else {
        console.warn("[addStankZone] Insert succeeded but no data returned. Reverting optimistic update.");
        set((state) => ({ stankZones: state.stankZones.filter(z => z.id !== tempId) }));
      }
    } catch (error) {
      console.error('[addStankZone] Error caught:', error);
      set((state) => ({ stankZones: state.stankZones.filter(z => z.id !== tempId) }));
    }
  },

  updateStankZoneNotes: async (zoneId, notes) => {
    try {
      // REMOVED: User check
      //  const { data: { user } } = await supabase.auth.getUser();
      //  if (!user) {
      //      console.error("User must be logged in to update notes.");
      //      return;
      //  }

      const { data, error } = await supabase
        .from('stank_zones')
        .update({ notes, updated_at: new Date().toISOString() }) // Also update updated_at
        .eq('id', zoneId)
        .select()
        .single();

      if (error) {
          console.error("Supabase update error (stank_zones):", error);
          throw error;
      }

      if (data) {
        set((state) => ({
          stankZones: state.stankZones.map((zone) =>
            zone.id === zoneId ? (data as StankZone) : zone
          ),
        }));
      } else {
       // Note: Supabase update might not return data by default unless specified
       console.warn("Stank zone notes update succeeded but no data returned. Fetching updated zones...");
       // Optionally fetch updated zones to refresh state if needed
       get().fetchStankZones(); 
      }
    } catch (error) {
      console.error('Error updating stank zone notes:', error);
    }
  },

  deleteStankZone: async (zoneId: string) => {
    console.log('[deleteStankZone] Action started for zone ID:', zoneId);
    // Optimistic update: Remove immediately
    set((state) => ({
      stankZones: state.stankZones.filter((zone) => zone.id !== zoneId)
    }));

    try {
      // REMOVED: User check
      // const { data: { user }, error: userError } = await supabase.auth.getUser();
      // console.log('[deleteStankZone] User check:', { user, userError });
      // 
      // if (userError || !user) {
      //   console.error('[deleteStankZone] User must be logged in.');
      //   // Revert optimistic update if needed (though less critical for deletes)
      //   // Potentially re-fetch zones: get().fetchStankZones();
      //   return;
      // }

      // Delete the zone from Supabase - remove creator_id check
      const { error } = await supabase
        .from('stank_zones')
        .delete()
        .eq('id', zoneId);
        // .eq('creator_id', user.id); // REMOVED: Security check: only delete if created by this user

      if (error) {
        console.error('[deleteStankZone] Supabase delete error:', error);
        // Revert optimistic update on error by re-fetching all zones
        get().fetchStankZones(); 
        throw error;
      }

      // No need to update local state here, already done optimistically
      console.log('[deleteStankZone] Zone successfully deleted from Supabase');
    } catch (error) {
      console.error('[deleteStankZone] Error caught:', error);
      // Ensure state is consistent on error by re-fetching
       get().fetchStankZones();
    }
  },
}));

// --- Store Initialization ---
const initializeStore = async () => {
  console.log('Initializing trash store...');
  try {
    // Fetch trash locations
    const { data: locations, error: locErr } = await supabase
      .from('trash_locations')
      .select('*');
      
    if (locErr) {
      console.error('Error fetching trash locations:', locErr);
    } else if (locations) {
      useTrashStore.setState({ 
        locations: locations.map(loc => ({
          id: loc.id,
          latitude: loc.latitude,
          longitude: loc.longitude,
          keywords: loc.keywords,
          createdAt: loc.created_at,
          expiresAt: loc.expires_at,
          imageUrl: loc.image_url
        }))
      });
      console.log(`Loaded ${locations.length} trash locations`);
    }

    // Fetch keywords
    const { data: keywords, error: keyErr } = await supabase
      .from('keywords')
      .select('*');
      
    if (keyErr) {
      console.error('Error fetching keywords:', keyErr);
    } else if (keywords) {
      useTrashStore.setState({ 
        keywords: keywords.map(k => ({
          keyword: k.keyword,
          color: k.color,
          count: k.count,
          lastUsedAt: k.last_used_at
        }))
      });
      console.log(`Loaded ${keywords.length} keywords`);
    }

    // Fetch stank zones
    const { data: stankZones, error: stankErr } = await supabase
      .from('stank_zones')
      .select('*')
      .order('created_at', { ascending: false });

    if (stankErr) {
      console.error('Error fetching stank zones:', stankErr);
    } else if (stankZones) {
      useTrashStore.setState({ 
        stankZones: stankZones as StankZone[]
      });
      console.log(`Loaded ${stankZones.length} stank zones`);
    }

    console.log('Trash store initialization complete');
  } catch (error) {
    console.error('Error initializing trash store:', error);
  }
};

// Call initialization function when the module loads
initializeStore();

// Run cleanup periodically (e.g., every hour)
// const cleanupInterval = setInterval(() => { // Keep interval commented for now if preferred
//   console.log("Running cleanup tasks...");
//   const store = useTrashStore.getState();
//   store.cleanupExpiredLocations();
//   store.cleanupExpiredKeywords();
// }, 60 * 60 * 1000); // 1 hour