# Guía de Producción - Plataforma E-Learning Gobernación de Nariño

## Resumen Ejecutivo

Esta guía proporciona instrucciones detalladas para desplegar la Plataforma E-Learning de la Gobernación de Nariño en un entorno de producción con MySQL como base de datos.

## Requisitos del Sistema de Producción

### Hardware Mínimo Recomendado
- **CPU:** 4 cores (Intel i5/AMD Ryzen 5 o superior)
- **RAM:** 8 GB mínimo (16 GB recomendado)
- **Almacenamiento:** 50 GB SSD
- **Red:** Conexión estable a internet

### Software Requerido
- **Sistema Operativo:** Ubuntu 20.04+, CentOS 8+, Windows Server 2019+
- **MySQL:** 8.0 o superior
- **Python:** 3.11 o superior
- **Node.js:** 20.18.0 o superior
- **Nginx:** Para servir el frontend (opcional)
- **Gunicorn:** Servidor WSGI para Python

## Instalación de MySQL

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install mysql-server mysql-client
sudo systemctl start mysql
sudo systemctl enable mysql
sudo mysql_secure_installation
```

### CentOS/RHEL
```bash
sudo yum install mysql-server mysql-client
sudo systemctl start mysqld
sudo systemctl enable mysqld
sudo mysql_secure_installation
```

### Windows
1. Descargar MySQL Installer desde https://dev.mysql.com/downloads/installer/
2. Ejecutar el instalador como administrador
3. Seguir las instrucciones del asistente
4. Configurar contraseña root

## Configuración de la Base de Datos

### 1. Crear Base de Datos y Usuario
```sql
-- Conectar como root
mysql -u root -p

-- Crear base de datos
CREATE DATABASE elearning_narino
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Crear usuario
CREATE USER 'elearning_user'@'localhost' IDENTIFIED BY 'password_seguro';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON elearning_narino.* TO 'elearning_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Ejecutar Script de Configuración
```bash
mysql -u root -p < database/setup_mysql.sql
```

## Configuración del Backend

### 1. Instalar Dependencias
```bash
cd backend/backend-app
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate     # Windows

pip install -r requirements.txt
pip install gunicorn
```

### 2. Configurar Variables de Entorno
Crear archivo `.env` en `backend/backend-app/`:
```env
FLASK_ENV=production
SECRET_KEY=tu_clave_secreta_muy_segura_aqui_cambiala_en_produccion
DATABASE_URL=mysql+mysqlconnector://elearning_user:password_seguro@localhost/elearning_narino
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=elearning_narino
MYSQL_USER=elearning_user
MYSQL_PASSWORD=password_seguro
```

### 3. Migrar Datos de SQLite a MySQL
```bash
python database/migrate_to_mysql.py
```

### 4. Probar Conexión
```bash
python -c "
from src.main import app
with app.app_context():
    from src.models.user import db
    db.create_all()
    print('✅ Base de datos configurada correctamente')
"
```

## Configuración del Frontend

### 1. Instalar Dependencias
```bash
cd frontend/frontend-app
pnpm install
```

### 2. Construir para Producción
```bash
pnpm run build
```

### 3. Configurar Servidor Web (Opcional)

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend
    location / {
        root /path/to/frontend/frontend-app/dist;
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

## Despliegue con Gunicorn

### 1. Crear Archivo WSGI
```python
# backend/backend-app/wsgi.py
from src.main import app

if __name__ == "__main__":
    app.run()
```

### 2. Configurar Gunicorn
```bash
# Configuración básica
gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 wsgi:app

# Configuración avanzada
gunicorn --bind 0.0.0.0:5000 \
         --workers 4 \
         --worker-class gevent \
         --worker-connections 1000 \
         --timeout 120 \
         --keep-alive 2 \
         --max-requests 1000 \
         --max-requests-jitter 100 \
         --preload \
         wsgi:app
```

### 3. Configurar como Servicio del Sistema

#### Linux (systemd)
```bash
# Crear archivo de servicio
sudo nano /etc/systemd/system/elearning-backend.service
```

```ini
[Unit]
Description=E-Learning Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/e-learning-platform/backend/backend-app
Environment=PATH=/path/to/e-learning-platform/backend/backend-app/venv/bin
ExecStart=/path/to/e-learning-platform/backend/backend-app/venv/bin/gunicorn --bind 0.0.0.0:5000 --workers 4 wsgi:app
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Habilitar y iniciar servicio
sudo systemctl daemon-reload
sudo systemctl enable elearning-backend
sudo systemctl start elearning-backend
```

#### Windows (Task Scheduler)
1. Abrir Task Scheduler
2. Crear Basic Task
3. Configurar para ejecutar `scripts/start_backend.bat` al inicio del sistema

## Monitoreo y Logs

### 1. Configurar Logs
```python
# En src/main.py
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    if not os.path.exists('logs'):
        os.mkdir('logs')
    file_handler = RotatingFileHandler('logs/elearning.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('E-Learning startup')
```

### 2. Monitoreo de Base de Datos
```sql
-- Verificar conexiones activas
SHOW PROCESSLIST;

-- Verificar tamaño de tablas
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'elearning_narino'
ORDER BY (data_length + index_length) DESC;
```

### 3. Monitoreo de Aplicación
```bash
# Verificar estado del servicio
sudo systemctl status elearning-backend

# Ver logs en tiempo real
sudo journalctl -u elearning-backend -f

# Verificar puertos
netstat -tlnp | grep :5000
```

## Backup y Recuperación

### 1. Backup de Base de Datos
```bash
#!/bin/bash
# backup_database.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mysql"
mkdir -p $BACKUP_DIR

mysqldump -u elearning_user -p elearning_narino > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql

# Mantener solo los últimos 30 días
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### 2. Backup de Archivos
```bash
#!/bin/bash
# backup_files.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/files"
SOURCE_DIR="/path/to/e-learning-platform"

tar -czf $BACKUP_DIR/elearning_files_$DATE.tar.gz -C $SOURCE_DIR .
```

### 3. Restauración
```bash
# Restaurar base de datos
mysql -u elearning_user -p elearning_narino < backup_20240815.sql

# Restaurar archivos
tar -xzf elearning_files_20240815.tar.gz -C /path/to/restore/
```

## Seguridad

### 1. Configuración de Firewall
```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 2. Configuración de MySQL
```sql
-- Deshabilitar acceso remoto root
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');

-- Crear usuario solo para localhost
CREATE USER 'elearning_user'@'localhost' IDENTIFIED BY 'password_seguro';
GRANT ALL PRIVILEGES ON elearning_narino.* TO 'elearning_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configuración de SSL/TLS
```bash
# Generar certificado SSL
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/elearning.key \
    -out /etc/ssl/certs/elearning.crt
```

## Escalabilidad

### 1. Load Balancing
```nginx
upstream backend {
    server 127.0.0.1:5000;
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

### 2. Base de Datos Master-Slave
```sql
-- En el slave
CHANGE MASTER TO
    MASTER_HOST='master_ip',
    MASTER_USER='replication_user',
    MASTER_PASSWORD='replication_password',
    MASTER_LOG_FILE='mysql-bin.000001',
    MASTER_LOG_POS=154;
```

## Troubleshooting

### Problemas Comunes

#### 1. Error de Conexión a MySQL
```bash
# Verificar servicio MySQL
sudo systemctl status mysql

# Verificar conexión
mysql -u elearning_user -p -h localhost

# Verificar logs
sudo tail -f /var/log/mysql/error.log
```

#### 2. Error de Gunicorn
```bash
# Verificar logs
sudo journalctl -u elearning-backend -n 50

# Verificar permisos
ls -la /path/to/e-learning-platform/backend/backend-app/

# Verificar entorno virtual
source venv/bin/activate
python -c "import flask; print(flask.__version__)"
```

#### 3. Error de Frontend
```bash
# Verificar build
cd frontend/frontend-app
pnpm run build

# Verificar archivos estáticos
ls -la dist/

# Verificar configuración de Nginx
sudo nginx -t
```

## Mantenimiento

### 1. Actualizaciones
```bash
# Actualizar dependencias Python
pip list --outdated
pip install --upgrade package_name

# Actualizar dependencias Node.js
pnpm outdated
pnpm update

# Actualizar sistema operativo
sudo apt update && sudo apt upgrade  # Ubuntu
sudo yum update                      # CentOS
```

### 2. Limpieza
```bash
# Limpiar logs antiguos
sudo find /var/log -name "*.log" -mtime +30 -delete

# Limpiar backups antiguos
find /backups -name "backup_*" -mtime +90 -delete

# Limpiar cache de Python
find . -name "__pycache__" -type d -exec rm -rf {} +
```

## Contacto y Soporte

- **Fecha de Desarrollo:** Agosto 2025
- **Versión:** 1.0.0
- **Documentación:** Esta guía y archivos README.md

---

**Nota:** Esta guía debe ser adaptada según las necesidades específicas del entorno de producción y las políticas de seguridad de la Gobernación de Nariño. 