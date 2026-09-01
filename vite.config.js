import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ai: resolve(__dirname, 'ai.html'),
        business: resolve(__dirname, 'business.html'),
        financial: resolve(__dirname, 'financial.html'),
        learning: resolve(__dirname, 'learning.html'),
        life: resolve(__dirname, 'life.html'),
        media: resolve(__dirname, 'media.html'),
        utilities: resolve(__dirname, 'utilities.html'),
        simple_form: resolve(__dirname, 'simple_form.html'),
      }
    }
  }
});
