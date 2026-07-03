import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Resolve the compiled Astro server entry
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// We dynamically import the built entry.mjs that Astro will generate in the dist folder
import(join(__dirname, 'dist', 'server', 'entry.mjs'))
  .catch(err => {
    console.error('Failed to load Astro server entry. Did you run `npm run build`?');
    console.error(err);
    process.exit(1);
  });
