# Guía de Instalación - Plataforma E-Learning Gobernación de Nariño

## Requisitos del Sistema

### Requisitos Mínimos de Hardware
- **Procesador:** Intel Core i3 o AMD equivalente
- **Memoria RAM:** 4 GB mínimo (8 GB recomendado)
- **Espacio en Disco:** 2 GB libres
- **Conexión a Internet:** Banda ancha para desarrollo

### Requisitos de Software
- **Sistema Operativo:** Windows 10+, macOS 10.15+, o Linux Ubuntu 18.04+
- **Node.js:** Versión 20.18.0 o superior
- **Python:** Versión 3.11 o superior
- **Git:** Para control de versiones
- **Editor de Código:** VS Code, Sublime Text, o similar (opcional)

## Instalación Paso a Paso

### 1. Preparación del Entorno

#### Instalación de Node.js
1. Visitar [nodejs.org](https://nodejs.org/)
2. Descargar la versión LTS más reciente
3. Ejecutar el instalador siguiendo las instrucciones
4. Verificar la instalación:
   ```bash
   node --version
   npm --version
   ```

#### Instalación de pnpm
```bash
npm install -g pnpm
```

#### Instalación de Python
1. Visitar [python.org](https://python.org/)
2. Descargar Python 3.11 o superior
3. Durante la instalación, marcar "Add Python to PATH"
4. Verificar la instalación:
   ```bash
   python --version
   pip --version
   ```

### 2. Descarga del Proyecto

#### Opción A: Clonar desde Repositorio (si está disponible)
```bash
git clone [URL_DEL_REPOSITORIO]
cd e-learning-platform
```

#### Opción B: Descargar Archivos Manualmente
1. Descargar el archivo ZIP del proyecto
2. Extraer en la ubicación deseada
3. Navegar al directorio del proyecto

### 3. Configuración del Backend

#### Navegar al Directorio del Backend
```bash
cd e-learning-platform/backend/backend-app
```

#### Crear Entorno Virtual
```bash
# En Windows
python -m venv venv
venv\Scripts\activate

# En macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### Instalar Dependencias de Python
```bash
pip install flask==3.1.1
pip install flask-sqlalchemy
pip install flask-cors==6.0.0
pip install werkzeug==3.1.3
```

#### Crear Archivo requirements.txt
```bash
pip freeze > requirements.txt
```

#### Verificar Estructura de Directorios
Asegurar que existe la siguiente estructura:
```
backend-app/
├── src/
│   ├── models/
│   │   └── user.py
│   ├── routes/
│   │   └── user.py
│   ├── database/
│   └── main.py
├── venv/
└── requirements.txt
```

#### Crear Directorio de Base de Datos
```bash
mkdir -p src/database
```

### 4. Configuración del Frontend

#### Navegar al Directorio del Frontend
```bash
cd ../../frontend/frontend-app
```

#### Instalar Dependencias de Node.js
```bash
pnpm install
```

#### Verificar Dependencias Instaladas
Las siguientes dependencias deberían estar instaladas:
- react@19.1.0
- react-dom@19.1.0
- react-router-dom
- @radix-ui/react-checkbox
- lucide-react
- tailwindcss
- vite

### 5. Configuración de Base de Datos

#### Configuración Automática
La base de datos SQLite se crea automáticamente al iniciar el backend por primera vez. No requiere configuración adicional para desarrollo.

#### Para Producción (MySQL)
Si se desea usar MySQL en producción:

1. **Instalar MySQL:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mysql-server mysql-client

   # macOS con Homebrew
   brew install mysql

   # Windows: Descargar desde mysql.com
   ```

2. **Crear Base de Datos:**
   ```sql
   CREATE DATABASE elearning_narino;
   CREATE USER 'elearning_user'@'localhost' IDENTIFIED BY 'password_seguro';
   GRANT ALL PRIVILEGES ON elearning_narino.* TO 'elearning_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Instalar Conector MySQL:**
   ```bash
   pip install mysql-connector-python
   ```

4. **Modificar Configuración en main.py:**
   ```python
   app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://elearning_user:password_seguro@localhost/elearning_narino'
   ```

### 6. Configuración de Variables de Entorno

#### Crear Archivo .env (Opcional)
En el directorio del backend, crear `.env`:
```
SECRET_KEY=tu_clave_secreta_muy_segura_aqui
DATABASE_URL=sqlite:///database/app.db
FLASK_ENV=development
FLASK_DEBUG=True
```

#### Configurar Variables en main.py
```python
import os
from dotenv import load_dotenv

load_dotenv()

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'clave-por-defecto')
```

### 7. Inicialización del Sistema

#### Iniciar el Backend
```bash
cd backend/backend-app
source venv/bin/activate  # En Windows: venv\Scripts\activate
python src/main.py
```

Deberías ver:
```
* Serving Flask app 'main'
* Debug mode: on
* Running on http://127.0.0.1:5000
```

#### Iniciar el Frontend (en otra terminal)
```bash
cd frontend/frontend-app
pnpm run dev
```

Deberías ver:
```
VITE v6.3.5  ready in 488 ms
➜  Local:   http://localhost:5173/
```

### 8. Verificación de la Instalación

#### Pruebas Básicas
1. **Acceder a la Landing Page:**
   - Abrir navegador en `http://localhost:5173`
   - Verificar que se carga correctamente
   - Verificar que los logos aparecen

2. **Probar Registro:**
   - Hacer clic en "Registrarse"
   - Completar formulario con datos válidos
   - Verificar que se crea el usuario

3. **Probar Login:**
   - Usar credenciales del usuario creado
   - Verificar autenticación exitosa

4. **Verificar Base de Datos:**
   ```bash
   # Acceder a SQLite
   sqlite3 src/database/app.db
   .tables
   SELECT * FROM user;
   .quit
   ```

### 9. Configuración para Producción

#### Configuración del Backend para Producción
1. **Instalar Gunicorn:**
   ```bash
   pip install gunicorn
   ```

2. **Crear archivo wsgi.py:**
   ```python
   from src.main import app

   if __name__ == "__main__":
       app.run()
   ```

3. **Ejecutar con Gunicorn:**
   ```bash
   gunicorn --bind 0.0.0.0:5000 wsgi:app
   ```

#### Construcción del Frontend para Producción
```bash
cd frontend/frontend-app
pnpm run build
```

#### Configuración de Nginx (Opcional)
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Solución de Problemas Comunes

### Error: "Module not found"
**Problema:** Dependencias no instaladas correctamente
**Solución:**
```bash
# Backend
pip install -r requirements.txt

# Frontend
pnpm install
```

### Error: "Port already in use"
**Problema:** Puerto ocupado por otro proceso
**Solución:**
```bash
# Encontrar proceso usando el puerto
lsof -i :5000  # o :5173

# Terminar proceso
kill -9 [PID]
```

### Error: "Database connection failed"
**Problema:** Base de datos no accesible
**Solución:**
1. Verificar que el directorio `src/database` existe
2. Verificar permisos de escritura
3. Revisar configuración de DATABASE_URI

### Error: "CORS policy"
**Problema:** Problemas de CORS entre frontend y backend
**Solución:**
1. Verificar que Flask-CORS está instalado
2. Verificar configuración en main.py:
   ```python
   CORS(app, supports_credentials=True)
   ```

### Error: "Assets not loading"
**Problema:** Logos o imágenes no se cargan
**Solución:**
1. Verificar que los archivos están en `src/assets/`
2. Verificar rutas en los componentes React
3. Verificar configuración de Vite

## Comandos Útiles

### Backend
```bash
# Activar entorno virtual
source venv/bin/activate

# Instalar nueva dependencia
pip install [paquete]

# Actualizar requirements.txt
pip freeze > requirements.txt

# Ejecutar con debug
python src/main.py

# Ejecutar tests (cuando estén disponibles)
python -m pytest
```

### Frontend
```bash
# Instalar dependencia
pnpm add [paquete]

# Ejecutar en desarrollo
pnpm run dev

# Construir para producción
pnpm run build

# Previsualizar build
pnpm run preview

# Linter
pnpm run lint
```

### Base de Datos
```bash
# Acceder a SQLite
sqlite3 src/database/app.db

# Backup de base de datos
cp src/database/app.db backup_$(date +%Y%m%d).db

# Restaurar backup
cp backup_20240815.db src/database/app.db
```

## Mantenimiento

### Actualizaciones Regulares
1. **Dependencias de Python:**
   ```bash
   pip list --outdated
   pip install --upgrade [paquete]
   ```

2. **Dependencias de Node.js:**
   ```bash
   pnpm outdated
   pnpm update
   ```

### Backup de Datos
```bash
# Script de backup automático
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp src/database/app.db backups/backup_$DATE.db
find backups/ -name "backup_*.db" -mtime +30 -delete
```

### Logs y Monitoreo
1. **Logs del Backend:**
   - Los logs aparecen en la consola durante desarrollo
   - Para producción, configurar logging a archivos

2. **Logs del Frontend:**
   - Usar herramientas de desarrollo del navegador
   - Configurar error tracking en producción

---

**Nota:** Esta guía cubre la instalación básica para desarrollo. Para deployment en producción, considerar aspectos adicionales como SSL, firewall, monitoreo y backup automatizado.

