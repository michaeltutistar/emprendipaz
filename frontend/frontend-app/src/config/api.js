// Configuración de API
// VITE_API_URL para override, sino usa API Gateway en producción o proxy local en desarrollo
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? "/api" : "https://by89bq27g7.execute-api.us-east-1.amazonaws.com/dev/api");

export default API_BASE_URL;