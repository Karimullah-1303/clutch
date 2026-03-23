import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // ==========================================
      // IDENTITY SERVICE (IntelliJ Port 8081)
      // ==========================================
      '/api/v1/admin': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1/colleges': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1/users': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },

      // ==========================================
      // ACADEMIC SERVICE (IntelliJ Port 8082)
      // ==========================================
      '/api/v1/academic/admin': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1/attendance': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1/sections': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1/subjects': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1/blocks': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
      },

      // ==========================================
      // PLACEMENT SERVICE (IntelliJ Port 8083)
      // ==========================================
      '/api/v1/placement': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})