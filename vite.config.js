import { defineConfig } from 'vite';

// Single HTML shell (index.html) + client-side router (src/router.js).
// appType 'spa' makes the dev/preview server fall back to index.html for clean URLs
// like /login or /materials/123; in production Netlify does the same via public/_redirects.
export default defineConfig({
  appType: 'spa',
  build: {
    target: 'es2022', // top-level await in src/main.js
  },
});
