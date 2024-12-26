import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/NP-Overflow-Open-House/' : '/',
  root: 'src',
  plugins: [
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },

  build: {
    outDir: '../dist',
    emptyOutDir: true,
  }
});
