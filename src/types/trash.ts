export interface TrashItem {
  id: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  keywords: string[];
  timestamp: Date;
}

export interface KeywordColor {
  keyword: string;
  color: string;
  count?: number;
  lastUsedAt?: string;
}

export interface TrashLocation {
  id: string;
  latitude: number;
  longitude: number;
  keywords: string[];
  createdAt: string;
  expiresAt: string;
}

// Add the new type for Stank Zones
export interface StankZone {
  id: string; // UUID from Supabase
  latitude: number;
  longitude: number;
  notes: string | null;
  created_at: string; // ISO 8601 timestamp string
  updated_at: string; // ISO 8601 timestamp string
  creator_id: string | null; // UUID of the user from auth.users
}