#!/usr/bin/env python3
"""
Script para probar la conexión a PostgreSQL
"""

import os
import sys
import psycopg

# Configuración de PostgreSQL (RDS)
POSTGRES_CONFIG = {
    'host': 'elearning-db.cwn4cmackagl.us-east-1.rds.amazonaws.com',
    'port': 5432,
    'database': 'elearning_narino',
    'user': 'elearning_user',
    'password': 'Elearning2024!'
}

def test_connection():
    """Probar conexión a PostgreSQL"""
    try:
        print("🔌 Probando conexión a PostgreSQL...")
        conn_string = f"postgresql://{POSTGRES_CONFIG['user']}:{POSTGRES_CONFIG['password']}@{POSTGRES_CONFIG['host']}:{POSTGRES_CONFIG['port']}/{POSTGRES_CONFIG['database']}"
        connection = psycopg.connect(conn_string)
        print("✅ Conexión exitosa a PostgreSQL!")
        
        # Probar consulta simple
        cursor = connection.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"📊 Versión de PostgreSQL: {version[0]}")
        
        # Verificar tablas
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        
        print(f"📋 Tablas encontradas ({len(tables)}):")
        for table in tables:
            print(f"   - {table[0]}")
        
        # Verificar tabla user específicamente
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'user'
            ORDER BY ordinal_position;
        """)
        columns = cursor.fetchall()
        
        print(f"\n📝 Estructura de la tabla 'user':")
        for column in columns:
            print(f"   - {column[0]}: {column[1]} ({'NULL' if column[2] == 'YES' else 'NOT NULL'})")
        
        # Contar usuarios
        cursor.execute("SELECT COUNT(*) FROM \"user\";")
        user_count = cursor.fetchone()[0]
        print(f"\n👥 Usuarios en la base de datos: {user_count}")
        
        cursor.close()
        connection.close()
        print("🔌 Conexión cerrada")
        
        return True
        
    except Exception as e:
        print(f"❌ Error conectando a PostgreSQL: {e}")
        return False

def test_flask_integration():
    """Probar integración con Flask"""
    try:
        print("\n🐍 Probando integración con Flask...")
        
        # Simular configuración de Flask
        os.environ['FLASK_ENV'] = 'production'
        
        # Importar después de configurar el entorno
        sys.path.insert(0, os.path.dirname(__file__))
        from src.config import config
        from src.models.user import db
        
        # Verificar configuración
        app_config = config['production']
        print(f"✅ Configuración cargada: {app_config.SQLALCHEMY_DATABASE_URI}")
        
        # Probar creación de tablas
        from flask import Flask
        app = Flask(__name__)
        app.config.from_object(app_config)
        
        db.init_app(app)
        
        with app.app_context():
            # Crear tablas si no existen
            db.create_all()
            print("✅ Tablas creadas/verificadas correctamente")
            
            # Probar consulta
            from sqlalchemy import text
            result = db.session.execute(text('SELECT COUNT(*) FROM "user"'))
            count = result.scalar()
            print(f"✅ Consulta SQL ejecutada: {count} usuarios")
        
        return True
        
    except Exception as e:
        print(f"❌ Error en integración con Flask: {e}")
        return False

def main():
    """Función principal de pruebas"""
    print("🧪 Iniciando pruebas de PostgreSQL...")
    print("=" * 50)
    
    # Prueba 1: Conexión directa
    connection_ok = test_connection()
    
    # Prueba 2: Integración con Flask
    flask_ok = test_flask_integration()
    
    print("\n" + "=" * 50)
    print("📊 RESUMEN DE PRUEBAS:")
    print(f"   Conexión directa: {'✅ OK' if connection_ok else '❌ FALLÓ'}")
    print(f"   Integración Flask: {'✅ OK' if flask_ok else '❌ FALLÓ'}")
    
    if connection_ok and flask_ok:
        print("\n🎉 ¡Todas las pruebas pasaron! PostgreSQL está configurado correctamente.")
    else:
        print("\n⚠️ Algunas pruebas fallaron. Revisa la configuración.")
    
    return connection_ok and flask_ok

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 