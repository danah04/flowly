import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Forward agent calls to the backend adapter in dev (live mode).
    proxy: {
      '/api/flowly': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
