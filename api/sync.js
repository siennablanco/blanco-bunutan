import fs from 'fs';
import path from 'path';

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const STATE_KEY = 'blanco_bunutan_state_2026';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body || {};
  const updatedAt = payload.updatedAt || Date.now();

  // 1. If Vercel KV is configured (Cloud Database)
  if (KV_URL && KV_TOKEN) {
    try {
      const getRes = await fetch(`${KV_URL}/get/${STATE_KEY}`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` }
      });
      const getData = await getRes.json();
      let state = {};
      if (getData && getData.result) {
        state = typeof getData.result === 'string' ? JSON.parse(getData.result) : getData.result;
      }

      const updated = { ...state, ...payload, updatedAt };

      await fetch(`${KV_URL}/set/${STATE_KEY}`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${KV_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updated)
      });

      return res.status(200).json({ success: true, state: updated, database: 'vercel-kv' });
    } catch (e) {
      console.error('KV sync error:', e);
      return res.status(500).json({ error: e.message });
    }
  }

  // 2. Fallback to local file if running on a server/local machine
  try {
    const localFile = path.resolve(process.cwd(), 'bunutan_state.json');
    if (fs.existsSync(localFile)) {
      const current = JSON.parse(fs.readFileSync(localFile, 'utf-8'));
      const updated = { ...current, ...payload, updatedAt };
      fs.writeFileSync(localFile, JSON.stringify(updated, null, 2), 'utf-8');
      return res.status(200).json({ success: true, state: updated, database: 'local-file' });
    }
  } catch (e) {
    console.error('Local file sync error:', e);
  }

  // If on Vercel without KV connected yet
  return res.status(200).json({ 
    success: true, 
    state: { ...payload, updatedAt }, 
    warning: 'KV_NOT_CONNECTED' 
  });
}
