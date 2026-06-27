## Contexto de despliegue (actual)
- Tipo: serverless + frontend estático en AWS
- Componentes: `frontend/frontend-app` y backend Lambda en `backend/backend-app`
- Build frontend: `pnpm run build` o `npm run build` dentro de `frontend/frontend-app`
- Start local frontend: `pnpm run dev` o `npm run dev`
- Variables de entorno frontend: `VITE_API_URL` opcional; en producción usa la API pública por defecto
- Persistencia: frontend publicado en S3 `s3://elearning-frontend-prod-v2` con caché vía CloudFront `E3QN9WFZXCI4DS`; backend en Lambda `elearning-api-dev-api`; archivos auxiliares en S3 `elearning-archivos`
- CI/CD: workflow `.github/workflows/dynamic-environment.yml` para ambientes dinámicos de PR; despliegue productivo del frontend también soportado manualmente con `frontend/frontend-app/deploy.ps1`

## Frontend
- Ubicación: `frontend/frontend-app`
- Script de despliegue: `deploy.ps1`
- Flujo productivo:
  1. Ejecutar build.
  2. Sincronizar `dist/` con `s3://elearning-frontend-prod-v2 --delete`.
  3. Invalidar CloudFront `E3QN9WFZXCI4DS` con `/*`.

## Backend
- Tipo: AWS Lambda desplegada manualmente por ZIP
- Función: `elearning-api-dev-api`
- Bucket del artefacto: `s3://elearning-archivos/lambda-deploy/lambda_fixed.zip`
- Flujo productivo:
  1. Copiar archivos cambiados a `_lambda_patch/out/`.
  2. Empaquetar con `python _lambda_patch\make_zip.py`.
  3. Subir ZIP al bucket.
  4. Ejecutar `aws lambda update-function-code`.
  5. Esperar con `aws lambda wait function-updated`.

## Impacto del cambio propuesto
- Compatibilidad build/start: sin cambios de configuración; solo cambia visibilidad de un botón en el frontend
- Cambios en env vars: ninguno
- Cambios en infra/pipeline: ninguno
- Migraciones/rollback: no aplica; rollback simple redeploy de la versión anterior del frontend

## Checklist antes de merge
- [x] Build reproducible
- [x] Start reproducible
- [x] Env vars documentadas (sin secretos en el repo)
- [x] Migraciones con plan de rollback
- [x] `DEPLOYMENT.md` actualizado si cambió algo
