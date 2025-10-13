# Guía de Administración - Plataforma E-Learning Gobernación de Nariño

## Introducción

Esta guía está dirigida a los administradores técnicos y funcionales de la Plataforma E-Learning de la Gobernación de Nariño. Proporciona información detallada sobre la gestión, mantenimiento y administración del sistema.

## Roles y Responsabilidades

### Administrador Técnico
- Mantenimiento de servidores y base de datos
- Actualizaciones de software y seguridad
- Monitoreo del rendimiento del sistema
- Backup y recuperación de datos
- Resolución de problemas técnicos

### Administrador Funcional
- Gestión de usuarios y permisos
- Supervisión del contenido de la plataforma
- Generación de reportes de uso
- Soporte a usuarios finales
- Configuración de políticas de la plataforma

## Arquitectura del Sistema

### Componentes Principales

**Frontend (React)**
- Ubicación: `/frontend/frontend-app/`
- Puerto: 5173 (desarrollo), 80/443 (producción)
- Tecnología: React 19.1.0 + Vite + Tailwind CSS

**Backend (Flask)**
- Ubicación: `/backend/backend-app/`
- Puerto: 5000 (desarrollo), 5000 (producción)
- Tecnología: Flask 3.1.1 + SQLAlchemy

**Base de Datos**
- Desarrollo: SQLite (`src/database/app.db`)
- Producción: MySQL/PostgreSQL (recomendado)

### Flujo de Datos
```
Usuario → Frontend (React) → API (Flask) → Base de Datos → Respuesta
```

## Gestión de Usuarios

### Acceso a la Base de Datos

#### SQLite (Desarrollo)
```bash
# Acceder a la base de datos
cd backend/backend-app
sqlite3 src/database/app.db

# Comandos útiles
.tables                    # Listar tablas
.schema user              # Ver estructura de tabla
SELECT * FROM user;       # Ver todos los usuarios
.quit                     # Salir
```

#### MySQL (Producción)
```sql
-- Conectar a MySQL
mysql -u elearning_user -p elearning_narino

-- Consultas útiles
SHOW TABLES;
DESCRIBE user;
SELECT * FROM user;
SELECT COUNT(*) FROM user;
```

### Consultas Administrativas Comunes

#### Estadísticas de Usuarios
```sql
-- Total de usuarios registrados
SELECT COUNT(*) as total_usuarios FROM user;

-- Usuarios registrados por mes
SELECT 
    DATE_FORMAT(fecha_creacion, '%Y-%m') as mes,
    COUNT(*) as nuevos_usuarios
FROM user 
GROUP BY DATE_FORMAT(fecha_creacion, '%Y-%m')
ORDER BY mes DESC;

-- Usuarios activos vs inactivos
SELECT 
    estado_cuenta,
    COUNT(*) as cantidad
FROM user 
GROUP BY estado_cuenta;

-- Últimos usuarios registrados
SELECT 
    nombre, 
    apellido, 
    email, 
    fecha_creacion
FROM user 
ORDER BY fecha_creacion DESC 
LIMIT 10;
```

#### Gestión de Estados de Cuenta
```sql
-- Activar cuenta de usuario
UPDATE user 
SET estado_cuenta = 'activa' 
WHERE email = 'usuario@example.com';

-- Suspender cuenta de usuario
UPDATE user 
SET estado_cuenta = 'suspendida' 
WHERE email = 'usuario@example.com';

-- Desactivar cuenta de usuario
UPDATE user 
SET estado_cuenta = 'inactiva' 
WHERE email = 'usuario@example.com';
```

#### Limpieza de Tokens Expirados
```sql
-- Limpiar tokens de recuperación expirados
UPDATE user 
SET token_reset = NULL, token_reset_expira = NULL 
WHERE token_reset_expira < NOW();

-- Ver tokens activos
SELECT 
    email, 
    token_reset, 
    token_reset_expira 
FROM user 
WHERE token_reset IS NOT NULL 
AND token_reset_expira > NOW();
```

### Gestión Manual de Usuarios

#### Crear Usuario Administrativamente
```python
# Script Python para crear usuario
from werkzeug.security import generate_password_hash
from datetime import datetime

# Datos del usuario
nombre = "Admin"
apellido = "Sistema"
email = "admin@narino.gov.co"
password = "AdminPass123"

# Generar hash de contraseña
password_hash = generate_password_hash(password)

# SQL para insertar
sql = """
INSERT INTO user (nombre, apellido, email, password_hash, fecha_creacion, estado_cuenta)
VALUES (?, ?, ?, ?, ?, ?)
"""

# Ejecutar en SQLite
import sqlite3
conn = sqlite3.connect('src/database/app.db')
cursor = conn.cursor()
cursor.execute(sql, (nombre, apellido, email, password_hash, datetime.now(), 'activa'))
conn.commit()
conn.close()
```

#### Resetear Contraseña Manualmente
```python
# Script para resetear contraseña
from werkzeug.security import generate_password_hash
import sqlite3

email = "usuario@example.com"
nueva_password = "NuevaPassword123"
password_hash = generate_password_hash(nueva_password)

conn = sqlite3.connect('src/database/app.db')
cursor = conn.cursor()
cursor.execute(
    "UPDATE user SET password_hash = ?, token_reset = NULL, token_reset_expira = NULL WHERE email = ?",
    (password_hash, email)
)
conn.commit()
conn.close()

print(f"Contraseña actualizada para {email}")
```

## Monitoreo del Sistema

### Logs del Sistema

#### Logs del Backend (Flask)
```bash
# Ver logs en tiempo real (desarrollo)
cd backend/backend-app
python src/main.py

# Para producción con Gunicorn
gunicorn --bind 0.0.0.0:5000 --access-logfile access.log --error-logfile error.log wsgi:app
```

#### Configurar Logging Avanzado
```python
# Añadir a main.py
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    file_handler = RotatingFileHandler('logs/app.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('Plataforma E-Learning iniciada')
```

### Métricas de Rendimiento

#### Monitoreo de Base de Datos
```sql
-- Tamaño de la base de datos (SQLite)
SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size();

-- Consultas lentas (MySQL)
SHOW PROCESSLIST;
SHOW FULL PROCESSLIST;

-- Estadísticas de tablas (MySQL)
SELECT 
    table_name,
    table_rows,
    data_length,
    index_length
FROM information_schema.tables 
WHERE table_schema = 'elearning_narino';
```

#### Monitoreo del Servidor
```bash
# Uso de CPU y memoria
top
htop

# Espacio en disco
df -h

# Procesos de la aplicación
ps aux | grep python
ps aux | grep node

# Conexiones de red
netstat -tulpn | grep :5000
netstat -tulpn | grep :5173
```

### Alertas y Notificaciones

#### Script de Monitoreo Básico
```bash
#!/bin/bash
# monitor.sh

# Verificar que el backend esté corriendo
if ! curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "ALERTA: Backend no responde" | mail -s "Error Plataforma E-Learning" admin@narino.gov.co
fi

# Verificar espacio en disco
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "ALERTA: Espacio en disco al $DISK_USAGE%" | mail -s "Espacio en Disco" admin@narino.gov.co
fi

# Verificar tamaño de base de datos
DB_SIZE=$(stat -c%s "backend/backend-app/src/database/app.db")
if [ $DB_SIZE -gt 1073741824 ]; then  # 1GB
    echo "ALERTA: Base de datos mayor a 1GB" | mail -s "Tamaño BD" admin@narino.gov.co
fi
```

## Backup y Recuperación

### Backup de Base de Datos

#### SQLite (Desarrollo)
```bash
#!/bin/bash
# backup_sqlite.sh

DATE=$(date +%Y%m%d_%H%M%S)
SOURCE="backend/backend-app/src/database/app.db"
BACKUP_DIR="backups"
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.db"

# Crear directorio de backup si no existe
mkdir -p $BACKUP_DIR

# Realizar backup
cp $SOURCE $BACKUP_FILE

# Comprimir backup
gzip $BACKUP_FILE

# Limpiar backups antiguos (mantener últimos 30 días)
find $BACKUP_DIR -name "backup_*.db.gz" -mtime +30 -delete

echo "Backup completado: $BACKUP_FILE.gz"
```

#### MySQL (Producción)
```bash
#!/bin/bash
# backup_mysql.sh

DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="elearning_narino"
DB_USER="elearning_user"
DB_PASS="password_seguro"
BACKUP_DIR="backups"
BACKUP_FILE="$BACKUP_DIR/mysql_backup_$DATE.sql"

# Crear directorio de backup
mkdir -p $BACKUP_DIR

# Realizar backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_FILE

# Comprimir backup
gzip $BACKUP_FILE

# Limpiar backups antiguos
find $BACKUP_DIR -name "mysql_backup_*.sql.gz" -mtime +30 -delete

echo "Backup MySQL completado: $BACKUP_FILE.gz"
```

### Automatización de Backups

#### Configurar Cron
```bash
# Editar crontab
crontab -e

# Añadir líneas para backup automático
# Backup diario a las 2:00 AM
0 2 * * * /path/to/backup_script.sh

# Backup semanal completo los domingos a las 3:00 AM
0 3 * * 0 /path/to/full_backup.sh
```

### Recuperación de Datos

#### Restaurar desde Backup SQLite
```bash
# Detener la aplicación
pkill -f "python src/main.py"

# Restaurar backup
gunzip -c backups/backup_20240815_020000.db.gz > backend/backend-app/src/database/app.db

# Reiniciar aplicación
cd backend/backend-app
source venv/bin/activate
python src/main.py &
```

#### Restaurar desde Backup MySQL
```bash
# Restaurar base de datos
gunzip -c backups/mysql_backup_20240815_020000.sql.gz | mysql -u elearning_user -p elearning_narino
```

## Seguridad

### Configuración de Seguridad

#### Variables de Entorno Seguras
```bash
# .env (producción)
SECRET_KEY=clave_super_secreta_de_64_caracteres_minimo_para_produccion
DATABASE_URL=mysql://user:password@localhost/dbname
FLASK_ENV=production
FLASK_DEBUG=False
MAIL_SERVER=smtp.narino.gov.co
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=noreply@narino.gov.co
MAIL_PASSWORD=password_email
```

#### Configuración de Firewall
```bash
# UFW (Ubuntu)
sudo ufw enable
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 5000/tcp    # Flask (solo si es necesario)
sudo ufw deny 5173/tcp     # Bloquear puerto de desarrollo
```

### Auditoría de Seguridad

#### Verificar Configuración
```bash
# Verificar permisos de archivos
find . -name "*.py" -perm 777
find . -name "*.db" -perm 777

# Verificar que no hay credenciales en código
grep -r "password" --include="*.py" .
grep -r "secret" --include="*.py" .
```

#### Logs de Seguridad
```python
# Añadir logging de seguridad
import logging

security_logger = logging.getLogger('security')
handler = logging.FileHandler('logs/security.log')
handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(levelname)s - %(message)s'
))
security_logger.addHandler(handler)

# En las rutas de autenticación
@user_bp.route('/login', methods=['POST'])
def login():
    # ... código existente ...
    if not user or not user.check_password(password):
        security_logger.warning(f'Intento de login fallido para {email} desde {request.remote_addr}')
        return jsonify({'error': 'Credenciales inválidas'}), 401
```

## Mantenimiento

### Tareas de Mantenimiento Regular

#### Diarias
- Verificar logs de errores
- Monitorear uso de recursos
- Verificar backup automático

#### Semanales
- Limpiar logs antiguos
- Verificar espacio en disco
- Revisar usuarios inactivos
- Actualizar estadísticas

#### Mensuales
- Actualizar dependencias de seguridad
- Revisar configuración de seguridad
- Analizar métricas de uso
- Planificar mejoras

### Scripts de Mantenimiento

#### Limpieza de Logs
```bash
#!/bin/bash
# cleanup_logs.sh

# Limpiar logs antiguos (más de 30 días)
find logs/ -name "*.log" -mtime +30 -delete

# Rotar logs grandes
for log in logs/*.log; do
    if [ -f "$log" ] && [ $(stat -c%s "$log") -gt 10485760 ]; then  # 10MB
        mv "$log" "$log.$(date +%Y%m%d)"
        touch "$log"
    fi
done
```

#### Optimización de Base de Datos
```sql
-- SQLite
VACUUM;
ANALYZE;

-- MySQL
OPTIMIZE TABLE user;
ANALYZE TABLE user;
```

### Actualizaciones del Sistema

#### Actualizar Dependencias Python
```bash
cd backend/backend-app
source venv/bin/activate

# Verificar actualizaciones disponibles
pip list --outdated

# Actualizar dependencias específicas
pip install --upgrade flask
pip install --upgrade flask-sqlalchemy

# Actualizar requirements.txt
pip freeze > requirements.txt
```

#### Actualizar Dependencias Node.js
```bash
cd frontend/frontend-app

# Verificar actualizaciones
pnpm outdated

# Actualizar dependencias
pnpm update

# Actualizar dependencias específicas
pnpm add react@latest
pnpm add vite@latest
```

## Resolución de Problemas

### Problemas Comunes

#### "Base de datos bloqueada"
```bash
# Verificar procesos que usan la BD
lsof backend/backend-app/src/database/app.db

# Terminar procesos si es necesario
kill -9 [PID]

# Verificar integridad de la BD
sqlite3 backend/backend-app/src/database/app.db "PRAGMA integrity_check;"
```

#### "Puerto en uso"
```bash
# Encontrar proceso usando el puerto
lsof -i :5000
lsof -i :5173

# Terminar proceso
kill -9 [PID]

# O cambiar puerto en configuración
```

#### "Error de CORS"
```python
# Verificar configuración CORS en main.py
from flask_cors import CORS

CORS(app, 
     origins=['http://localhost:5173', 'https://tu-dominio.com'],
     supports_credentials=True)
```

### Logs de Diagnóstico

#### Habilitar Debug Detallado
```python
# En main.py para desarrollo
app.config['DEBUG'] = True
app.config['SQLALCHEMY_ECHO'] = True  # Ver consultas SQL

# Logging detallado
logging.basicConfig(level=logging.DEBUG)
```

#### Verificar Estado del Sistema
```bash
#!/bin/bash
# system_check.sh

echo "=== Estado del Sistema ==="
echo "Fecha: $(date)"
echo

echo "=== Procesos ==="
ps aux | grep -E "(python|node)" | grep -v grep

echo "=== Puertos ==="
netstat -tulpn | grep -E "(5000|5173)"

echo "=== Espacio en Disco ==="
df -h

echo "=== Memoria ==="
free -h

echo "=== Base de Datos ==="
if [ -f "backend/backend-app/src/database/app.db" ]; then
    echo "BD SQLite: $(stat -c%s backend/backend-app/src/database/app.db) bytes"
    sqlite3 backend/backend-app/src/database/app.db "SELECT COUNT(*) as usuarios FROM user;"
else
    echo "BD SQLite: No encontrada"
fi
```

## Contacto y Soporte

### Información de Contacto
- **Fecha de Implementación:** Agosto 2025
- **Versión:** 1.0.0

### Documentación Adicional
- `README.md` - Información general del proyecto
- `INSTALLATION.md` - Guía de instalación detallada
- `API_DOCUMENTATION.md` - Documentación completa de la API

### Soporte Técnico
Para problemas técnicos o consultas sobre la administración del sistema, consultar la documentación técnica o contactar al equipo de desarrollo.

---

**Nota:** Esta guía debe mantenerse actualizada conforme evolucione la plataforma. Se recomienda revisar y actualizar los procedimientos regularmente.

