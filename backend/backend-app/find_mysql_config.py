#!/usr/bin/env python3
"""
Script para encontrar la configuración correcta de MySQL
"""

import mysql.connector
from mysql.connector import Error

def test_connection(host, user, password, database=None):
    """Probar conexión a MySQL"""
    try:
        if database:
            connection = mysql.connector.connect(
                host=host,
                user=user,
                password=password,
                database=database
            )
        else:
            connection = mysql.connector.connect(
                host=host,
                user=user,
                password=password
            )
        
        if connection.is_connected():
            cursor = connection.cursor()
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            print(f"✅ Conexión exitosa a MySQL {version[0]}")
            
            # Verificar si la base de datos existe
            if database:
                cursor.execute(f"SHOW DATABASES LIKE '{database}'")
                if cursor.fetchone():
                    print(f"✅ Base de datos '{database}' existe")
                else:
                    print(f"❌ Base de datos '{database}' no existe")
            
            cursor.close()
            connection.close()
            return True
            
    except Error as e:
        print(f"❌ Error de conexión: {e}")
        return False

def main():
    print("🔍 Buscando configuración de MySQL...")
    print("=" * 50)
    
    # Configuraciones comunes para probar
    configs = [
        # Sin contraseña
        {"host": "localhost", "user": "root", "password": "", "database": None},
        # Contraseñas comunes
        {"host": "localhost", "user": "root", "password": "root", "database": None},
        {"host": "localhost", "user": "root", "password": "admin", "database": None},
        {"host": "localhost", "user": "root", "password": "password", "database": None},
        {"host": "localhost", "user": "root", "password": "123456", "database": None},
        {"host": "localhost", "user": "root", "password": "mysql", "database": None},
        # Con puerto específico
        {"host": "127.0.0.1", "user": "root", "password": "", "database": None},
        {"host": "127.0.0.1", "user": "root", "password": "root", "database": None},
    ]
    
    working_config = None
    
    for config in configs:
        print(f"\n🔧 Probando: {config['user']}@{config['host']} (password: {'*' * len(config['password']) if config['password'] else 'vacía'})")
        
        if test_connection(config['host'], config['user'], config['password']):
            working_config = config
            break
    
    if working_config:
        print("\n" + "=" * 50)
        print("🎉 Configuración encontrada!")
        print(f"Host: {working_config['host']}")
        print(f"Usuario: {working_config['user']}")
        print(f"Contraseña: {working_config['password'] if working_config['password'] else '(vacía)'}")
        
        # Crear la base de datos si no existe
        print("\n📦 Creando base de datos...")
        try:
            connection = mysql.connector.connect(
                host=working_config['host'],
                user=working_config['user'],
                password=working_config['password']
            )
            
            cursor = connection.cursor()
            
            # Crear base de datos
            cursor.execute("""
                CREATE DATABASE IF NOT EXISTS `elearning_narino`
                CHARACTER SET utf8mb4
                COLLATE utf8mb4_unicode_ci
            """)
            
            print("✅ Base de datos 'elearning_narino' creada")
            
            # Verificar que se creó
            cursor.execute("SHOW DATABASES LIKE 'elearning_narino'")
            if cursor.fetchone():
                print("✅ Base de datos verificada")
                
                # Generar configuración para el archivo .env
                print("\n📝 Configuración para tu archivo .env:")
                print("-" * 40)
                password_part = f":{working_config['password']}" if working_config['password'] else ""
                print(f"DATABASE_URL=mysql+mysqlconnector://{working_config['user']}{password_part}@{working_config['host']}/elearning_narino")
                print("-" * 40)
            
            cursor.close()
            connection.close()
            
        except Error as e:
            print(f"❌ Error creando base de datos: {e}")
    
    else:
        print("\n❌ No se pudo encontrar una configuración válida")
        print("\n💡 Sugerencias:")
        print("1. Verifica que MySQL esté ejecutándose")
        print("2. Intenta conectarte manualmente con: mysql -u root -p")
        print("3. Si usas XAMPP/WAMP, la contraseña suele estar vacía")
        print("4. Si usas MySQL Installer, usa la contraseña que configuraste")

if __name__ == "__main__":
    main() 