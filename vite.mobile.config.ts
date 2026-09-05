import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  root: fileURLToPath(new URL('./mobile', import.meta.url)),
  base: './',
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  resolve: { alias: {
    '@': fileURLToPath(new URL('.', import.meta.url)),
    'next/link': fileURLToPath(new URL('./mobile/link.tsx', import.meta.url)),
  } },
  css: { postcss: { plugins: [tailwindcss()] } },
  plugins: [react()],
  build: {
    outDir: '../mobile-dist',
    emptyOutDir: true,
    target: 'safari15',
    sourcemap: false,
  },
});
