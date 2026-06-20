import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/login': 'http://localhost:8000',
      '/register': 'http://localhost:8000',
      '/add_to_cart': 'http://localhost:8000',
      '/wishlist': 'http://localhost:8000',
      '/order': 'http://localhost:8000',
      '/verify': 'http://localhost:8000',
      '/success': 'http://localhost:8000',
      '/verification': 'http://localhost:8000',
      '/products': 'http://localhost:8000',
      '/seller': 'http://localhost:8000',
      '/admin': 'http://localhost:8000',
      '/delete_user': 'http://localhost:8000',
      '/upload': 'http://localhost:8000'
    }
  }
})
