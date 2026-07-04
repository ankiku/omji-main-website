import path from 'path';
import fs from 'fs';

export function getDataPath(filename) {
  let dir;
  if (process.env.DATA_DIR) {
    dir = process.env.DATA_DIR;
  } else {
    // Local development fallback
    dir = path.join(process.cwd(), 'data');
  }
  
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, filename);
}

export function getUploadPath(filename = '') {
  let dir;
  if (process.env.UPLOADS_DIR) {
    dir = process.env.UPLOADS_DIR;
  } else {
    // Local development fallback
    dir = path.join(process.cwd(), 'public', 'uploads');
  }
  
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, filename);
}
