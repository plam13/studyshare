import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const root = import.meta.dirname;

// Multi-page app: every HTML file in the project root is a separate page/entry.
const pages = [
  'index',
  'register',
  'login',
  'courses',
  'course',
  'material',
  'material-edit',
  'profile',
  'admin',
];

export default defineConfig({
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((name) => [name, resolve(root, `${name}.html`)])),
    },
  },
});
