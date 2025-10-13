#!/usr/bin/env python3
"""
Script para debuggear la configuración
"""

import os

# Configurar variables de entorno
os.environ['FLASK_ENV'] = 'production'
os.environ['DATABASE_URL'] = 'mysql+mysqlconnector://root@localhost/elearning_narino'

print("🔍 Debug de configuración")
print("=" * 40)

print(f"FLASK_ENV: {os.getenv('FLASK_ENV')}")
print(f"DATABASE_URL: {os.getenv('DATABASE_URL')}")

try:
    from src.config import config
    
    env = os.getenv('FLASK_ENV', 'development')
    app_config = config[env]
    
    print(f"Entorno: {env}")
    print(f"URL de BD: {app_config.SQLALCHEMY_DATABASE_URI}")
    
    # Probar conexión directa
    import mysql.connector
    
    connection = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='elearning_narino'
    )
    
    if connection.is_connected():
        cursor = connection.cursor()
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()
        print(f"✅ Conexión directa exitosa: MySQL {version[0]}")
        cursor.close()
        connection.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc() 