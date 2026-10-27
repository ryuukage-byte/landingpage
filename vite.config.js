import { defineConfig } from 'vite';
import { resolve } from 'path';

// Two pages. Their scripts are plain (non-module) files in public/, which Vite copies as-is.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        lab: resolve(import.meta.dirname, 'lab.html'),
      },
    },
  },
});
