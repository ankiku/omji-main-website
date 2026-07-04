import { getDataPath } from '../lib/data-store.js';
import fs from 'fs';

export const prerender = false;
export async function GET() {
  const site = 'https://omjiconstruction.com';
  
  let blogs = [];
  try {
    const dataPath = getDataPath('blogs.json');
    if (fs.existsSync(dataPath)) {
      blogs = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      // Only include published blogs
      blogs = blogs.filter(b => b.status === 'published');
    }
  } catch(e) {
    console.error('Sitemap blog error:', e);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${blogs.map(post => `
    <url>
      <loc>${site}/blog/${post.slug}</loc>
      <lastmod>${new Date(post.publishDate || Date.now()).toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>
  `).join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
