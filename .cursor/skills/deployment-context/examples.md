# Ejemplos

## Ejemplo 1: cambio en backend que afecta env vars

```markdown
## Contexto de despliegue (actual)
- Tipo: docker-compose + CI (GitHub Actions)
- Componentes: backend (API), frontend, Postgres
- Build: `npm run build` (CI)
- Start/Run: `npm run start` (API en :3000)
- Variables de entorno: `DATABASE_URL`, `JWT_SECRET` (secrets en CI), `CORS_ORIGIN`
- Persistencia: Postgres con migraciones
- CI/CD: workflow que construye artefacto y despliega

## Impacto del cambio propuesto
- Compatibilidad build/start: ok
- Cambios en env vars: agrega `EMAIL_PROVIDER_API_KEY`
- Cambios en infra/pipeline: actualizar secretos del entorno y `.env.example`
- Migraciones/rollback: no aplica

## Checklist antes de merge
- [ ] Build reproducible
- [ ] Start reproducible
- [ ] Env vars documentadas (sin secretos en el repo)
- [ ] `DEPLOYMENT.md` actualizado si cambió algo
```

## Ejemplo 2: cambio en frontend (hosting estático)

```markdown
## Contexto de despliegue (actual)
- Tipo: PaaS (hosting estático)
- Componentes: frontend
- Build: `npm ci && npm run build`
- Start/Run: sirve `dist/` (no hay servidor Node en prod)
- Variables de entorno: `VITE_API_BASE_URL` (definida en el hosting)
- CI/CD: pipeline publica `dist/`

## Impacto del cambio propuesto
- Compatibilidad build/start: requiere cambio (ahora el build genera `build/` en vez de `dist/`)
- Cambios en infra/pipeline: actualizar config del hosting/pipeline para publicar `build/`
- Migraciones/rollback: rollback = redeploy del artefacto anterior
```

