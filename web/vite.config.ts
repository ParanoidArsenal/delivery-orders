import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // The API runs separately in development; nginx handles this in production.
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
})
