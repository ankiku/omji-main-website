export const prerender = false;
import fs from 'fs';
import path from 'path';

import { getDataPath, getUploadPath } from '../../lib/data-store.js';

const DATA_FILE = getDataPath('blogs.json');

function getBlogs() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch(e) { return []; }
}

function saveBlogs(data) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  return new Response(JSON.stringify(getBlogs()), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ request }) {
  try {
    const payload = await request.json();
    
    // Support overwriting all blogs (for the 90 post bulk save) or appending one
    if (Array.isArray(payload)) {
      saveBlogs(payload);
    } else {
      const blogs = getBlogs();
      // Add default status if not present
      if (!payload.status) payload.status = 'scheduled';
      blogs.push(payload);
      saveBlogs(blogs);
    }
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// PUT — update a blog by slug (edit content, publish, unpublish)
export async function PUT({ request }) {
  try {
    const payload = await request.json();
    const { slug, ...updates } = payload;
    if (!slug) {
      return new Response(JSON.stringify({ error: 'slug is required' }), { status: 400 });
    }
    
    let blogs = getBlogs();
    const idx = blogs.findIndex(b => b.slug === slug);
    if (idx === -1) {
      return new Response(JSON.stringify({ error: 'Blog not found' }), { status: 404 });
    }
    
    // Handle image upload if base64 provided
    if (updates.image && updates.image.startsWith('data:image/')) {
      const matches = updates.image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `blog-${slug}-${Date.now()}.${ext}`;
        const uploadDir = getUploadPath();
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        fs.writeFileSync(path.join(uploadDir, filename), buffer);
        
        // Ensure static public uploads dir also has it for dev / static output
        const staticUploadDir = path.join(process.cwd(), 'dist', 'client', 'uploads');
        if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
          if (!fs.existsSync(staticUploadDir)) fs.mkdirSync(staticUploadDir, { recursive: true });
          fs.writeFileSync(path.join(staticUploadDir, filename), buffer);
        }
        
        updates.image = `/uploads/${filename}`;
      }
    }
    
    // Merge updates into existing blog
    blogs[idx] = { ...blogs[idx], ...updates };
    saveBlogs(blogs);
    
    return new Response(JSON.stringify({ success: true, blog: blogs[idx] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function DELETE({ request }) {
  try {
    // Check if body has a slug for individual delete
    const text = await request.text();
    if (text) {
      const { slug } = JSON.parse(text);
      if (slug) {
        let blogs = getBlogs();
        blogs = blogs.filter(b => b.slug !== slug);
        saveBlogs(blogs);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // No slug = clear all
    saveBlogs([]);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
