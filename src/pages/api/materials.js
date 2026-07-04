export const prerender = false;
import fs from 'fs';
import path from 'path';
import { getDataPath, getMaterials } from '../../lib/data-store.js';

const DATA_FILE = getDataPath('materials.json');

function saveMaterials(data) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  return new Response(JSON.stringify(getMaterials()), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ request }) {
  try {
    const newMaterial = await request.json();
    const materials = getMaterials();
    
    if (!newMaterial.id) newMaterial.id = Date.now().toString();
    if (!newMaterial.date) newMaterial.date = new Date().toISOString();
    
    materials.push(newMaterial);
    saveMaterials(materials);
    
    return new Response(JSON.stringify({ success: true, material: newMaterial }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function DELETE({ request }) {
  try {
    const { id } = await request.json();
    let materials = getMaterials();
    materials = materials.filter(m => m.id !== id);
    saveMaterials(materials);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
