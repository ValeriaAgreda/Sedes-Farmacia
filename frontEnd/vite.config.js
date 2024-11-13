import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: ['.'], // Permite el acceso a la raíz del proyecto
    },
  },
})
