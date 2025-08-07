import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  build: {
    target: 'esnext',
  },
  // Cette section est cruciale pour résoudre l'erreur
  optimizeDeps: {
    exclude: ['@google/generative-ai'],
  },
})
