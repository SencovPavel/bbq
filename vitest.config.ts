import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@shared':   path.resolve(__dirname, 'src/shared'),
      '@entities': path.resolve(__dirname, 'src/entities'),
      '@widgets':  path.resolve(__dirname, 'src/widgets'),
      '@screens':  path.resolve(__dirname, 'src/screens'),
      '@app':      path.resolve(__dirname, 'src/app'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
