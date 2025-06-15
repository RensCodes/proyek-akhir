import { defineConfig } from 'vite';

export default defineConfig({
  base: '/proyek-akhir/', 
  server: {
    server: {
      host: 'localhost',
      port: 5175,
  },
  build: {
    outDir: 'docs', 
   }
  }
});