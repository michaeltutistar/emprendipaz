#!/usr/bin/env python3
"""
Script de migración de datos de SQLite a MySQL
Plataforma E-Learning - Gobernación de Nariño
"""

import os
import sys
import sqlite3
import mysql.connector
from datetime import datetime

def connect_sqlite():
    """Conectar a la base de datos SQLite"""
    sqlite_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'backend-app', 'src', 'database', 'app.db')
    
    if not os.path.exists(sqlite_path):
        print(f"❌ No se encontró la base de datos SQLite en: {sqlite_path}")
        return None
    
    try:
        conn = sqlite3.connect(sqlite_path)
        print("✅ Conexión a SQLite establecida")
        return conn
    except Exception as e:
        print(f"❌ Error conectando a SQLite: {e}")
        return None

def connect_mysql():
    """Conectar a la base de datos MySQL"""
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='elearning_user',
            password='password_seguro',
            database='elearning_narino',
            charset='utf8mb4',
            collation='utf8mb4_unicode_ci'
        )
        print("✅ Conexión a MySQL establecida")
        return conn
    except Exception as e:
        print(f"❌ Error conectando a MySQL: {e}")
        return None

def migrate_users(sqlite_conn, mysql_conn):
    """Migrar usuarios de SQLite a MySQL"""
    try:
        # Obtener usuarios de SQLite
        sqlite_cursor = sqlite_conn.cursor()
        sqlite_cursor.execute("SELECT id, nombre, apellido, email, password_hash, fecha_registro, activo FROM user")
        users = sqlite_cursor.fetchall()
        
        if not users:
            print("ℹ️ No hay usuarios para migrar")
            return
        
        print(f"📊 Encontrados {len(users)} usuarios para migrar")
        
        # Insertar usuarios en MySQL
        mysql_cursor = mysql_conn.cursor()
        
        for user in users:
            try:
                mysql_cursor.execute("""
                    INSERT INTO user (id, nombre, apellido, email, password_hash, fecha_registro, activo)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                    nombre = VALUES(nombre),
                    apellido = VALUES(apellido),
                    email = VALUES(email),
                    password_hash = VALUES(password_hash),
                    fecha_registro = VALUES(fecha_registro),
                    activo = VALUES(activo)
                """, user)
                
                print(f"✅ Usuario migrado: {user[3]} ({user[1]} {user[2]})")
                
            except Exception as e:
                print(f"❌ Error migrando usuario {user[3]}: {e}")
        
        mysql_conn.commit()
        print(f"🎉 Migración completada: {len(users)} usuarios migrados")
        
    except Exception as e:
        print(f"❌ Error en la migración: {e}")
        mysql_conn.rollback()

def verify_migration(mysql_conn):
    """Verificar que la migración fue exitosa"""
    try:
        cursor = mysql_conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM user")
        count = cursor.fetchone()[0]
        print(f"📊 Total de usuarios en MySQL: {count}")
        
        cursor.execute("SELECT nombre, apellido, email, fecha_registro FROM user LIMIT 5")
        users = cursor.fetchall()
        
        print("\n📋 Primeros 5 usuarios en MySQL:")
        for user in users:
            print(f"  - {user[0]} {user[1]} ({user[2]}) - {user[3]}")
            
    except Exception as e:
        print(f"❌ Error verificando migración: {e}")

def main():
    """Función principal"""
    print("🚀 Iniciando migración de SQLite a MySQL")
    print("=" * 50)
    
    # Conectar a SQLite
    sqlite_conn = connect_sqlite()
    if not sqlite_conn:
        return
    
    # Conectar a MySQL
    mysql_conn = connect_mysql()
    if not mysql_conn:
        sqlite_conn.close()
        return
    
    try:
        # Migrar usuarios
        migrate_users(sqlite_conn, mysql_conn)
        
        # Verificar migración
        print("\n" + "=" * 50)
        verify_migration(mysql_conn)
        
    finally:
        # Cerrar conexiones
        sqlite_conn.close()
        mysql_conn.close()
        print("\n🔒 Conexiones cerradas")

if __name__ == "__main__":
    main() 