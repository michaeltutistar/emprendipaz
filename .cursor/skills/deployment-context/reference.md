# Referencia: checklist de despliegue

## Qué buscar (rápido)

### CI/CD
- `.github/workflows/*.yml`: jobs, matrix, cache, artefactos, despliegue
- `buildspec.yml`: fases install/build/post_build, artefactos
- `amplify.yml`: frontend build, backend build, artefactos, baseDirectory

### Docker / Compose
- `Dockerfile`: base image, build args, usuario, `EXPOSE`, `CMD/ENTRYPOINT`
- `docker-compose.yml`: servicios, puertos, `depends_on`, volúmenes, redes, env vars

### Hosting/PaaS
- `vercel.json`: rewrites, functions, buildCommand, outputDirectory
- `netlify.toml`: build.command, publish, redirects, functions
- `render.yaml`: services, env vars, buildCommand, startCommand
- `fly.toml`: internal_port, health checks, regions, volumes
- `Procfile`: procesos, nombres, comandos

### Backend / Frontend
- `package.json`: `scripts` relevantes (`build`, `start`, `dev`, `lint`, `test`)
- `.nvmrc` / `.node-version`: versionado de Node
- Python: `requirements.txt`, `pyproject.toml`, `runtime.txt`
- Config: `.env.example`, `config/*`, `settings/*`

### Infra
- `terraform/`, `pulumi/`: recursos, outputs, variables
- `k8s/`, `helm/`: deployments, services, ingress, configmaps, secrets (referencias)

## Señales de que un cambio “rompe despliegue”

- Cambias el puerto por defecto o el `basePath` sin actualizar reverse proxy/ingress.
- Renombrar scripts (`start`, `build`) sin actualizar pipeline.
- Introducir variables nuevas sin defaults/ejemplo documentado.
- Cambiar dependencias nativas (node-gyp, libs) sin reflejarlo en imagen Docker/runner.
- Cambiar migrations sin plan de rollback o sin orden de ejecución en CI/CD.
- Modificar rutas de artefactos (ej. `dist/`, `build/`) sin ajustar `baseDirectory/publish`.

## Sección mínima recomendada para `DEPLOYMENT.md`

Copiar y completar:

```markdown
# Deployment

## Arquitectura
- Componentes:
- Dependencias externas:

## Requisitos
- Versiones (Node/Python/etc.):
- Servicios (DB/cache/etc.):

## Variables de entorno
| Variable | Dónde se define | Descripción | Ejemplo (no secreto) |
|---|---|---|---|
| | | | |

## Local
- Comandos:
- Puertos:

## CI/CD
- Pipeline:
- Artefactos:

## Producción
- Target (hosting):
- Dominio/s:
- Rollback:
```

## Guía de “no inventar”

Si falta información:
- Preferir **leer archivos existentes** y reconstruir el flujo.
- Si aun así no se puede determinar, indicar **qué falta** y **dónde debería estar** (p. ej. “falta `DEPLOYMENT.md` o README con build/start”).

## Despliegue conocido en este proyecto

### Frontend productivo

- Directorio: `frontend/frontend-app`
- Build:
  - `pnpm run build`
- Publicación:
  - `aws s3 sync dist/ s3://elearning-frontend-prod-v2 --delete`
- Invalidación:
  - `aws cloudfront create-invalidation --distribution-id E3QN9WFZXCI4DS --paths "/*"`

### Backend productivo

- Estrategia: ZIP manual a Lambda vía S3
- Carpeta de empaquetado: `_lambda_patch/`
- Carpeta de trabajo del código Lambda: `_lambda_patch/out/`
- ZIP generado: `_lambda_patch/lambda_fixed.zip`
- Bucket: `elearning-archivos`
- S3 key: `lambda-deploy/lambda_fixed.zip`
- Lambda: `elearning-api-dev-api`

Pasos:

1. Copiar los archivos modificados del backend al paquete Lambda.
2. Ejecutar `python _lambda_patch\make_zip.py`.
3. Subir el ZIP:
   - `aws s3 cp _lambda_patch\lambda_fixed.zip s3://elearning-archivos/lambda-deploy/lambda_fixed.zip --region us-east-1`
4. Actualizar la función:
   - `aws lambda update-function-code --function-name elearning-api-dev-api --s3-bucket elearning-archivos --s3-key lambda-deploy/lambda_fixed.zip --region us-east-1 --output json`
5. Esperar el despliegue:
   - `aws lambda wait function-updated --function-name elearning-api-dev-api --region us-east-1`

