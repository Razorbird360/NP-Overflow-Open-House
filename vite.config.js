import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteStaticCopy } from 'vite-plugin-static-copy';
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/gh-pages/' : '/',  
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: 'resources/*',
          dest: 'resources'
        }
      ]
    })
  ]
});
