import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/research': 'http://localhost:8000',
      '/followup': 'http://localhost:8000',
      '/check-topic': 'http://localhost:8000',
    }
  }
})
