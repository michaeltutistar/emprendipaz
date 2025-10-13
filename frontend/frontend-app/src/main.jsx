import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import API_BASE_URL from '@/config/api'

const originalFetch = window.fetch.bind(window)

const resolveApiUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return url
  }

  if (!url.startsWith('/api')) {
    return url
  }

  // En desarrollo local, API_BASE_URL es '/api', así que no hacer nada
  if (API_BASE_URL === '/api') {
    return url
  }

  // En producción, API_BASE_URL ya incluye '/api' al final
  // Entonces solo necesitamos reemplazar '/api' con la URL completa
  return url.replace('/api', API_BASE_URL)
}

window.fetch = (input, init) => {
  // Agregar token JWT a las peticiones si está disponible
  const token = localStorage.getItem('authToken')
  if (token && init) {
    if (!init.headers) {
      init.headers = {}
    }
    if (typeof init.headers === 'object' && !init.headers['Authorization']) {
      init.headers['Authorization'] = `Bearer ${token}`
    }
  }

  if (typeof input === 'string') {
    const resolvedUrl = resolveApiUrl(input)
    return originalFetch(resolvedUrl, init)
  }

  if (input instanceof Request) {
    const resolvedUrl = resolveApiUrl(input.url)
    if (resolvedUrl !== input.url) {
      input = new Request(resolvedUrl, input)
    }
    return originalFetch(input, init)
  }

  return originalFetch(input, init)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
