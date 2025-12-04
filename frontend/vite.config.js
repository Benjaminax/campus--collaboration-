import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/campus--collaboration-/',
  server: {
    proxy: {
      '/api': {
        target: 'https://campus-collaboration.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'https://campus-collaboration.onrender.com',
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }
  }
})
