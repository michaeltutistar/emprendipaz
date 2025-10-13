# 📁 Gestión de Recursos - Documentación

## Descripción General

La funcionalidad de **Gestión de Recursos** permite a los administradores subir, gestionar y organizar recursos multimedia que estarán disponibles para los estudiantes en la plataforma E-Learning. Los recursos se almacenan en Amazon S3 para garantizar escalabilidad y alta disponibilidad.

## 🏗️ Arquitectura

### Backend (Flask + PostgreSQL)

#### Modelos
- **`Recurso`**: Modelo principal para almacenar información de recursos
  - Metadatos del archivo (título, descripción, tipo, categoría)
  - Información de S3 (clave, URL, bucket)
  - Relaciones con cursos, módulos y lecciones
  - Configuración de acceso (público/privado)

#### Servicios
- **`S3Service`**: Servicio para manejar operaciones con Amazon S3
  - Subida de archivos
  - Eliminación de archivos
  - Generación de URLs firmadas
  - Gestión de metadatos

#### Rutas API
- `GET /api/resources/resources` - Listar recursos con filtros
- `POST /api/resources/resources` - Subir nuevo recurso
- `GET /api/resources/resources/{id}` - Obtener recurso específico
- `PUT /api/resources/resources/{id}` - Actualizar recurso
- `DELETE /api/resources/resources/{id}` - Eliminar recurso
- `GET /api/resources/resources/stats` - Estadísticas de recursos
- `GET /api/resources/resources/categories` - Categorías disponibles
- `GET /api/resources/resources/types` - Tipos de archivo disponibles

### Frontend (React)

#### Componentes
- **`ResourceManagement`**: Componente principal para gestionar recursos
  - Tabla de recursos con filtros y paginación
  - Modal para subir nuevos recursos
  - Modal para editar recursos existentes
  - Estadísticas en tiempo real

## 📋 Funcionalidades

### 1. Subida de Recursos
- **Tipos de archivo soportados**:
  - Documentos: PDF, DOC, DOCX, TXT, RTF
  - Presentaciones: PPT, PPTX
  - Hojas de cálculo: XLS, XLSX, CSV
  - Imágenes: JPG, PNG, GIF, BMP, SVG, WebP
  - Videos: MP4, AVI, MOV, WMV, FLV, WebM, MKV
  - Audio: MP3, WAV, OGG, FLAC, AAC
  - Archivos comprimidos: ZIP, RAR, 7Z, TAR, GZ

- **Límites**:
  - Tamaño máximo: 100MB por archivo
  - Validación de tipo MIME
  - Generación automática de claves únicas en S3

### 2. Gestión de Recursos
- **CRUD completo**: Crear, Leer, Actualizar, Eliminar
- **Filtros avanzados**:
  - Por tipo de archivo
  - Por categoría
  - Por curso asociado
  - Búsqueda por texto (título, descripción, nombre original)
- **Paginación**: Configurable (10, 20, 50 recursos por página)

### 3. Organización
- **Categorías**: académico, tutorial, documentación, administrativo, general
- **Asociación con cursos**: Los recursos pueden estar vinculados a cursos específicos
- **Estados**: activo, inactivo, eliminado
- **Control de acceso**: público/privado, con/sin autenticación

### 4. Estadísticas
- Total de recursos
- Tamaño total almacenado
- Distribución por tipo de archivo
- Distribución por categoría
- Uso del bucket S3

## 🚀 Configuración

### 1. Variables de Entorno

Crear archivo `.env` en `backend/backend-app/`:

```env
# Configuración de AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=elearning-narino-resources

# Configuración de la base de datos
DATABASE_URL=postgresql://elearning_user:password_seguro@localhost:5432/elearning_narino

# Configuración de Flask
SECRET_KEY=your_secret_key_here
FLASK_ENV=development
```

### 2. Configuración de AWS S3

1. **Crear bucket S3**:
   ```bash
   aws s3 mb s3://elearning-narino-resources
   ```

2. **Configurar permisos del bucket**:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::elearning-narino-resources/*"
       }
     ]
   }
   ```

3. **Configurar CORS**:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

### 3. Instalación de Dependencias

```bash
# Backend
cd backend/backend-app
pip install boto3 psycopg2-binary

# Frontend
cd frontend/frontend-app
npm install
```

### 4. Base de Datos

Ejecutar el script SQL para crear la tabla de recursos:

```bash
psql -U elearning_user -d elearning_narino -f database/create_resources_table.sql
```

## 🧪 Pruebas

### Script de Pruebas Automatizadas

```bash
python test_resources.py
```

El script prueba:
- ✅ Login de administrador
- ✅ Listar recursos
- ✅ Obtener estadísticas
- ✅ Obtener categorías y tipos
- ✅ Crear recurso (CRUD completo)
- ✅ Actualizar recurso
- ✅ Eliminar recurso
- ✅ Filtros y búsqueda

### Pruebas Manuales

1. **Acceder al dashboard**: `http://localhost:3000/admin`
2. **Ir a "Gestión de Recursos"**
3. **Probar subida de archivos**:
   - Seleccionar archivo
   - Completar formulario
   - Verificar subida exitosa
4. **Probar filtros**:
   - Filtrar por tipo
   - Filtrar por categoría
   - Buscar por texto
5. **Probar edición**:
   - Modificar título/descripción
   - Cambiar categoría
   - Actualizar estado
6. **Probar eliminación**:
   - Eliminar recurso
   - Verificar eliminación de S3

## 📊 Monitoreo

### Logs de Actividad
- Todas las operaciones se registran en `log_actividad`
- Incluye información del usuario, acción y timestamp

### Métricas S3
- Uso de almacenamiento
- Número de objetos
- Costos de transferencia

### Alertas Recomendadas
- Archivos mayores a 50MB
- Múltiples subidas en corto tiempo
- Errores de S3

## 🔒 Seguridad

### Autenticación
- Solo administradores pueden gestionar recursos
- Verificación de sesión en todas las rutas

### Validación de Archivos
- Verificación de tipo MIME
- Límite de tamaño
- Escaneo de malware (recomendado)

### Permisos S3
- Acceso público solo para archivos marcados como públicos
- URLs firmadas para acceso temporal
- Bucket con configuración de seguridad

## 🚀 Optimizaciones Futuras

### Funcionalidades Planificadas
- [ ] Compresión automática de imágenes
- [ ] Conversión de formatos de video
- [ ] Generación de miniaturas
- [ ] Búsqueda por contenido (OCR)
- [ ] Versionado de archivos
- [ ] Backup automático

### Mejoras de Rendimiento
- [ ] CDN para distribución global
- [ ] Cache de metadatos
- [ ] Subida en chunks para archivos grandes
- [ ] Procesamiento asíncrono

### Integración
- [ ] API para estudiantes
- [ ] Widget de recursos en lecciones
- [ ] Notificaciones de nuevos recursos
- [ ] Reportes de uso

## 📞 Soporte

Para problemas o consultas sobre la funcionalidad de Gestión de Recursos:

1. **Verificar logs**: `backend/backend-app/logs/`
2. **Revisar configuración S3**: Credenciales y permisos
3. **Probar conectividad**: Script `test_resources.py`
4. **Documentación AWS**: [S3 Developer Guide](https://docs.aws.amazon.com/s3/)

---

**Desarrollado para la Plataforma E-Learning de la Gobernación de Nariño** 🎓 