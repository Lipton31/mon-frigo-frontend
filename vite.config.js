import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // On spécifie que le module doit être externalisé pour la compilation
  // afin que Rollup ne tente pas de l'inclure dans le bundle final.
  // Cela résout les erreurs "unresolved import".
  build: {
    target: 'esnext',
    rollupOptions: {
      external: [
        '@google/generative-ai',
      ]
    },
  },
})
