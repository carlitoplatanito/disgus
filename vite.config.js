import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]'
      }
    },
    cssCodeSplit: false
  },
  path: './',
  plugins: [react()],
});
