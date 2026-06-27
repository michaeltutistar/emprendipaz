import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import legacy from '@vitejs/plugin-legacy'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  build: {
    // No vaciar dist antes del build: evita EBUSY cuando un archivo (p. ej. vídeo en dist/Modulo7) está en uso
    emptyOutDir: false,
  },
  plugins: [
    react(),
    tailwindcss(),
    legacy({
      targets: ['defaults', 'not IE 11'],
      modernPolyfills: true,
      renderLegacyChunks: true,
      polyfills: [
        'es.promise.finally',
        'es/map',
        'es/set',
        'es.array.flat',
        'es.object.from-entries',
        'es.string.replace-all',
      ],
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production' 
          ? 'https://by89bq27g7.execute-api.us-east-1.amazonaws.com/dev'
          : 'http://localhost:5000',
        changeOrigin: true,
        secure: process.env.NODE_ENV === 'production',
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
