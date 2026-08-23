import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: ['.railway.app', '.up.railway.app', 'at30-production.up.railway.app', 'at30-production-787e.up.railway.app', 'localhost'],
    cors: true
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: ['.railway.app', '.up.railway.app', 'localhost']
  }
})
