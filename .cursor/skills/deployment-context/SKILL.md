---
name: deployment-context
description: Mantiene y aplica el contexto de despliegue (Docker/CI-CD/hosting/variables/migraciones) al trabajar en cualquier proyecto. Usar cuando el usuario mencione desplegar/deploy, CI/CD, Docker, Kubernetes, Vercel/Netlify/Render/Fly/Railway, AWS/Azure/GCP, Amplify/Lambda, pipelines, infraestructura, o cuando se hagan cambios que afecten build, arranque, puertos, variables de entorno, base de datos o dependencias.
---

# Deployment context (no perder el “cómo se despliega”)

## Objetivo

Antes de proponer cambios, **capturar el despliegue actual**, y durante el trabajo **mantenerlo consistente** (build, start, variables, migraciones, CI/CD) para no perder contexto entre sesiones/proyectos.

## Quick start (siempre)

1. **Encontrar la “fuente de verdad” del despliegue** en el repo (leer primero, no asumir):
   - `README.md`, `DEPLOYMENT.md`, `docs/deploy*`, `scripts/deploy*`, `Makefile`
   - CI/CD: `.github/workflows/*`, `buildspec.yml`, `amplify.yml`, `bitbucket-pipelines.yml`, `.gitlab-ci.yml`
   - Contenedores: `Dockerfile*`, `docker-compose*.yml`, `.dockerignore`
   - PaaS/hosting: `vercel.json`, `netlify.toml`, `render.yaml`, `fly.toml`, `railway.toml`, `Procfile`
   - K8s/infra: `k8s/`, `helm/`, `terraform/`, `pulumi/`, `ansible/`, `nginx/`
   - Runtime: `package.json` (scripts), `requirements*.txt`, `pyproject.toml`, `.nvmrc`, `.node-version`
   - Config: `.env.example`, `.env.template`, `config/*`

2. **Generar/actualizar un resumen estable** (si no existe, crearlo):
   - Archivo recomendado: `DEPLOYMENT.md` en la raíz.
   - Si el proyecto tiene frontend + backend, documentar **ambos** por separado.

3. **Antes de implementar un cambio**, responder explícitamente:
   - ¿Afecta `build`/`start`/scripts?
   - ¿Afecta variables de entorno/secrets?
   - ¿Afecta puertos, paths, healthchecks, CORS?
   - ¿Afecta DB/migraciones/seed?
   - ¿Afecta artefactos de CI/CD o IaC?

4. **Si el contexto no está claro**, no inventar: localizar los archivos anteriores y reconstruirlo desde ahí.

## Plantilla de salida (usar tal cual en el chat)

```markdown
## Contexto de despliegue (actual)
- Tipo: [local / docker-compose / k8s / PaaS / serverless]
- Componentes: [frontend, backend, db, workers, etc.]
- Build: [comando y dónde corre: local/CI]
- Start/Run: [comando] (puerto/s)
- Variables de entorno: [lista mínima + origen: CI secrets/.env/...]
- Persistencia: [DB/volúmenes/buckets] + migraciones
- CI/CD: [workflow/pipeline] + artefactos + entorno destino

## Impacto del cambio propuesto
- Compatibilidad build/start: [ok / requiere cambio]
- Cambios en env vars: [ninguno / lista]
- Cambios en infra/pipeline: [ninguno / lista]
- Migraciones/rollback: [plan]

## Checklist antes de merge
- [ ] Build reproducible
- [ ] Start reproducible
- [ ] Env vars documentadas (sin secretos en el repo)
- [ ] Migraciones con plan de rollback
- [ ] `DEPLOYMENT.md` actualizado si cambió algo
```

## Reglas de oro

- **Siempre** incluir “Impacto del cambio propuesto” si se toca configuración, dependencias, scripts, red, auth, DB o despliegue.
- Si se detecta que falta documentación, **crear/actualizar `DEPLOYMENT.md`** como parte del trabajo.
- Si hay múltiples entornos (dev/staging/prod), documentar diferencias clave (variables, URLs, dominios, recursos).

## Recursos

- Checklist extendida y casos comunes: ver [reference.md](reference.md)
- Ejemplos de respuesta completa: ver [examples.md](examples.md)

