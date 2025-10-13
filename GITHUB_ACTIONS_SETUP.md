# 🚀 GitHub Actions + Ambientes Dinámicos - Guía de Configuración

## 📋 **Paso a Paso para Configurar GitHub Actions**

### **1. Configurar Secretos en GitHub**

Ve a tu repositorio en GitHub → **Settings** → **Secrets and variables** → **Actions**

#### **🔐 Secretos Requeridos:**

```bash
# AWS Credentials
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Opcional: Para notificaciones
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

#### **📝 Cómo obtener las credenciales AWS:**

1. **Crear usuario IAM en AWS Console:**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:*",
           "cloudfront:*",
           "cloudformation:*",
           "lambda:*",
           "apigateway:*",
           "iam:*",
           "logs:*"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

2. **Generar Access Key:**
   - AWS Console → IAM → Users → Tu Usuario → Security credentials
   - Create access key → Command Line Interface (CLI)
   - Copiar Access Key ID y Secret Access Key

### **2. Configurar Variables de Entorno**

En **Settings** → **Secrets and variables** → **Actions** → **Variables**:

```bash
# Configuración del proyecto
AWS_REGION=us-east-1
NODE_VERSION=18
PYTHON_VERSION=3.9

# Nombres de recursos base
PROJECT_NAME=elearning-platform
BACKEND_STACK_PREFIX=elearning-backend
FRONTEND_BUCKET_PREFIX=elearning-frontend
```

### **3. Configurar Ambientes Dinámicos**

GitHub Actions creará automáticamente ambientes dinámicos con el formato:
- **Nombre**: `pr-{NÚMERO_DE_PR}`
- **URL**: Se mostrará en el comentario del PR

### **4. Estructura de Archivos Creada**

```
.github/
└── workflows/
    └── dynamic-environment.yml    # Workflow principal

scripts/
├── deploy-dynamic-environment.sh  # Script de despliegue
└── cleanup-dynamic-environment.sh # Script de limpieza

environment-info-pr-{N}.json       # Info del ambiente (temporal)
```

## 🔄 **Flujo de Trabajo**

### **Cuando se abre un PR:**
1. ✅ GitHub Actions detecta el PR
2. ✅ Crea ambiente dinámico con sufijo `pr-{NÚMERO}`
3. ✅ Despliega backend (Lambda + API Gateway)
4. ✅ Despliega frontend (S3 + CloudFront)
5. ✅ Comenta en el PR con las URLs

### **Cuando se actualiza un PR:**
1. ✅ Detecta cambios en el código
2. ✅ Redespliega el ambiente con los nuevos cambios
3. ✅ Actualiza el comentario del PR

### **Cuando se cierra un PR:**
1. ✅ Elimina todos los recursos AWS
2. ✅ Limpia CloudFormation stacks
3. ✅ Elimina buckets S3
4. ✅ Elimina distribuciones CloudFront
5. ✅ Comenta confirmación de limpieza

## 🎯 **URLs Generadas**

Cada PR tendrá URLs únicas:
- **Frontend**: `https://d1234567890.cloudfront.net`
- **Backend**: `https://abc123.execute-api.us-east-1.amazonaws.com/dev`

## 💰 **Control de Costos**

### **Recursos que se crean por PR:**
- 1x Lambda function
- 1x API Gateway
- 1x S3 bucket
- 1x CloudFront distribution
- 1x CloudWatch log group

### **Recursos que se eliminan automáticamente:**
- ✅ Todos los recursos se eliminan al cerrar el PR
- ✅ No hay costos residuales
- ✅ Solo pagas por el tiempo de uso

## 🛠️ **Comandos Útiles**

### **Para desarrolladores:**

```bash
# Ver logs del ambiente de un PR
aws logs tail /aws/lambda/elearning-backend-pr-123-dev-app --follow

# Probar endpoint del ambiente
curl https://abc123.execute-api.us-east-1.amazonaws.com/dev/api/health

# Ver recursos creados
aws cloudformation describe-stacks --stack-name elearning-backend-pr-123-dev
```

### **Para administradores:**

```bash
# Listar todos los ambientes activos
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE | grep "pr-"

# Limpiar ambiente manualmente (si es necesario)
./scripts/cleanup-dynamic-environment.sh 123

# Ver costos por ambiente
aws ce get-cost-and-usage --time-period Start=2024-01-01,End=2024-01-31 --granularity MONTHLY
```

## 🚨 **Troubleshooting**

### **Problemas Comunes:**

1. **Error de permisos AWS:**
   ```bash
   # Verificar que las credenciales tengan los permisos necesarios
   aws sts get-caller-identity
   ```

2. **Error de CloudFormation:**
   ```bash
   # Ver eventos del stack
   aws cloudformation describe-stack-events --stack-name elearning-backend-pr-123-dev
   ```

3. **Error de S3 bucket:**
   ```bash
   # Verificar que el bucket no exista
   aws s3api head-bucket --bucket elearning-frontend-pr-123
   ```

### **Logs de GitHub Actions:**
- Ve a tu repositorio → **Actions** → Selecciona el workflow
- Revisa los logs de cada step para identificar problemas

## 📞 **Soporte**

Si tienes problemas:
1. Revisa los logs de GitHub Actions
2. Verifica que los secretos estén configurados correctamente
3. Confirma que las credenciales AWS tengan los permisos necesarios
4. Revisa que no haya conflictos de nombres de recursos

## 🎉 **¡Listo para Usar!**

Una vez configurado:
1. Crea un PR de prueba
2. GitHub Actions creará automáticamente el ambiente
3. Prueba tu código en el ambiente dinámico
4. Cierra el PR para limpiar automáticamente los recursos

**¡Disfruta del desarrollo colaborativo con ambientes dinámicos!** 🚀
