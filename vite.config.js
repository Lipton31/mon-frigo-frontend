import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Spécifiez une cible de compilation ECMAScript plus moderne
    // 'esnext' cible la dernière version supportée par les navigateurs modernes
    // Cela résoudra l'avertissement "import.meta"
    target: 'esnext',
  },
})
