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
}

export interface TrashLocation {
  id: string;
  latitude: number;
  longitude: number;
  keywords: string[];
  createdAt: string;
  expiresAt: string;
}