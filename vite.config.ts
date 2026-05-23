import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    proxy: {
      '/groups': 'http://localhost:3001',
      '/users':  'http://localhost:3001',
      '/agent':  'http://localhost:3001',
    },
  },
})
