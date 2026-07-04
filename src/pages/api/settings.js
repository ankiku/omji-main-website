import fs from 'fs';
import { getDataPath } from '../../lib/data-store.js';

export async function GET() {
  try {
    const dataPath = getDataPath('settings.json');
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf-8');
      return new Response(data, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const dataPath = getDataPath('settings.json');
    
    let settings = {};
    if (fs.existsSync(dataPath)) {
      settings = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }
    
    settings = { ...settings, ...body };
    
    fs.writeFileSync(dataPath, JSON.stringify(settings, null, 2));
    
    return new Response(JSON.stringify({ success: true, settings }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
