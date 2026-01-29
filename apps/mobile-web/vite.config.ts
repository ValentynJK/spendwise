import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true, // Needed for Docker to expose the port
    port: 5173,
    watch: {
      usePolling: true, // Use this if HMR doesn't work on Windows/Mac
    },
  },
  plugins: [react()],
})
