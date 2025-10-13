# Guía de Configuración de AWS Amplify

## 🚀 Paso 1: Configurar Amplify Console

1. **Ir a AWS Amplify Console**
   - Ve a [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Región: `us-east-1` (misma que tu Lambda actual)

2. **Crear Nueva Aplicación**
   - Clic en "New app" → "Host web app"
   - Selecciona "GitHub" como source
   - Autoriza AWS Amplify a acceder a tu GitHub
   - Selecciona tu repositorio `e-learning-platform`
   - Branch: `main`

3. **Configurar Build Settings**
   ```yaml
   version: 1
   backend:
     phases:
       build:
         commands:
           - amplifyPush --simple
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend/frontend-app
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: frontend/frontend-app/dist
       files:
         - '**/*'
     cache:
       paths:
         - frontend/frontend-app/node_modules/**/*
   ```

4. **Variables de Entorno**
   - En Amplify Console → Tu App → Environment variables
   - Agregar:
     ```
     VITE_API_URL = https://by89bq27g7.execute-api.us-east-1.amazonaws.com/dev
     ```

## 🔧 Paso 2: Migrar Backend a Amplify Functions

### Opción A: Mantener Lambda Actual (Recomendado)
- Mantener tu Lambda function actual funcionando
- Solo usar Amplify para el frontend
- Ventaja: No romper lo que ya funciona

### Opción B: Migrar a Amplify Functions
1. **Inicializar Amplify Backend**
   ```bash
   npm install -g @aws-amplify/cli
   amplify init
   ```

2. **Agregar API Function**
   ```bash
   amplify add api
   # Seleccionar REST API
   # Seleccionar "Create a new Lambda function"
   # Seleccionar Python runtime
   ```

3. **Copiar código de Lambda**
   - Copiar tu código de `backend/backend-app/src/` a la nueva función
   - Ajustar imports y configuración

## 👥 Paso 3: Configurar Colaboración

### Para tu colega:

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/TU-USUARIO/e-learning-platform.git
   cd e-learning-platform
   ```

2. **Instalar Amplify CLI**
   ```bash
   npm install -g @aws-amplify/cli
   ```

3. **Configurar AWS credentials**
   ```bash
   aws configure
   # Usar las mismas credenciales AWS o crear un usuario IAM
   ```

4. **Inicializar Amplify**
   ```bash
   amplify init
   # Seleccionar el proyecto existente
   # Usar el mismo environment o crear uno nuevo para desarrollo
   ```

5. **Sincronizar configuración**
   ```bash
   amplify pull
   ```

## 🔄 Paso 4: Workflow de Desarrollo

### Desarrollo Local
```bash
# Frontend
cd frontend/frontend-app
npm run dev

# Backend (si usas Amplify functions)
amplify mock api
```

### Despliegue
```bash
# Automático con git push
git add .
git commit -m "Nueva funcionalidad"
git push origin main
# Amplify desplegará automáticamente

# Manual con Amplify CLI
amplify push
```

### Branching Strategy
```bash
# Crear rama de feature
git checkout -b feature/nueva-funcionalidad

# Desarrollar y hacer commits
git add .
git commit -m "Implementar nueva funcionalidad"

# Push y crear Pull Request
git push origin feature/nueva-funcionalidad
# Crear PR en GitHub

# Merge a main despliega automáticamente
```

## 📊 Paso 5: Monitoreo y Logs

### En Amplify Console:
- **Builds**: Ver el progreso de deployments
- **Logs**: Ver logs de build y runtime
- **Metrics**: Monitorear performance

### Para Lambda actual:
- Usar AWS Toolkit en VS Code
- CloudWatch Logs
- X-Ray tracing

## 🔐 Paso 6: Configurar Environments

### Desarrollo
```bash
amplify env add dev
# Configurar variables específicas de desarrollo
```

### Producción
```bash
amplify env add prod
# Configurar variables de producción
```

### Variables por Environment
```bash
amplify env checkout dev
amplify update function
# Configurar variables específicas del environment
```

## 🚨 Troubleshooting

### Errores Comunes:

1. **Build Fails**
   - Verificar `amplify.yml`
   - Revisar logs en Amplify Console

2. **CORS Errors**
   - Configurar CORS en Lambda
   - Verificar dominios permitidos

3. **Environment Variables**
   - Verificar en Amplify Console
   - Usar prefijo `VITE_` para variables del frontend

## 📞 Soporte

- **Amplify Docs**: https://docs.amplify.aws/
- **GitHub Issues**: Para reportar bugs del proyecto
- **AWS Support**: Para problemas de infraestructura
