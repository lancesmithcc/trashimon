# Trashimon

A mobile-friendly web application for mapping and tracking collected trash items.

## Features

- 📱 Mobile-optimized interface
- 🗺️ Interactive Google Maps integration
- 🏷️ Tag-based trash collection system
- 📊 Leaderboard showing most collected trash types
- 🔄 Real-time updates with Supabase backend
- 🌐 Progressive Web App (PWA) support

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL database)
- **Maps:** Google Maps API
- **Styling:** Tailwind CSS
- **Deployment:** Netlify

## Setup

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Google Maps API key
- Supabase account and project

### Environment Variables

Create a `.env` file in the root directory with the following:

```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Create the required tables using the SQL in `src/lib/supabase-schema.sql`
3. Configure Row Level Security (RLS) policies as per the schema file
4. Get your project URL and anon key from the Supabase dashboard (API section)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Database Schema

### trash_locations

Stores information about trash collection locations.

| Column       | Type             | Description                               |
|--------------|------------------|-------------------------------------------|
| id           | TEXT             | Primary key                               |
| latitude     | DOUBLE PRECISION | Geographic latitude                       |
| longitude    | DOUBLE PRECISION | Geographic longitude                      |
| keywords     | TEXT[]           | Array of tags describing the trash        |
| created_at   | TIMESTAMPTZ      | When the item was recorded                |
| expires_at   | TIMESTAMPTZ      | When the item expires (7 days by default) |
| image_url    | TEXT             | Optional image URL                        |

### keywords

Stores tracking information for keywords/tags.

| Column       | Type             | Description                               |
|--------------|------------------|-------------------------------------------|
| keyword      | TEXT             | Primary key - the tag name                |
| color        | TEXT             | Hex color code for tag display            |
| count        | INTEGER          | Number of items with this tag             |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License. 