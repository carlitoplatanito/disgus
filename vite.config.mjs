import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      output: [
        {
          format: 'es',
          entryFileNames: 'cdn/disgus.esm.js',
          chunkFileNames: 'cdn/chunks/[name]-[hash].js',
          assetFileNames: '[name][extname]',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                return 'vendor-react';
              }
              if (id.includes('nostr-tools') || id.includes('nostr-passkey') || id.includes('@scure') || id.includes('@noble')) {
                return 'vendor-nostr';
              }
              return 'vendor-others';
            }
          }
        },
        {
          format: 'iife',
          name: 'Disgus',
          entryFileNames: 'disgus.js',
          assetFileNames: '[name][extname]'
        }
      ]
    },
    cssCodeSplit: false,
    modulePreload: false,
    target: 'es2015',
    chunkSizeWarningLimit: 1000
  },
  path: './',
  plugins: [
    react(),
    {
      name: 'no-module-html',
      apply: 'build',
      transformIndexHtml: {
        order: 'post',
        handler(html) {
          return html.replace(/\btype="module"\s*/g, '').replace(/\bcrossorigin\s*/g, '');
        }
      }
    },
    {
      name: 'wp-disgus',
      apply: 'build',
      closeBundle() {
        copyFileSync('./dist/disgus.js', './wp-disgus/assets/disgus.js');
      }
    }
  ]
});
