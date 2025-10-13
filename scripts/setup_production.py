#!/usr/bin/env python3
"""
Script de configuración para producción
Plataforma E-Learning - Gobernación de Nariño
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def check_mysql_installation():
    """Verificar si MySQL está instalado"""
    try:
        result = subprocess.run(['mysql', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ MySQL está instalado")
            print(f"   Versión: {result.stdout.strip()}")
            return True
        else:
            print("❌ MySQL no está instalado o no está en el PATH")
            return False
    except FileNotFoundError:
        print("❌ MySQL no está instalado")
        return False

def setup_mysql_database():
    """Configurar la base de datos MySQL"""
    print("\n🔧 Configurando base de datos MySQL...")
    
    # Verificar si el script SQL existe
    sql_script = Path("database/setup_mysql.sql")
    if not sql_script.exists():
        print("❌ No se encontró el script setup_mysql.sql")
        return False
    
    try:
        # Ejecutar el script SQL
        result = subprocess.run([
            'mysql', '-u', 'root', '-p', '-e', 
            f'source {sql_script.absolute()}'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Base de datos MySQL configurada correctamente")
            return True
        else:
            print(f"❌ Error configurando MySQL: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error ejecutando script MySQL: {e}")
        return False

def install_production_dependencies():
    """Instalar dependencias para producción"""
    print("\n📦 Instalando dependencias de producción...")
    
    try:
        # Navegar al directorio del backend
        backend_dir = Path("backend/backend-app")
        if not backend_dir.exists():
            print("❌ No se encontró el directorio del backend")
            return False
        
        # Activar entorno virtual e instalar dependencias
        if os.name == 'nt':  # Windows
            activate_script = backend_dir / "venv" / "Scripts" / "Activate.ps1"
            pip_cmd = f"& '{activate_script}' && pip install gunicorn"
        else:  # Linux/Mac
            activate_script = backend_dir / "venv" / "bin" / "activate"
            pip_cmd = f"source {activate_script} && pip install gunicorn"
        
        result = subprocess.run(pip_cmd, shell=True, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Dependencias de producción instaladas")
            return True
        else:
            print(f"❌ Error instalando dependencias: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error en instalación: {e}")
        return False

def create_production_config():
    """Crear archivos de configuración para producción"""
    print("\n⚙️ Creando configuración de producción...")
    
    try:
        # Crear archivo .env para producción
        env_content = """# Configuración de Producción
FLASK_ENV=production
SECRET_KEY=tu_clave_secreta_muy_segura_aqui_cambiala_en_produccion
DATABASE_URL=mysql+mysqlconnector://elearning_user:password_seguro@localhost/elearning_narino

# Configuración de MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=elearning_narino
MYSQL_USER=elearning_user
MYSQL_PASSWORD=password_seguro
"""
        
        env_file = Path("backend/backend-app/.env")
        env_file.write_text(env_content)
        print("✅ Archivo .env creado")
        
        # Crear archivo wsgi.py para Gunicorn
        wsgi_content = """from src.main import app

if __name__ == "__main__":
    app.run()
"""
        
        wsgi_file = Path("backend/backend-app/wsgi.py")
        wsgi_file.write_text(wsgi_content)
        print("✅ Archivo wsgi.py creado")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creando configuración: {e}")
        return False

def build_frontend():
    """Construir el frontend para producción"""
    print("\n🏗️ Construyendo frontend para producción...")
    
    try:
        frontend_dir = Path("frontend/frontend-app")
        if not frontend_dir.exists():
            print("❌ No se encontró el directorio del frontend")
            return False
        
        # Navegar al directorio del frontend y construir
        result = subprocess.run(
            ['pnpm', 'run', 'build'],
            cwd=frontend_dir,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print("✅ Frontend construido para producción")
            return True
        else:
            print(f"❌ Error construyendo frontend: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error en construcción: {e}")
        return False

def create_startup_scripts():
    """Crear scripts de inicio para producción"""
    print("\n🚀 Creando scripts de inicio...")
    
    try:
        # Script para iniciar backend con Gunicorn
        gunicorn_script = """#!/bin/bash
# Script para iniciar el backend en producción
cd backend/backend-app
source venv/bin/activate
export FLASK_ENV=production
gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 wsgi:app
"""
        
        gunicorn_file = Path("scripts/start_backend.sh")
        gunicorn_file.write_text(gunicorn_script)
        gunicorn_file.chmod(0o755)  # Hacer ejecutable
        print("✅ Script de inicio del backend creado")
        
        # Script para Windows
        gunicorn_win_script = """@echo off
REM Script para iniciar el backend en producción (Windows)
cd backend\\backend-app
call venv\\Scripts\\activate.bat
set FLASK_ENV=production
gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 wsgi:app
"""
        
        gunicorn_win_file = Path("scripts/start_backend.bat")
        gunicorn_win_file.write_text(gunicorn_win_script)
        print("✅ Script de inicio del backend (Windows) creado")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creando scripts: {e}")
        return False

def main():
    """Función principal"""
    print("🚀 Configuración de Producción - Plataforma E-Learning")
    print("=" * 60)
    
    # Verificar MySQL
    if not check_mysql_installation():
        print("\n📋 Para instalar MySQL:")
        print("   Windows: Descargar desde https://dev.mysql.com/downloads/installer/")
        print("   Linux: sudo apt-get install mysql-server")
        print("   macOS: brew install mysql")
        return
    
    # Configurar base de datos
    if not setup_mysql_database():
        print("\n❌ No se pudo configurar la base de datos")
        return
    
    # Instalar dependencias
    if not install_production_dependencies():
        print("\n❌ No se pudieron instalar las dependencias")
        return
    
    # Crear configuración
    if not create_production_config():
        print("\n❌ No se pudo crear la configuración")
        return
    
    # Construir frontend
    if not build_frontend():
        print("\n❌ No se pudo construir el frontend")
        return
    
    # Crear scripts de inicio
    if not create_startup_scripts():
        print("\n❌ No se pudieron crear los scripts de inicio")
        return
    
    print("\n" + "=" * 60)
    print("🎉 Configuración de producción completada")
    print("\n📋 Próximos pasos:")
    print("   1. Ejecutar: python database/migrate_to_mysql.py")
    print("   2. Iniciar backend: scripts/start_backend.sh (Linux/Mac)")
    print("   3. Iniciar backend: scripts/start_backend.bat (Windows)")
    print("   4. Configurar servidor web (Nginx/Apache) para servir el frontend")
    print("\n🔒 Recuerda cambiar las contraseñas por defecto en producción")

if __name__ == "__main__":
    main() 