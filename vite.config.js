import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, 'bunutan_state.json');

function getSavedState() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading bunutan_state.json:', e);
    }
  }
  return null;
}

function saveState(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving bunutan_state.json:', e);
  }
}

// Vite plugin providing centralized real-time sync across multiple devices!
function bunutanSyncPlugin() {
  return {
    name: 'bunutan-sync-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // GET /api/data - fetch live state for any phone/device
        if (req.url === '/api/data' && req.method === 'GET') {
          const state = getSavedState();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
          res.end(JSON.stringify(state || {}));
          return;
        }

        // POST /api/draw - record a draw permanently on server
        if (req.url === '/api/draw' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { giverId } = JSON.parse(body);
              const state = getSavedState() || {};
              const drawnIds = state.drawnIds || [];
              if (giverId && !drawnIds.includes(giverId)) {
                drawnIds.push(giverId);
                state.drawnIds = drawnIds;
                saveState(state);
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, drawnIds: state.drawnIds }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // POST /api/sync - sync full state from organizer
        if (req.url === '/api/sync' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              const current = getSavedState() || {};
              const updated = { ...current, ...payload };
              saveState(updated);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, state: updated }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), bunutanSyncPlugin()],
  server: {
    host: true, // Listen on all network addresses (0.0.0.0) so all cellphones can connect!
    port: 5174,
  },
});
