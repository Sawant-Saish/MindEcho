import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 43123,
    host: true,
    allowedHosts: true,
  },
  preview: {
    port: 43123,
    host: true,
    allowedHosts: true,
  },
})
