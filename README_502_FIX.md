# Corrección del Error 502 Bad Gateway

## 🚨 Problema Identificado

Tu aplicación está mostrando un error **502 Bad Gateway** al intentar hacer login:
```
POST https://by89bq27g7.execute-api.us-east-1.amazonaws.com/dev/api/login 502 (Bad Gateway)
```

## 🔍 Causas Identificadas

1. **Configuración incorrecta en `lambda_function.py`**:
   - Sobrescritura de `DATABASE_URL` con credenciales incorrectas
   - Falta de manejo de errores adecuado

2. **Error en `serverless.yml`**:
   - Referencia incorrecta a la aplicación Flask (`lambda_function.app` en lugar de `main.app`)

3. **Posibles problemas de CORS**:
   - Headers de CORS no configurados completamente

## ✅ Correcciones Aplicadas

### 1. Corrección en `lambda_function.py`
- ✅ Eliminada sobrescritura incorrecta de `DATABASE_URL`
- ✅ Agregado manejo de errores con try/catch
- ✅ Mejorados los headers de CORS
- ✅ Agregados logs de debug para diagnóstico

### 2. Corrección en `serverless.yml`
- ✅ Corregida referencia de aplicación: `main.app`

### 3. Mejoras en logging
- ✅ Logs detallados para diagnosticar problemas
- ✅ Información de variables de entorno
- ✅ Captura de excepciones completa

## 🚀 Cómo Aplicar las Correcciones

### Opción 1: Script Automático (Recomendado)
```bash
python fix_502_error.py
```

Este script ejecutará automáticamente:
1. Verificación de prerrequisitos
2. Revisión de logs actuales
3. Despliegue de correcciones
4. Pruebas de la API

### Opción 2: Pasos Manuales

#### 1. Revisar logs actuales
```bash
python check_lambda_logs.py
```

#### 2. Desplegar correcciones
```bash
python deploy_lambda_fix.py
```

#### 3. Probar la API
```bash
python test_api_endpoints.py
```

## 📋 Prerrequisitos

Antes de ejecutar los scripts, asegúrate de tener:

### Software Requerido
- ✅ Python 3.8+
- ✅ AWS CLI configurado
- ✅ Node.js (para Serverless Framework)
- ✅ Serverless Framework

### Paquetes Python
```bash
pip install requests boto3
```

### Configuración AWS
```bash
aws configure
# Introduce tus credenciales de AWS
```

### Serverless Framework
```bash
npm install -g serverless
```

## 🧪 Verificación Manual

Si prefieres verificar manualmente, puedes probar el endpoint directamente:

```bash
curl -X OPTIONS \
  https://by89bq27g7.execute-api.us-east-1.amazonaws.com/dev/api/login \
  -H "Origin: https://emprendimiento-narino.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization"
```

```bash
curl -X POST \
  https://by89bq27g7.execute-api.us-east-1.amazonaws.com/dev/api/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://emprendimiento-narino.com" \
  -d '{"email":"test@example.com","password":"test"}'
```

## 📊 Monitoreo Post-Corrección

### Ver logs en tiempo real
```bash
cd backend/backend-app/lambda-deployment
serverless logs -f api --tail
```

### Acceder a CloudWatch
1. Ve a AWS Console → CloudWatch → Log groups
2. Busca `/aws/lambda/elearning-api-dev-api`
3. Revisa los logs más recientes

## 🆘 Si Persisten los Problemas

### 1. Verificar Base de Datos
```python
python -c "
import psycopg
conn = psycopg.connect('postgresql+psycopg://elearning_user:password_seguro@elearning-db.cwn4cmackagl.us-east-1.rds.amazonaws.com:5432/elearning_narino')
print('✅ Conexión exitosa')
conn.close()
"
```

### 2. Verificar Variables de Entorno en Lambda
- Ve a AWS Console → Lambda → elearning-api-dev-api
- Revisa la pestaña "Configuration" → "Environment variables"
- Confirma que `DATABASE_URL` y `RDS_ENDPOINT` estén configuradas

### 3. Revisar Logs Detallados
```bash
python check_lambda_logs.py
```

### 4. Contactar Soporte
Si nada de lo anterior funciona:
1. Ejecuta `python check_lambda_logs.py` y guarda la salida
2. Ejecuta `python test_api_endpoints.py` y guarda la salida
3. Proporciona ambas salidas para un diagnóstico más detallado

## 📞 Comandos de Emergencia

### Rollback (si algo sale mal)
```bash
cd backend/backend-app/lambda-deployment
serverless rollback --timestamp [TIMESTAMP_ANTERIOR]
```

### Redesplegar desde cero
```bash
cd backend/backend-app/lambda-deployment
serverless remove
serverless deploy
```

### Ver información de despliegue
```bash
cd backend/backend-app/lambda-deployment
serverless info
```

---

## ⚡ Resumen Ejecutivo

**Problema**: Error 502 Bad Gateway en `/api/login`
**Causa**: Configuración incorrecta de Lambda y manejo de errores deficiente
**Solución**: Corrección de configuración + mejora de logging + headers CORS
**Tiempo estimado**: 5-10 minutos para aplicar correcciones

**Ejecuta**: `python fix_502_error.py` para solución automática completa.
