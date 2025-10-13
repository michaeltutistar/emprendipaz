# ✅ **Checklist de Despliegue - GitHub Actions + Ambientes Dinámicos**

## 🚀 **Configuración Inicial (Una sola vez)**

### **1. Configurar Secretos en GitHub**
- [ ] Ir a **Settings** → **Secrets and variables** → **Actions**
- [ ] Agregar `AWS_ACCESS_KEY_ID`
- [ ] Agregar `AWS_SECRET_ACCESS_KEY`
- [ ] Agregar `DATABASE_URL`
- [ ] (Opcional) Agregar `SLACK_WEBHOOK_URL`
- [ ] (Opcional) Agregar `DISCORD_WEBHOOK_URL`

### **2. Configurar Variables de Entorno**
- [ ] Agregar `AWS_REGION=us-east-1`
- [ ] Agregar `NODE_VERSION=18`
- [ ] Agregar `PYTHON_VERSION=3.9`
- [ ] Agregar `PROJECT_NAME=elearning-platform`

### **3. Verificar Archivos Creados**
- [ ] `.github/workflows/dynamic-environment.yml` ✅
- [ ] `scripts/deploy-dynamic-environment.sh` ✅
- [ ] `scripts/cleanup-dynamic-environment.sh` ✅
- [ ] `scripts/test-dynamic-environment.sh` ✅
- [ ] `GITHUB_ACTIONS_SETUP.md` ✅
- [ ] `TEAM_WORKFLOW.md` ✅

### **4. Verificar Permisos AWS**
- [ ] Usuario IAM tiene permisos para:
  - [ ] S3 (crear/eliminar buckets)
  - [ ] CloudFront (crear/eliminar distribuciones)
  - [ ] CloudFormation (crear/eliminar stacks)
  - [ ] Lambda (crear/eliminar funciones)
  - [ ] API Gateway (crear/eliminar APIs)
  - [ ] IAM (crear/eliminar roles)
  - [ ] CloudWatch Logs (crear/eliminar log groups)

## 🧪 **Prueba Inicial**

### **1. Crear PR de Prueba**
- [ ] Crear branch: `git checkout -b test/github-actions`
- [ ] Hacer un cambio pequeño (ej: agregar comentario)
- [ ] Commit: `git commit -m "test: probar GitHub Actions"`
- [ ] Push: `git push origin test/github-actions`
- [ ] Crear Pull Request en GitHub

### **2. Verificar Despliegue Automático**
- [ ] Ir a **Actions** en GitHub
- [ ] Verificar que el workflow se ejecute
- [ ] Esperar 5-10 minutos para completar
- [ ] Verificar que aparezca comentario en el PR con URLs

### **3. Probar Ambiente Dinámico**
- [ ] Abrir URL del frontend en el navegador
- [ ] Verificar que la página cargue correctamente
- [ ] Probar endpoint del backend: `curl {BACKEND_URL}/api/health`
- [ ] Verificar que responda con status 200

### **4. Probar Limpieza Automática**
- [ ] Cerrar el Pull Request
- [ ] Verificar que el workflow de limpieza se ejecute
- [ ] Esperar 5-10 minutos para completar
- [ ] Verificar que aparezca comentario de limpieza
- [ ] Confirmar que los recursos AWS se eliminen

## 🔄 **Flujo de Trabajo Diario**

### **Para Desarrolladores:**
- [ ] Crear branch desde `main`
- [ ] Desarrollar funcionalidad
- [ ] Commit y push cambios
- [ ] Crear Pull Request
- [ ] Esperar ambiente dinámico (5-10 min)
- [ ] Probar cambios en ambiente dinámico
- [ ] Solicitar review del equipo
- [ ] Cerrar PR cuando esté listo (limpieza automática)

### **Para Revisores:**
- [ ] Recibir notificación de PR
- [ ] Abrir URLs del ambiente dinámico
- [ ] Probar funcionalidad
- [ ] Dejar comentarios con feedback
- [ ] Aprobar o solicitar cambios

### **Para Administradores:**
- [ ] Monitorear costos semanalmente
- [ ] Revisar logs de GitHub Actions
- [ ] Mantener secretos actualizados
- [ ] Documentar cambios en configuración

## 🚨 **Troubleshooting**

### **Problemas Comunes:**

#### **1. Error de Permisos AWS**
```bash
# Verificar credenciales
aws sts get-caller-identity

# Verificar permisos específicos
aws s3 ls
aws cloudformation list-stacks
```

#### **2. Error de Despliegue**
- [ ] Revisar logs de GitHub Actions
- [ ] Verificar que los secretos estén configurados
- [ ] Confirmar que no haya conflictos de nombres
- [ ] Verificar que la región sea correcta

#### **3. Error de Limpieza**
```bash
# Limpiar manualmente
./scripts/cleanup-dynamic-environment.sh {PR_NUMBER}

# Verificar recursos restantes
aws cloudformation list-stacks | grep "pr-"
aws s3 ls | grep "elearning-frontend-pr-"
```

#### **4. Ambiente No Funciona**
```bash
# Probar conectividad
curl {BACKEND_URL}/api/health

# Ver logs
aws logs tail /aws/lambda/elearning-backend-pr-{NUMBER}-dev-app --follow

# Verificar recursos
aws cloudformation describe-stacks --stack-name elearning-backend-pr-{NUMBER}-dev
```

## 📊 **Métricas de Éxito**

### **Objetivos:**
- [ ] **Tiempo de despliegue**: < 10 minutos
- [ ] **Tasa de éxito**: > 95%
- [ ] **Limpieza automática**: 100%
- [ ] **Costo por PR**: < $2 USD/día

### **Monitoreo:**
- [ ] Revisar métricas semanalmente
- [ ] Documentar problemas y soluciones
- [ ] Optimizar configuración según necesidades
- [ ] Capacitar al equipo en el uso

## 🎯 **Próximos Pasos**

### **Mejoras Futuras:**
- [ ] Agregar notificaciones a Slack/Discord
- [ ] Implementar tests automatizados en ambiente dinámico
- [ ] Agregar métricas de performance
- [ ] Configurar alertas de costos
- [ ] Implementar ambientes de staging

### **Escalabilidad:**
- [ ] Configurar múltiples regiones
- [ ] Implementar load balancing
- [ ] Agregar base de datos por ambiente
- [ ] Configurar CI/CD para múltiples proyectos

## ✅ **Checklist Final**

- [ ] **Configuración inicial completada**
- [ ] **Prueba inicial exitosa**
- [ ] **Equipo capacitado en el flujo**
- [ ] **Documentación actualizada**
- [ ] **Monitoreo configurado**
- [ ] **Troubleshooting documentado**

## 🎉 **¡Listo para Producción!**

Una vez completado este checklist:
1. ✅ El equipo puede trabajar colaborativamente
2. ✅ Cada PR tiene su ambiente aislado
3. ✅ Los costos están controlados
4. ✅ La limpieza es automática
5. ✅ El flujo está documentado

**¡Disfruta del desarrollo colaborativo con ambientes dinámicos!** 🚀
