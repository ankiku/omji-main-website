import path from 'path';

import fs from 'fs';

export function getBaseDir() {
  if (process.env.PERSISTENT_DATA_PATH) return process.env.PERSISTENT_DATA_PATH;
  
  // Auto-detect Hostinger VPS environment - store outside the domain folder to prevent Git wipe!
  const hostingerPath = '/home/u243661666/persistent_data_omji';
  if (fs.existsSync('/home/u243661666')) {
    if (!fs.existsSync(hostingerPath)) fs.mkdirSync(hostingerPath, { recursive: true });
    return hostingerPath;
  }

  // Local development fallback
  return process.cwd();
}

export function getDataPath(filename) {
  return path.join(getBaseDir(), 'data', filename);
}

export function getUploadPath(filename = '') {
  const base = getBaseDir();
  // If base is process.cwd(), we use the public folder for local development
  if (base === process.cwd()) {
    return path.join(process.cwd(), 'public', 'uploads', filename);
  }
  // Otherwise, use the persistent path's uploads folder
  return path.join(base, 'uploads', filename);
}
