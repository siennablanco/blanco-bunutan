import fs from 'fs';
import path from 'path';

const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const STATE_KEY = 'blanco_bunutan_state_2026';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // 1. Check Upstash / Vercel KV
  if (KV_URL && KV_TOKEN) {
    try {
      const response = await fetch(`${KV_URL}/get/${STATE_KEY}`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` }
      });
      const data = await response.json();
      if (data && data.result) {
        const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
        return res.status(200).json(parsed);
      }
    } catch (e) {
      console.error('Upstash fetch error:', e);
    }
  }

  // 2. Fallback to local file
  try {
    const localFile = path.resolve(process.cwd(), 'bunutan_state.json');
    if (fs.existsSync(localFile)) {
      const content = JSON.parse(fs.readFileSync(localFile, 'utf-8'));
      return res.status(200).json(content);
    }
  } catch (e) {
    console.error('Local file error:', e);
  }

  return res.status(200).json({});
}
