export const prerender = false;
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'projects.json');
const PUBLIC_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const DIST_UPLOAD_DIR = path.join(process.cwd(), 'dist', 'client', 'uploads');

// Ensure upload dirs exist
[PUBLIC_UPLOAD_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function getProjects() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch(e) { return []; }
}

function saveProjects(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  return new Response(JSON.stringify(getProjects()), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ request }) {
  try {
    const newProject = await request.json();
    const projects = getProjects();
    
    const processedImages = [];
    if (newProject.images && Array.isArray(newProject.images)) {
      for (let i = 0; i < newProject.images.length; i++) {
        let imgStr = newProject.images[i];
        if (imgStr.startsWith('data:image/')) {
          const matches = imgStr.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
          if (matches) {
            const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            const fileName = `proj_${Date.now()}_${Math.floor(Math.random()*1000)}_${i}.${ext}`;
            
            // Save to public (permanent)
            fs.writeFileSync(path.join(PUBLIC_UPLOAD_DIR, fileName), buffer);
            
            // Save to dist (immediate serve)
            try {
              if (fs.existsSync(path.join(process.cwd(), 'dist', 'client'))) {
                if (!fs.existsSync(DIST_UPLOAD_DIR)) fs.mkdirSync(DIST_UPLOAD_DIR, { recursive: true });
                fs.writeFileSync(path.join(DIST_UPLOAD_DIR, fileName), buffer);
              }
            } catch(e) {}
            
            processedImages.push(`/uploads/${fileName}`);
          }
        } else {
          processedImages.push(imgStr);
        }
      }
    }
    
    newProject.images = processedImages;
    projects.push(newProject);
    saveProjects(projects);
    
    return new Response(JSON.stringify({ success: true, project: newProject }), {
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
    let projects = getProjects();
    projects = projects.filter(p => p.id !== id);
    saveProjects(projects);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
