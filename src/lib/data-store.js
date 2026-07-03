import path from 'path';

export function getBaseDir() {
  return process.env.PERSISTENT_DATA_PATH || process.cwd();
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
