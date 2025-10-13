// Configuración dinámica según el entorno
// Usar variable de entorno VITE_API_URL si está disponible (para ambientes dinámicos)
// Si no, usar la URL de producción o desarrollo según el entorno
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production'
    ? "https://by89bq27g7.execute-api.us-east-1.amazonaws.com/dev/api"
    : "/api");

export default API_BASE_URL;