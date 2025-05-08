import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'


export default defineConfig({
  base: '/',
  root: './src',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: '../dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, './src')
    }
  }
});