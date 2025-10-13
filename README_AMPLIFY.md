# E-Learning Platform - AWS Amplify

Plataforma de e-learning desarrollada con React (Frontend) y Python/Flask (Backend), desplegada en AWS Amplify.

## 🏗️ Arquitectura

- **Frontend**: React + Vite
- **Backend**: Python Flask + AWS Lambda
- **Base de datos**: PostgreSQL (AWS RDS)
- **Autenticación**: JWT
- **Despliegue**: AWS Amplify
- **CI/CD**: GitHub + Amplify

## 📁 Estructura del Proyecto

```
e-learning-platform/
├── frontend/frontend-app/          # Aplicación React
├── backend/backend-app/            # API Flask
├── amplify/                        # Configuración Amplify
├── database/                       # Scripts de base de datos
└── docs/                          # Documentación
```

## 🚀 Configuración para Desarrollo

### Prerrequisitos

- Node.js 18+
- Python 3.10+
- AWS CLI configurado
- Amplify CLI instalado

### Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repo-url>
cd e-learning-platform
```

2. **Configurar Frontend**
```bash
cd frontend/frontend-app
npm install
```

3. **Configurar Backend**
```bash
cd backend/backend-app
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. **Configurar Amplify**
```bash
amplify init
amplify pull
```

## 🔧 Variables de Entorno

### Frontend (.env)
```
VITE_API_URL=https://tu-api-url.amazonaws.com/dev
```

### Backend (amplify/backend/function/api/src/.env)
```
DATABASE_URL=postgresql://user:pass@host:5432/db
SECRET_KEY=tu-secret-key
```

## 🚀 Despliegue

### Desarrollo Local

**Frontend:**
```bash
cd frontend/frontend-app
npm run dev
```

**Backend:**
```bash
cd backend/backend-app
python src/main.py
```

### Producción (Amplify)

```bash
git push origin main
# Amplify desplegará automáticamente
```

## 👥 Colaboración

### Para nuevos desarrolladores:

1. **Configurar acceso al proyecto Amplify:**
```bash
amplify init
# Seleccionar el proyecto existente
# Usar las credenciales AWS compartidas
```

2. **Sincronizar configuración:**
```bash
amplify pull
```

3. **Crear rama de desarrollo:**
```bash
git checkout -b feature/nueva-funcionalidad
```

## 📊 Monitoreo

- **Logs**: AWS CloudWatch
- **Métricas**: Amplify Console
- **Errores**: AWS X-Ray (configurado)

## 🔐 Seguridad

- Autenticación JWT
- CORS configurado
- Variables de entorno seguras
- Validación de entrada

## 📚 Documentación Adicional

- [Guía de Admin](ADMIN_GUIDE.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Guía de Instalación](INSTALLATION.md)
- [Guía de Producción](PRODUCTION_GUIDE.md)

## 🐛 Troubleshooting

### Errores Comunes

1. **Error 502 Bad Gateway**
   - Verificar conexión a base de datos
   - Revisar logs de Lambda

2. **Error 401 Unauthorized**
   - Verificar token JWT
   - Confirmar permisos de usuario

3. **Error CORS**
   - Verificar configuración en main.py
   - Confirmar dominios permitidos

## 📞 Soporte

Para problemas técnicos, crear un issue en GitHub o contactar al equipo de desarrollo.
