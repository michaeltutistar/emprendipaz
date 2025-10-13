# 🐘 Migración de MySQL a PostgreSQL

Esta guía te ayudará a migrar la plataforma E-Learning de MySQL a PostgreSQL usando Docker.

## 📋 Prerrequisitos

- ✅ Docker Desktop instalado y ejecutándose
- ✅ Python 3.8+ instalado
- ✅ Acceso a la base de datos MySQL actual

## 🚀 Pasos de Migración

### 1. **Iniciar PostgreSQL con Docker**

```bash
# Ejecutar el script de inicio
start_postgresql.bat

# O manualmente:
docker-compose up -d
```

### 2. **Verificar que PostgreSQL esté funcionando**

```bash
# Verificar contenedores
docker-compose ps

# Verificar logs
docker-compose logs postgres
```

### 3. **Instalar dependencias de PostgreSQL**

```bash
cd backend/backend-app
pip install psycopg2-binary
```

### 4. **Migrar datos (opcional)**

Si tienes datos en MySQL que quieres migrar:

```bash
cd database
python migrate_to_postgresql.py
```

### 5. **Probar la conexión**

```bash
cd backend/backend-app
python test_postgresql.py
```

## 🔧 Configuración

### Variables de Entorno

El archivo `env.root` ya está configurado para PostgreSQL:

```env
FLASK_ENV=production
DATABASE_URL=postgresql://elearning_user:password_seguro@localhost:5432/elearning_narino
```

### Configuración de la Aplicación

- **Backend**: Configurado para usar PostgreSQL
- **Frontend**: No requiere cambios
- **Base de datos**: Inicializada automáticamente

## 🌐 Acceso a pgAdmin

- **URL**: http://localhost:5050
- **Email**: admin@elearning.com
- **Password**: admin123

### Configurar conexión en pgAdmin:

1. Click derecho en "Servers" → "Register" → "Server"
2. **General**:
   - Name: `E-Learning PostgreSQL`
3. **Connection**:
   - Host: `postgres` (nombre del contenedor)
   - Port: `5432`
   - Database: `elearning_narino`
   - Username: `elearning_user`
   - Password: `password_seguro`

## 📊 Estructura de la Base de Datos

### Tablas Principales

1. **`user`**: Usuarios del sistema
   - Campos: id, nombre, apellido, email, password_hash, tipo_documento, numero_documento, documento_pdf, requisitos_pdf, rol, estado_cuenta, fechas

2. **`curso`**: Cursos disponibles
   - Campos: id, titulo, descripcion, instructor_id, estado, fecha_creacion

3. **`inscripcion`**: Inscripciones de estudiantes
   - Campos: id, estudiante_id, curso_id, fecha_inscripcion, estado

4. **`log_actividad`**: Log de actividades
   - Campos: id, usuario_id, accion, detalles, fecha

## 🔄 Diferencias con MySQL

### Cambios Principales

1. **Driver**: `mysql-connector-python` → `psycopg2-binary`
2. **URL de conexión**: `mysql+mysqlconnector://` → `postgresql://`
3. **Tipos de datos**:
   - `LONGBLOB` → `BYTEA`
   - `AUTO_INCREMENT` → `SERIAL`
4. **Sintaxis SQL**: Algunas diferencias menores

### Ventajas de PostgreSQL

- ✅ Mejor rendimiento para consultas complejas
- ✅ Soporte nativo para JSON
- ✅ Mejor integridad referencial
- ✅ Más estándar SQL
- ✅ Mejor escalabilidad

## 🛠️ Comandos Útiles

### Docker

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs postgres

# Detener servicios
docker-compose down

# Reiniciar servicios
docker-compose restart

# Ver estado
docker-compose ps
```

### Base de Datos

```bash
# Conectar a PostgreSQL
docker exec -it elearning_postgres psql -U elearning_user -d elearning_narino

# Backup
docker exec elearning_postgres pg_dump -U elearning_user elearning_narino > backup.sql

# Restore
docker exec -i elearning_postgres psql -U elearning_user -d elearning_narino < backup.sql
```

## 🚨 Solución de Problemas

### Error de Conexión

```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps

# Verificar logs
docker-compose logs postgres

# Verificar puerto
netstat -an | findstr 5432
```

### Error de Permisos

```bash
# Reiniciar contenedores
docker-compose down
docker-compose up -d
```

### Error de Dependencias

```bash
# Reinstalar dependencias
pip uninstall mysql-connector-python
pip install psycopg2-binary
```

## 📝 Notas Importantes

1. **Backup**: Siempre haz backup antes de migrar
2. **Testing**: Prueba en desarrollo antes de producción
3. **Performance**: PostgreSQL puede requerir ajustes de configuración
4. **Monitoring**: Usa pgAdmin para monitorear la base de datos

## ✅ Verificación Final

1. ✅ PostgreSQL corriendo en Docker
2. ✅ Backend conectando a PostgreSQL
3. ✅ Frontend funcionando correctamente
4. ✅ Registro de usuarios funcionando
5. ✅ Login funcionando
6. ✅ Subida de PDFs funcionando

¡Migración completada! 🎉 