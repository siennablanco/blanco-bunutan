import fs from 'fs';
import path from 'path';

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
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

  const { giverId, updatedAt = Date.now() } = req.body || {};
  if (!giverId) {
    return res.status(400).json({ error: 'Missing giverId' });
  }

  // 1. If Upstash / Vercel KV is configured
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

      const drawnIds = state.drawnIds || [];
      if (!drawnIds.includes(giverId)) {
        drawnIds.push(giverId);
        state.drawnIds = drawnIds;
        state.updatedAt = updatedAt;
        
        // Save using standard Upstash command
        await fetch(`${KV_URL}`, {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${KV_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(['SET', STATE_KEY, JSON.stringify(state)])
        });
      }

      return res.status(200).json({ success: true, drawnIds: state.drawnIds });
    } catch (e) {
      console.error('Upstash draw error:', e);
      return res.status(500).json({ error: e.message });
    }
  }

  // 2. Fallback to local file
  try {
    const localFile = path.resolve(process.cwd(), 'bunutan_state.json');
    if (fs.existsSync(localFile)) {
      const state = JSON.parse(fs.readFileSync(localFile, 'utf-8'));
      const drawnIds = state.drawnIds || [];
      if (!drawnIds.includes(giverId)) {
        drawnIds.push(giverId);
        state.drawnIds = drawnIds;
        state.updatedAt = updatedAt;
        fs.writeFileSync(localFile, JSON.stringify(state, null, 2), 'utf-8');
      }
      return res.status(200).json({ success: true, drawnIds: state.drawnIds });
    }
  } catch (e) {
    console.error('Local file error:', e);
  }

  return res.status(200).json({ success: true, drawnIds: [giverId] });
}
