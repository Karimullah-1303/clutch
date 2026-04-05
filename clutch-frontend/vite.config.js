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
        target: 'https://clutch-identity-1078092492578.asia-south1.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1/auth': {
        target: 'https://clutch-identity-1078092492578.asia-south1.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1/colleges': {
        target: 'https://clutch-identity-1078092492578.asia-south1.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1/users': {
        target: 'https://clutch-identity-1078092492578.asia-south1.run.app',
        changeOrigin: true,
        secure: false,
      },

      // ==========================================
      // ACADEMIC SERVICE (IntelliJ Port 8082)
      // ==========================================
      '/api/v1/academic/admin': {
        target: 'https://clutch-academic-1078092492578.asia-south1.run.app',
        changeOrigin: true,
        secure: false,
      },
      //  ADDED SYLLABUS PROXY 
      '/api/v1/academic/syllabus': {
        target: 'https://clutch-academic-1078092492578.asia-south1.run.app',
        changeOrigin: true,
        secure: false,
      },
      //  ADDED LESSON PLANS PROXY 
      '/api/v1/academic/lesson-plans': {
        target: 'https://clutch-academic-1078092492578.asia-south1.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1/attendance': {
        target: 'https://clutch-academic-1078092492578.asia-south1.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1/sections': {
        target: 'https://clutch-academic-1078092492578.asia-south1.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1/subjects': {
        target: 'https://clutch-academic-1078092492578.asia-south1.run.app',
        changeOrigin: true,
        secure: false,
      },
      '/api/v1/blocks': {
        target: 'https://clutch-academic-1078092492578.asia-south1.run.app',
        changeOrigin: true,
        secure: false,
      },

      // ==========================================
      // PLACEMENT SERVICE (IntelliJ Port 8083)
      // ==========================================
      '/api/v1/placement': {
        target: 'https://clutch-placement-1078092492578.asia-south1.run.app',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})