import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        ai: resolve(import.meta.dirname, 'ai.html'),
        business: resolve(import.meta.dirname, 'business.html'),
        financial: resolve(import.meta.dirname, 'financial.html'),
        learning: resolve(import.meta.dirname, 'learning.html'),
        life: resolve(import.meta.dirname, 'life.html'),
        media: resolve(import.meta.dirname, 'media.html'),
        utilities: resolve(import.meta.dirname, 'utilities.html'),
        simple_form: resolve(import.meta.dirname, 'simple_form.html'),
      }
    }
  }
});
