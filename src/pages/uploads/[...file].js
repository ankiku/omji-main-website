export const prerender = false;
import fs from 'fs';
import { getUploadPath } from '../../lib/data-store.js';

export async function GET({ params }) {
  try {
    const file = params.file;
    if (!file) return new Response('Not Found', { status: 404 });

    const filePath = getUploadPath(file);
    
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      
      // Determine content type
      let contentType = 'application/octet-stream';
      if (file.endsWith('.jpg') || file.endsWith('.jpeg')) contentType = 'image/jpeg';
      else if (file.endsWith('.png')) contentType = 'image/png';
      else if (file.endsWith('.webp')) contentType = 'image/webp';
      else if (file.endsWith('.svg')) contentType = 'image/svg+xml';
      
      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      });
    }
  } catch(e) {}
  
  return new Response('Not Found', { status: 404 });
}
