# Resumen Ejecutivo de Arquitectura del Sistema

## Visión General
El proyecto `e-learning-platform` está organizado como una arquitectura de dos grandes bloques:

- `frontend/frontend-app`: aplicación web tipo SPA para estudiantes, instructores y administradores.
- `backend/backend-app`: API REST central que expone la lógica de negocio, autenticación, progreso académico, archivos y configuración del sistema.

En términos funcionales, la plataforma fue diseñada como un sistema de formación digital con soporte para:

- autenticación y manejo de roles
- navegación por módulos, unidades, talleres y evaluaciones
- seguimiento de progreso académico
- operación offline tipo PWA
- sincronización diferida cuando vuelve la conectividad
- gestión de archivos y evidencias en la nube

## Arquitectura del Sistema
La arquitectura general puede resumirse así:

`Frontend SPA (React/Vite/PWA)` -> `API REST (Flask)` -> `Base de datos PostgreSQL + almacenamiento S3` -> `despliegue sobre AWS Lambda/API Gateway`

### 1. Capa Frontend
El frontend es una SPA desarrollada en `JavaScript` y `JSX` sobre `React`.

Sus responsabilidades principales son:

- renderizar la experiencia de usuario para estudiantes, instructores y administradores
- manejar rutas del lado cliente
- consumir la API REST del backend
- soportar experiencia offline mediante `Service Worker`, `IndexedDB` y colas de sincronización
- gestionar formularios, validaciones, dashboards y componentes interactivos

Estructura relevante:

- `frontend/frontend-app/src/App.jsx`
- `frontend/frontend-app/src/main.jsx`
- `frontend/frontend-app/src/components/student`
- `frontend/frontend-app/src/components/instructor`
- `frontend/frontend-app/src/components/admin`
- `frontend/frontend-app/src/utils/offline-storage.js`
- `frontend/frontend-app/src/utils/fetch-wrapper.js`
- `frontend/frontend-app/src/utils/sync-manager.js`

### 2. Capa Backend
El backend es una API REST desarrollada en `Python` con `Flask`, organizada como un monolito modular por dominios y `Blueprints`.

Sus responsabilidades principales son:

- autenticación y autorización
- gestión de usuarios, cursos, módulos, recursos y progreso
- endpoints para estudiantes, instructores y administración
- persistencia de datos relacionales
- integración con AWS S3 para archivos
- exposición de la aplicación como función serverless en AWS

Estructura relevante:

- `backend/backend-app/src/main.py`
- `backend/backend-app/src/routes`
- `backend/backend-app/src/models`
- `backend/backend-app/src/services`
- `backend/backend-app/src/config.py`

### 3. Persistencia y almacenamiento
El sistema usa dos mecanismos principales de persistencia:

- `PostgreSQL` como base de datos relacional principal
- `Amazon S3` para almacenamiento de archivos, evidencias y documentos

Además, en el frontend existe persistencia local para modo offline mediante:

- `IndexedDB` para caché, colas de sincronización y formularios pendientes
- `localStorage` para estados puntuales de interfaz y continuidad de ciertas actividades

### 4. Infraestructura y despliegue
La infraestructura visible en el código indica un despliegue sobre servicios AWS:

- `AWS Lambda` para ejecutar el backend
- `API Gateway` para exponer la API HTTP
- `Amazon RDS PostgreSQL` como base de datos productiva
- `Amazon S3` para archivos
- `CloudFront` y hosting estático para el frontend productivo

El backend se despliega con `Serverless Framework` y el frontend se compila con `Vite` para publicarse como sitio estático.

## Lenguajes de Programación Usados

### Frontend
Lenguajes principales:

- `JavaScript`
- `JSX`
- `CSS`
- `HTML` en artefactos estáticos y plantilla de aplicación

Tecnologías principales del frontend:

- `React 19`
- `React Router`
- `Vite`
- `Tailwind CSS 4`
- `Radix UI`
- `react-hook-form`
- `zod`
- `framer-motion`
- `Recharts`

Capacidades técnicas destacadas:

- SPA con rutas por rol
- PWA con `manifest.json`
- `Service Worker`
- soporte offline con `IndexedDB`
- sincronización diferida de progreso, evaluaciones y formularios

### Backend
Lenguaje principal:

- `Python 3.12`

Tecnologías principales del backend:

- `Flask`
- `Flask-CORS`
- `Flask-SQLAlchemy`
- `SQLAlchemy`
- `psycopg`
- `PyJWT`
- `boto3`
- `serverless-wsgi`
- `pandas`
- `openpyxl`

Capacidades técnicas destacadas:

- API REST modular por `Blueprints`
- autenticación basada en JWT
- acceso a PostgreSQL mediante ORM
- integración con S3 para carga y gestión de archivos
- empaquetado serverless para AWS Lambda

## Organización Funcional del Proyecto
El proyecto sigue una separación clara entre experiencia de usuario y lógica de negocio:

- el `frontend` concentra presentación, navegación, formularios y experiencia offline
- el `backend` concentra reglas de negocio, persistencia, seguridad e integraciones

Dentro del frontend, la estructura está segmentada por roles y por módulos académicos.
Dentro del backend, la estructura está segmentada por rutas, modelos y servicios.

## Conclusión Ejecutiva
La plataforma usa una arquitectura moderna y pragmática:

- `frontend` SPA en `React/Vite`
- `backend` API REST en `Flask/Python`
- `PostgreSQL` como base de datos principal
- `S3` como almacenamiento de archivos
- despliegue serverless sobre `AWS Lambda`
- soporte `PWA` con funcionamiento offline y sincronización posterior

Esto la convierte en una solución adecuada para escenarios educativos con conectividad variable, donde la experiencia del usuario debe mantenerse operativa incluso sin acceso continuo a internet.

## Archivos de Referencia
Los siguientes archivos sustentan este resumen:

- `frontend/frontend-app/package.json`
- `frontend/frontend-app/src/main.jsx`
- `frontend/frontend-app/src/config/api.js`
- `frontend/frontend-app/public/manifest.json`
- `frontend/frontend-app/src/utils/offline-storage.js`
- `frontend/frontend-app/src/utils/sync-manager.js`
- `backend/backend-app/requirements.txt`
- `backend/backend-app/serverless.yml`
- `backend/backend-app/src/main.py`
- `backend/backend-app/src/config.py`
- `backend/backend-app/src/services/s3_service.py`
