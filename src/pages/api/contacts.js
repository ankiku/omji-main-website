export const prerender = false;
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'contacts.json');

function getContacts() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch(e) { return []; }
}

function saveContacts(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  return new Response(JSON.stringify(getContacts()), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ request }) {
  try {
    const payload = await request.json();
    const contacts = getContacts();
    
    // Assign ID and date if missing
    payload.id = payload.id || Date.now();
    payload.date = payload.date || new Date().toISOString();
    
    contacts.push(payload);
    saveContacts(contacts);
    
    return new Response(JSON.stringify({ success: true, contact: payload }), {
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
    let contacts = getContacts();
    contacts = contacts.filter(c => c.id !== id);
    saveContacts(contacts);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
