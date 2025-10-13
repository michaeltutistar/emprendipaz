# 🚀 Configuración de CI/CD con AWS CodePipeline y CodeBuild

## 📋 Resumen

Esta guía te ayudará a configurar un pipeline de CI/CD automatizado para el proyecto EmprendiPaz usando AWS CodePipeline y CodeBuild, integrado con GitHub para desarrollo colaborativo.

## 🎯 Beneficios del CI/CD

- ✅ **Despliegue automático** con cada push a la rama principal
- ✅ **Colaboración mejorada** entre desarrolladores
- ✅ **Rollback rápido** en caso de errores
- ✅ **Historial de builds** y logs detallados
- ✅ **Invalidación automática** de CloudFront
- ✅ **Notificaciones** de estado del pipeline

## 🛠️ Prerequisitos

### 1. Repositorio de GitHub
- Crear un repositorio en GitHub para el proyecto
- Subir el código actual al repositorio
- Generar un Personal Access Token con permisos de repositorio

### 2. AWS CLI Configurado
```bash
aws configure
# Ingresar Access Key, Secret Key, Region (us-east-1)
```

### 3. Permisos de AWS
Tu usuario de AWS debe tener permisos para:
- IAM (crear roles y políticas)
- CodeBuild (crear proyectos)
- CodePipeline (crear pipelines)
- S3 (crear buckets)
- CloudFront (invalidaciones)
- Secrets Manager (almacenar tokens)

## 🚀 Pasos de Configuración

### Paso 1: Configurar Variables
Editar el archivo `setup-ci-cd.sh` y cambiar estas variables:

```bash
GITHUB_REPO_OWNER="tu-usuario-github"    # Tu usuario de GitHub
GITHUB_REPO_NAME="tu-repositorio"        # Nombre del repositorio
GITHUB_TOKEN="ghp_xxxxxxxxxxxx"          # Tu token de GitHub
```

### Paso 2: Ejecutar Script de Configuración
```bash
# Dar permisos de ejecución
chmod +x setup-ci-cd.sh

# Ejecutar script
./setup-ci-cd.sh
```

### Paso 3: Verificar Creación de Recursos

#### En AWS Console:
1. **CodeBuild** → Verificar proyecto `elearning-frontend-build`
2. **CodePipeline** → Verificar pipeline `elearning-frontend-pipeline`
3. **S3** → Verificar buckets:
   - `codepipeline-artifacts-elearning`
   - `codebuild-cache-elearning`
4. **IAM** → Verificar roles:
   - `codebuild-elearning-service-role`
   - `codepipeline-elearning-service-role`

## 📁 Estructura de Archivos Creados

```
proyecto/
├── frontend/frontend-app/
│   └── buildspec.yml              # Configuración de build
├── codebuild-config.json          # Configuración de CodeBuild
├── codepipeline-config.json       # Configuración de CodePipeline
├── setup-ci-cd.sh                 # Script de configuración
└── CI-CD-SETUP.md                 # Esta guía
```

## 🔄 Flujo del Pipeline

### 1. **Source Stage**
- Se activa con cada push a la rama `main`
- Descarga el código desde GitHub
- Almacena en S3 como artefacto

### 2. **Build Stage**
- Instala Node.js y pnpm
- Instala dependencias del proyecto
- Ejecuta `pnpm run build`
- Sube archivos a S3 bucket
- Invalida caché de CloudFront

## 📊 Monitoreo y Logs

### Ver Estado del Pipeline
```bash
# Estado general
aws codepipeline get-pipeline-state --name elearning-frontend-pipeline

# Historial de ejecuciones
aws codepipeline list-pipeline-executions --pipeline-name elearning-frontend-pipeline
```

### Ver Logs de Build
```bash
# Listar builds
aws codebuild list-builds-for-project --project-name elearning-frontend-build

# Ver logs específicos
aws logs get-log-events --log-group-name /aws/codebuild/elearning-frontend-build --log-stream-name [STREAM_NAME]
```

## 🔧 Configuración para Desarrollo Colaborativo

### 1. Ramas de Trabajo
```bash
# Crear rama para feature
git checkout -b feature/nueva-funcionalidad

# Hacer cambios y commit
git add .
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad

# Crear Pull Request en GitHub
# Una vez aprobado y mergeado a main, se ejecuta el pipeline automáticamente
```

### 2. Variables de Entorno
Para agregar variables de entorno al build:

```bash
# Actualizar proyecto de CodeBuild
aws codebuild update-project \
    --name elearning-frontend-build \
    --environment '{
        "type": "LINUX_CONTAINER",
        "image": "aws/codebuild/amazonlinux2-x86_64-standard:5.0",
        "computeType": "BUILD_GENERAL1_SMALL",
        "environmentVariables": [
            {"name": "NUEVA_VARIABLE", "value": "valor", "type": "PLAINTEXT"}
        ]
    }'
```

## 🚨 Troubleshooting

### Error: "Role does not exist"
```bash
# Verificar roles creados
aws iam list-roles --query 'Roles[?contains(RoleName, `elearning`)]'
```

### Error: "Access denied to S3"
```bash
# Verificar políticas del rol
aws iam get-role-policy --role-name codebuild-elearning-service-role --policy-name CodeBuildServiceRolePolicy
```

### Error: "GitHub token invalid"
```bash
# Actualizar token en Secrets Manager
aws secretsmanager update-secret \
    --secret-id github-token \
    --secret-string '{"token":"nuevo-token"}'
```

### Pipeline falla en build
1. Ir a AWS Console → CodeBuild → elearning-frontend-build
2. Ver "Build history" → Seleccionar build fallido
3. Revisar "Build logs" para identificar el error
4. Verificar que `buildspec.yml` esté en la ruta correcta

## 📈 Optimizaciones Adicionales

### 1. Notificaciones por Email
```bash
# Crear tópico SNS
aws sns create-topic --name elearning-pipeline-notifications

# Suscribirse al tópico
aws sns subscribe \
    --topic-arn arn:aws:sns:us-east-1:ACCOUNT_ID:elearning-pipeline-notifications \
    --protocol email \
    --notification-endpoint tu-email@ejemplo.com
```

### 2. Múltiples Entornos
- Crear pipelines separados para `develop` y `main`
- Usar diferentes buckets S3 para staging y producción
- Configurar diferentes distribuciones de CloudFront

### 3. Tests Automatizados
Agregar al `buildspec.yml`:
```yaml
pre_build:
  commands:
    - pnpm install
    - pnpm run test  # Agregar tests
    - pnpm run lint  # Linting
```

## 🎉 ¡Listo!

Una vez configurado:
1. **Cada push a `main`** → Despliegue automático
2. **Colabora con tu equipo** → Pull Requests → Merge → Deploy
3. **Monitorea en AWS Console** → CodePipeline
4. **Sitio web actualizado** → https://emprendimiento-narino.com

¿Necesitas ayuda? Revisa los logs en CloudWatch o contacta al administrador del sistema.
