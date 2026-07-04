export const prerender = false;
import fs from 'fs';
import path from 'path';
import { getDataPath, getFinances } from '../../lib/data-store.js';

const DATA_FILE = getDataPath('finances.json');

function saveFinances(data) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  return new Response(JSON.stringify(getFinances()), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ request }) {
  try {
    const newTransaction = await request.json();
    const finances = getFinances();
    
    // Auto-generate ID and date if not provided
    if (!newTransaction.id) newTransaction.id = Date.now().toString();
    if (!newTransaction.date) newTransaction.date = new Date().toISOString();
    
    finances.push(newTransaction);
    saveFinances(finances);
    
    return new Response(JSON.stringify({ success: true, transaction: newTransaction }), {
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
    let finances = getFinances();
    finances = finances.filter(f => f.id !== id);
    saveFinances(finances);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
