#!/usr/bin/env python3
"""
Script para inicializar el esquema de RDS
Este script se conecta a RDS y crea todas las tablas necesarias
"""
import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from flask import Flask
from src.models import db
from src.config import ProductionConfig

def initialize_rds():
    """Inicializar el esquema de RDS"""
    print("🚀 Iniciando configuración de RDS...")
    
    # Crear app Flask temporal
    app = Flask(__name__)
    
    # Usar configuración de producción (RDS)
    app.config.from_object(ProductionConfig)
    
    print(f"🔗 Conectando a: {app.config['SQLALCHEMY_DATABASE_URI'][:50]}...")
    
    # Inicializar base de datos
    db.init_app(app)
    
    with app.app_context():
        try:
            print("📋 Creando todas las tablas...")
            
            # Eliminar todas las tablas existentes (si las hay)
            print("🗑️  Eliminando tablas existentes...")
            db.drop_all()
            
            # Crear todas las tablas
            print("🔨 Creando nuevas tablas...")
            db.create_all()
            
            # Verificar que las tablas se crearon
            inspector = db.inspect(db.engine)
            tables = inspector.get_table_names()
            
            print(f"✅ ¡Esquema creado exitosamente!")
            print(f"📊 Tablas creadas ({len(tables)}):")
            for table in sorted(tables):
                print(f"   - {table}")
                
            # Crear usuario administrador inicial
            print("👤 Creando usuario administrador inicial...")
            from src.models.user import User
            
            # Verificar si ya existe un admin
            admin_exists = User.query.filter_by(email='admin@elearning.com').first()
            if not admin_exists:
                admin_user = User(
                    nombre='Administrador',
                    apellidos='Sistema',
                    email='admin@elearning.com',
                    telefono='0000000000',
                    municipio='Pasto',
                    tipo_documento='CC',
                    numero_documento='00000000',
                    fecha_nacimiento='1990-01-01',
                    genero='Otro',
                    rol='admin',
                    estado='activo'
                )
                admin_user.set_password('admin123')
                db.session.add(admin_user)
                db.session.commit()
                print("✅ Usuario administrador creado: admin@elearning.com / admin123")
            else:
                print("ℹ️  Usuario administrador ya existe")
                
            print("\n🎉 ¡RDS inicializado exitosamente!")
            return True
            
        except Exception as e:
            print(f"❌ Error al inicializar RDS: {e}")
            import traceback
            traceback.print_exc()
            return False

if __name__ == "__main__":
    success = initialize_rds()
    if success:
        print("\n✅ Proceso completado exitosamente")
        sys.exit(0)
    else:
        print("\n❌ Proceso falló")
        sys.exit(1)
