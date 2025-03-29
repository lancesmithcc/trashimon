import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';

// Default data for development
const defaultData = {
  tags: {
    tags: [
      { keyword: "mcdonalds", color: "#FF0000", count: 0 },
      { keyword: "beer cans", color: "#FFD700", count: 0 },
      { keyword: "plastic bottles", color: "#00FF00", count: 0 },
      { keyword: "cigarette butts", color: "#808080", count: 0 },
      { keyword: "food wrappers", color: "#FFA500", count: 0 }
    ]
  },
  locations: {
    locations: []
  }
};

// Create data directory if it doesn't exist
const dataDir = path.resolve('data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Initialize data files if they don't exist
['tags.json', 'locations.json'].forEach(filename => {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    const key = filename.replace('.json', '') as keyof typeof defaultData;
    fs.writeFileSync(filePath, JSON.stringify(defaultData[key], null, 2));
  }
});

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Trashimon',
        short_name: 'Trashimon',
        description: 'Clean Up This Stinkin\' Town',
        theme_color: '#242f3e',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'src/components/assets/logo.png',
            sizes: '96x96 128x128 192x192 256x256 384x384 512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/.netlify/functions/get-data': {
        target: 'http://localhost:5173',
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            const url = new URL(req.url!, 'http://localhost:5173');
            const filename = url.searchParams.get('filename');
            
            if (filename && ['tags.json', 'locations.json'].includes(filename)) {
              const filePath = path.join(dataDir, filename);
              if (fs.existsSync(filePath)) {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                res.writeHead(200, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify(data));
              } else {
                res.writeHead(404);
                res.end();
              }
            } else {
              res.writeHead(400);
              res.end();
            }
          });
        },
      },
      '/.netlify/functions/save-data': {
        target: 'http://localhost:5173',
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            let body = '';
            req.on('data', chunk => {
              body += chunk;
            });
            
            req.on('end', () => {
              try {
                const { filename, data } = JSON.parse(body);
                
                if (filename && ['tags.json', 'locations.json'].includes(filename)) {
                  const filePath = path.join(dataDir, filename);
                  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                  
                  res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                  });
                  res.end(JSON.stringify({ success: true }));
                } else {
                  res.writeHead(400);
                  res.end();
                }
              } catch (error) {
                res.writeHead(500);
                res.end();
              }
            });
          });
        },
      },
    },
  },
});