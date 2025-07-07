import { defineConfig } from 'vite';
import { writeFileSync } from 'fs';
import { join } from 'path';

export default defineConfig({
  base: '/proyek-akhir/',
  server: {
    host: 'localhost',
    port: 5178,
  },
  build: {
    outDir: 'dist',
  },
  plugins: [
    {
      name: 'add-nojekyll',
      writeBundle() {
        const filePath = join('dist', '.nojekyll');
        writeFileSync(filePath, '');
        console.log('✔️ .nojekyll file generated in dist/');
      }
    }
  ]
});
