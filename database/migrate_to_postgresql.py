#!/usr/bin/env python3
"""
Script para migrar datos de MySQL a PostgreSQL
"""

import os
import sys
import mysql.connector
import psycopg2
from psycopg2.extras import RealDictCursor
import base64

# Configuración MySQL (origen)
MYSQL_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'elearning_narino'
}

# Configuración PostgreSQL (destino)
POSTGRES_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'elearning_narino',
    'user': 'elearning_user',
    'password': 'password_seguro'
}

def connect_mysql():
    """Conectar a MySQL"""
    try:
        connection = mysql.connector.connect(**MYSQL_CONFIG)
        print("✅ Conexión a MySQL establecida")
        return connection
    except Exception as e:
        print(f"❌ Error conectando a MySQL: {e}")
        return None

def connect_postgresql():
    """Conectar a PostgreSQL"""
    try:
        connection = psycopg2.connect(**POSTGRES_CONFIG)
        print("✅ Conexión a PostgreSQL establecida")
        return connection
    except Exception as e:
        print(f"❌ Error conectando a PostgreSQL: {e}")
        return None

def migrate_users(mysql_conn, postgres_conn):
    """Migrar usuarios de MySQL a PostgreSQL"""
    try:
        # Obtener usuarios de MySQL
        mysql_cursor = mysql_conn.cursor(dictionary=True)
        mysql_cursor.execute("SELECT * FROM user")
        users = mysql_cursor.fetchall()
        
        if not users:
            print("ℹ️ No hay usuarios para migrar")
            return
        
        print(f"📦 Migrando {len(users)} usuarios...")
        
        # Insertar en PostgreSQL
        postgres_cursor = postgres_conn.cursor()
        
        for user in users:
            # Preparar datos para PostgreSQL
            postgres_cursor.execute("""
                INSERT INTO "user" (
                    id, nombre, apellido, email, password_hash, 
                    tipo_documento, numero_documento, documento_pdf, 
                    documento_pdf_nombre, requisitos_pdf, requisitos_pdf_nombre,
                    rol, estado_cuenta, fecha_creacion, fecha_actualizacion
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                ) ON CONFLICT (id) DO NOTHING
            """, (
                user['id'], user['nombre'], user['apellido'], user['email'],
                user['password_hash'], user.get('tipo_documento'), 
                user.get('numero_documento'), user.get('documento_pdf'),
                user.get('documento_pdf_nombre'), user.get('requisitos_pdf'),
                user.get('requisitos_pdf_nombre'), user.get('rol', 'estudiante'), 
                user.get('estado_cuenta', 'inactiva'), user['fecha_creacion'], 
                user.get('fecha_actualizacion', user['fecha_creacion'])
            ))
        
        postgres_conn.commit()
        print(f"✅ {len(users)} usuarios migrados exitosamente")
        
    except Exception as e:
        print(f"❌ Error migrando usuarios: {e}")
        postgres_conn.rollback()

def migrate_courses(mysql_conn, postgres_conn):
    """Migrar cursos de MySQL a PostgreSQL"""
    try:
        # Obtener cursos de MySQL
        mysql_cursor = mysql_conn.cursor(dictionary=True)
        mysql_cursor.execute("SELECT * FROM curso")
        courses = mysql_cursor.fetchall()
        
        if not courses:
            print("ℹ️ No hay cursos para migrar")
            return
        
        print(f"📦 Migrando {len(courses)} cursos...")
        
        # Insertar en PostgreSQL
        postgres_cursor = postgres_conn.cursor()
        
        for course in courses:
            postgres_cursor.execute("""
                INSERT INTO curso (
                    id, titulo, descripcion, instructor_id, 
                    estado, fecha_creacion
                ) VALUES (
                    %s, %s, %s, %s, %s, %s
                ) ON CONFLICT (id) DO NOTHING
            """, (
                course['id'], course['titulo'], course.get('descripcion'),
                course.get('instructor_id'), course['estado'], 
                course['fecha_creacion']
            ))
        
        postgres_conn.commit()
        print(f"✅ {len(courses)} cursos migrados exitosamente")
        
    except Exception as e:
        print(f"❌ Error migrando cursos: {e}")
        postgres_conn.rollback()

def migrate_enrollments(mysql_conn, postgres_conn):
    """Migrar inscripciones de MySQL a PostgreSQL"""
    try:
        # Obtener inscripciones de MySQL
        mysql_cursor = mysql_conn.cursor(dictionary=True)
        mysql_cursor.execute("SHOW TABLES LIKE 'inscripcion'")
        table_exists = mysql_cursor.fetchone()
        
        if not table_exists:
            print("ℹ️ Tabla 'inscripcion' no existe en MySQL")
            return
        
        mysql_cursor.execute("SELECT * FROM inscripcion")
        enrollments = mysql_cursor.fetchall()
        
        if not enrollments:
            print("ℹ️ No hay inscripciones para migrar")
            return
        
        print(f"📦 Migrando {len(enrollments)} inscripciones...")
        
        # Insertar en PostgreSQL
        postgres_cursor = postgres_conn.cursor()
        
        for enrollment in enrollments:
            postgres_cursor.execute("""
                INSERT INTO inscripcion (
                    id, estudiante_id, curso_id, 
                    fecha_inscripcion, estado
                ) VALUES (
                    %s, %s, %s, %s, %s
                ) ON CONFLICT (id) DO NOTHING
            """, (
                enrollment['id'], enrollment['estudiante_id'],
                enrollment['curso_id'], enrollment['fecha_inscripcion'],
                enrollment.get('estado', 'activa')
            ))
        
        postgres_conn.commit()
        print(f"✅ {len(enrollments)} inscripciones migradas exitosamente")
        
    except Exception as e:
        print(f"❌ Error migrando inscripciones: {e}")
        postgres_conn.rollback()

def main():
    """Función principal de migración"""
    print("🚀 Iniciando migración de MySQL a PostgreSQL...")
    
    # Conectar a ambas bases de datos
    mysql_conn = connect_mysql()
    postgres_conn = connect_postgresql()
    
    if not mysql_conn or not postgres_conn:
        print("❌ No se pudo conectar a una o ambas bases de datos")
        return
    
    try:
        # Migrar datos
        migrate_users(mysql_conn, postgres_conn)
        migrate_courses(mysql_conn, postgres_conn)
        migrate_enrollments(mysql_conn, postgres_conn)
        
        print("🎉 Migración completada exitosamente!")
        
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
    
    finally:
        # Cerrar conexiones
        if mysql_conn:
            mysql_conn.close()
        if postgres_conn:
            postgres_conn.close()
        print("🔌 Conexiones cerradas")

if __name__ == "__main__":
    main() 