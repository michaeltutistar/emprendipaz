# Interfaz del Instructor - Plataforma E-Learning

## Descripción General

La interfaz del instructor proporciona herramientas completas para la gestión de cursos, contenido educativo y seguimiento de estudiantes. Está diseñada para ofrecer una experiencia intuitiva y eficiente para los educadores.

## Características Principales

### 🎯 Dashboard del Instructor
- **Resumen de Cursos**: Vista general de todos los cursos asignados
- **Progreso de Estudiantes**: Métricas de avance y participación
- **Actividad Reciente**: Timeline de eventos y actividades
- **Estadísticas en Tiempo Real**: Datos actualizados de rendimiento

### 📚 Gestión de Contenido con Amazon S3
- **Subida de Videos**: Soporte para múltiples formatos (MP4, WebM, OGG, AVI, MOV)
- **Subida de Documentos**: PDF, DOC, DOCX, PPT, PPTX, TXT
- **Almacenamiento Seguro**: Integración completa con Amazon S3
- **Organización por Módulos**: Estructura jerárquica del contenido
- **Programación de Publicaciones**: Publicación automática programada

### 📊 Seguimiento de Estudiantes
- **Progreso Individual**: Seguimiento detallado por estudiante
- **Métricas de Participación**: Estadísticas de actividad
- **Reportes de Rendimiento**: Análisis de resultados
- **Notificaciones**: Alertas sobre el progreso

## Estructura de Archivos

### Frontend (React)
```
frontend/frontend-app/src/components/instructor/
├── InstructorDashboard.jsx      # Dashboard principal
├── ContentUpload.jsx            # Subida de contenido
├── ModuleManager.jsx            # Gestión de módulos
├── ContentScheduler.jsx         # Programación de contenido
├── CourseManager.jsx            # Gestión de cursos
├── StudentProgress.jsx          # Progreso de estudiantes
└── InstructorRoutes.jsx         # Rutas del instructor
```

### Backend (Flask)
```
backend/backend-app/src/
├── routes/instructor.py         # API del instructor
├── services/auth_service.py     # Autenticación y autorización
├── models/                      # Modelos de datos
│   ├── user.py
│   ├── curso.py
│   ├── modulo.py
│   ├── recurso.py
│   └── log_actividad.py
└── main.py                      # Configuración principal
```

## Configuración Inicial

### 1. Variables de Entorno
Crear archivo `env.instructor` en el backend:

```bash
# Configuración para el entorno del instructor
FLASK_ENV=development
SECRET_KEY=tu_clave_secreta_aqui
DATABASE_URL=sqlite:///elearning.db

# Configuración de Amazon S3
AWS_ACCESS_KEY_ID=tu_access_key_id
AWS_SECRET_ACCESS_KEY=tu_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=tu-bucket-elearning

# Configuración de la aplicación
FLASK_DEBUG=True
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### 2. Instalación de Dependencias

#### Backend
```bash
cd backend/backend-app
pip install -r requirements_instructor.txt
```

#### Frontend
```bash
cd frontend/frontend-app
pnpm install
```

### 3. Configuración de Amazon S3

1. **Crear Bucket S3**:
   - Nombre: `tu-bucket-elearning`
   - Región: `us-east-1` (o tu región preferida)
   - Configuración: Público para lectura

2. **Configurar Permisos**:
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Sid": "PublicReadGetObject",
               "Effect": "Allow",
               "Principal": "*",
               "Action": "s3:GetObject",
               "Resource": "arn:aws:s3:::tu-bucket-elearning/*"
           }
       ]
   }
   ```

3. **Crear Usuario IAM**:
   - Política: `AmazonS3FullAccess`
   - Generar Access Key y Secret Key

## Uso de la Interfaz

### Acceso al Dashboard
1. Iniciar sesión con credenciales de instructor
2. Navegar a `/instructor/dashboard`
3. Ver resumen general de cursos y estadísticas

### Subida de Contenido
1. **Videos**:
   - Formato: MP4, WebM, OGG, AVI, MOV
   - Tamaño máximo: 500MB
   - Metadatos: título, descripción, categoría

2. **Documentos**:
   - Formatos: PDF, DOC, DOCX, PPT, PPTX, TXT
   - Tamaño máximo: 50MB
   - Organización por módulos

### Gestión de Módulos
1. **Crear Módulo**:
   - Título y descripción
   - Orden de presentación
   - Duración estimada
   - Estado (activo/inactivo)

2. **Organizar Contenido**:
   - Arrastrar y soltar para reordenar
   - Asignar recursos a módulos
   - Configurar acceso

### Programación de Contenido
1. **Configurar Publicación**:
   - Fecha y hora específica
   - Repetición (una vez, diario, semanal, mensual)
   - Recordatorios automáticos

2. **Estados de Publicación**:
   - Programado
   - Publicado
   - Pausado
   - Cancelado

## API Endpoints

### Dashboard
- `GET /api/instructor/dashboard` - Datos del dashboard
- `GET /api/instructor/estadisticas` - Estadísticas detalladas

### Cursos
- `GET /api/instructor/cursos` - Lista de cursos del instructor
- `GET /api/instructor/curso/{id}/estudiantes` - Estudiantes de un curso

### Contenido
- `POST /api/instructor/contenido/upload` - Subir contenido a S3
- `GET /api/instructor/recursos` - Recursos del instructor
- `DELETE /api/instructor/recurso/{id}` - Eliminar recurso

### Módulos
- `GET /api/instructor/modulos` - Módulos del instructor
- `POST /api/instructor/modulo` - Crear módulo
- `PUT /api/instructor/modulo/{id}` - Actualizar módulo
- `DELETE /api/instructor/modulo/{id}` - Eliminar módulo

## Seguridad y Autenticación

### Roles de Usuario
- **Instructor**: Acceso completo a sus cursos y contenido
- **Admin**: Acceso a toda la plataforma
- **Estudiante**: Acceso limitado a contenido asignado

### Autenticación JWT
- Tokens con expiración de 24 horas
- Renovación automática
- Verificación de roles en cada endpoint

### Permisos por Recurso
- Instructores solo pueden gestionar sus propios recursos
- Verificación automática de propiedad
- Logs de actividad para auditoría

## Características Técnicas

### Frontend
- **Framework**: React 19 con Vite
- **UI**: Tailwind CSS + Radix UI
- **Estado**: React Hooks
- **Navegación**: React Router DOM
- **Notificaciones**: Sonner

### Backend
- **Framework**: Flask
- **Base de Datos**: SQLAlchemy (SQLite/PostgreSQL)
- **Almacenamiento**: Amazon S3
- **Autenticación**: JWT
- **CORS**: Configurado para desarrollo

### Integración S3
- **Subida Directa**: Sin pasar por el servidor
- **URLs Públicas**: Acceso directo a archivos
- **Metadatos**: Información completa de archivos
- **Organización**: Estructura de carpetas por tipo

## Monitoreo y Logs

### Actividad del Usuario
- Logs de todas las acciones del instructor
- Timestamps y IP addresses
- Tipos de actividad categorizados

### Métricas de Uso
- Estadísticas de subida de contenido
- Uso de almacenamiento S3
- Actividad de estudiantes

## Próximas Funcionalidades

### Planificadas
- [ ] Editor de contenido en línea
- [ ] Herramientas de evaluación automática
- [ ] Integración con herramientas de videoconferencia
- [ ] Sistema de notificaciones push
- [ ] Reportes avanzados de analytics

### En Desarrollo
- [ ] Gestión avanzada de cursos
- [ ] Sistema de calificaciones
- [ ] Herramientas de colaboración
- [ ] Integración con LMS externos

## Soporte y Mantenimiento

### Logs de Error
- Logs detallados en el backend
- Manejo de errores en el frontend
- Notificaciones de errores al usuario

### Backup y Recuperación
- Backup automático de base de datos
- Replicación de archivos S3
- Procedimientos de recuperación

### Actualizaciones
- Actualizaciones automáticas del frontend
- Migraciones de base de datos
- Compatibilidad con versiones anteriores

## Contacto y Soporte

Para soporte técnico o consultas sobre la interfaz del instructor:

- **Email**: soporte@elearning-narino.gov.co
- **Documentación**: [Enlace a documentación completa]
- **Issues**: [Repositorio de GitHub]

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2024  
**Desarrollado por**: Equipo de Desarrollo E-Learning Nariño 