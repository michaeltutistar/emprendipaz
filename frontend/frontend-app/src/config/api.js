// Configuración dinámica según el entorno
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? "https://by89bq27g7.execute-api.us-east-1.amazonaws.com/dev/api"
  : "/api";

export default API_BASE_URL;