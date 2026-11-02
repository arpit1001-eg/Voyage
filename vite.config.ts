import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const API = `http://localhost:${process.env.PORT || 8787}`

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      ignored: ['**/node_modules/**', '**/.git/**', '**/data/**'],
    },
    // In development the API runs on its own port; forward these paths to it.
    proxy: {
      '/api': API,
      '/uploads': API,
      '/sitemap.xml': API,
      '/robots.txt': API,
    },
  },
})
