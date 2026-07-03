import path from 'path';

import fs from 'fs';

export function getBaseDir() {
  if (process.env.PERSISTENT_DATA_PATH) return process.env.PERSISTENT_DATA_PATH;
  
  // Auto-detect Hostinger VPS environment
  const hostingerPath = '/home/u243661666/domains/omjiconstruction.com/persistent_data';
  if (fs.existsSync(hostingerPath)) {
    return hostingerPath;
  }

  // Local development fallback
  return process.cwd();
}

export function getDataPath(filename) {
  return path.join(getBaseDir(), 'data', filename);
}

export function getUploadPath(filename = '') {
  if (process.env.PERSISTENT_DATA_PATH) {
    return path.join(process.env.PERSISTENT_DATA_PATH, 'uploads', filename);
  }
  return path.join(process.cwd(), 'public', 'uploads', filename);
}
