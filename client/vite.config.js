import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    https: false,   // 🔥 disable HTTPS for now
    allowedHosts: ['darwin-farouche-hans.ngrok-free.dev'] // Allow ngrok host
  }
})
