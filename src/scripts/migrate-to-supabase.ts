import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables (consider using dotenv or similar for production)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or key. Set environment variables before running this script.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateData() {
  try {
    // Read data files
    const tagsPath = path.join(__dirname, '../../data/tags.json');
    const locationsPath = path.join(__dirname, '../../data/locations.json');
    
    let tags = [];
    let locations = [];
    
    if (fs.existsSync(tagsPath)) {
      const tagsData = JSON.parse(fs.readFileSync(tagsPath, 'utf8'));
      tags = tagsData.tags || [];
    }
    
    if (fs.existsSync(locationsPath)) {
      const locationsData = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));
      locations = locationsData.locations || [];
    }
    
    console.log(`Found ${tags.length} tags and ${locations.length} locations to migrate.`);
    
    // Insert tags into Supabase
    if (tags.length > 0) {
      const { error: tagsError } = await supabase.from('keywords').insert(tags);
      if (tagsError) {
        console.error('Error inserting tags:', tagsError);
      } else {
        console.log(`Successfully migrated ${tags.length} tags to Supabase.`);
      }
    }
    
    // Insert locations into Supabase
    if (locations.length > 0) {
      const { error: locationsError } = await supabase
        .from('trash_locations')
        .insert(locations.map(loc => ({
          id: loc.id,
          latitude: loc.latitude,
          longitude: loc.longitude,
          keywords: loc.keywords,
          created_at: loc.createdAt,
          expires_at: loc.expiresAt,
          image_url: '' // No image_url in the original data structure
        })));
      
      if (locationsError) {
        console.error('Error inserting locations:', locationsError);
      } else {
        console.log(`Successfully migrated ${locations.length} locations to Supabase.`);
      }
    }
    
    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateData(); 