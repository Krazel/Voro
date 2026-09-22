import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  base: './',
  root: fileURLToPath(new URL('./pc', import.meta.url)),
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)), 'next/link': fileURLToPath(new URL('./mobile/link.tsx', import.meta.url)) } },
  css: { postcss: { plugins: [tailwindcss()] } }, plugins: [react()],
  server: { host:'127.0.0.1',port:5205,strictPort:true },
  build: { outDir:'../pc-dist',emptyOutDir:true,target:'es2022' },
});
