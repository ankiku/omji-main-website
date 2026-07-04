import path from 'path';
import fs from 'fs';

function getHostingerBase() {
  const hostingerRoot = '/home/u243661666/domains/omjiconstruction.com/persistent_data_omji';
  if (fs.existsSync('/home/u243661666')) {
    return hostingerRoot;
  }
  return null;
}

export function getDataPath(filename) {
  let dir;
  if (process.env.DATA_DIR) {
    dir = process.env.DATA_DIR;
  } else {
    const hBase = getHostingerBase();
    if (hBase) {
      dir = path.join(hBase, 'data');
    } else {
      dir = path.join(process.cwd(), 'data');
    }
  }
  
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, filename);
}

export function getUploadPath(filename = '') {
  let dir;
  if (process.env.UPLOADS_DIR) {
    dir = process.env.UPLOADS_DIR;
  } else {
    const hBase = getHostingerBase();
    if (hBase) {
      dir = path.join(hBase, 'uploads');
    } else {
      dir = path.join(process.cwd(), 'public', 'uploads');
    }
  }
  
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, filename);
}

export function getProjects() {
  const DATA_FILE = getDataPath('projects.json');
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch(e) { return []; }
}
