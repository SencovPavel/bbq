import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared':   path.resolve(__dirname, 'src/shared'),
      '@entities': path.resolve(__dirname, 'src/entities'),
      '@widgets':  path.resolve(__dirname, 'src/widgets'),
      '@screens':  path.resolve(__dirname, 'src/screens'),
      '@app':      path.resolve(__dirname, 'src/app'),
    },
  },
  build: {
    outDir: 'dist',
  },
  server: {
    proxy: {
      '/groups': 'http://localhost:3001',
      '/users':  'http://localhost:3001',
      '/agent':  'http://localhost:3001',
      '/auth':   'http://localhost:3001',
      '/ws':     { target: 'ws://localhost:3001', ws: true },
    },
  },
})
