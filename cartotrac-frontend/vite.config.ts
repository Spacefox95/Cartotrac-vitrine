import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      app: path.resolve(__dirname, './src/app'),
      features: path.resolve(__dirname, './src/features'),
      shared: path.resolve(__dirname, './src/shared'),
      styles: path.resolve(__dirname, './src/styles'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
});