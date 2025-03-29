-- Create trash_locations table
CREATE TABLE IF NOT EXISTS trash_locations (
  id TEXT PRIMARY KEY,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  image_url TEXT
);

-- Create keywords table
CREATE TABLE IF NOT EXISTS keywords (
  keyword TEXT PRIMARY KEY,
  color TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_trash_locations_expires_at ON trash_locations(expires_at);
CREATE INDEX IF NOT EXISTS idx_trash_locations_created_at ON trash_locations(created_at);
CREATE INDEX IF NOT EXISTS idx_keywords_count ON keywords(count DESC);
CREATE INDEX IF NOT EXISTS idx_keywords_last_used_at ON keywords(last_used_at);

-- Add Row Level Security policies
ALTER TABLE trash_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access for reads and writes
CREATE POLICY "Allow anonymous read access to trash_locations" 
  ON trash_locations FOR SELECT USING (true);
  
CREATE POLICY "Allow anonymous insert to trash_locations" 
  ON trash_locations FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous read access to keywords" 
  ON keywords FOR SELECT USING (true);
  
CREATE POLICY "Allow anonymous insert to keywords" 
  ON keywords FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Allow anonymous update to keywords" 
  ON keywords FOR UPDATE USING (true) WITH CHECK (true); 