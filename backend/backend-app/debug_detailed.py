#!/usr/bin/env python3
"""
Script para debuggear el error 500 en el registro
"""

import os
import sys
import traceback

# Configurar entorno
os.environ['FLASK_ENV'] = 'production'
os.environ['DATABASE_URL'] = 'postgresql://elearning_user:password_seguro@localhost:5432/elearning_narino'

# Importar después de configurar el entorno
sys.path.insert(0, os.path.dirname(__file__))
from src.models.user import User, db
from src.config import config

def test_user_creation():
    """Probar la creación de un usuario directamente"""
    try:
        print("🧪 Probando creación de usuario directamente...")
        
        # Crear aplicación Flask
        from flask import Flask
        app = Flask(__name__)
        app.config.from_object(config['production'])
        
        db.init_app(app)
        
        with app.app_context():
            # Verificar conexión
            print("✅ Conexión a base de datos establecida")
            
            # Crear usuario de prueba
            user = User(
                nombre="Test",
                apellido="Usuario",
                email="test2@example.com",
                tipo_documento="cedula de ciudadania",
                numero_documento="1234567891",
                documento_pdf=None,
                documento_pdf_nombre=None,
                requisitos_pdf=None,
                requisitos_pdf_nombre=None
            )
            user.set_password("password123")
            
            print("✅ Usuario creado en memoria")
            
            # Agregar a la sesión
            db.session.add(user)
            print("✅ Usuario agregado a la sesión")
            
            # Commit
            db.session.commit()
            print("✅ Usuario guardado en la base de datos")
            
            # Verificar que se guardó
            saved_user = User.query.filter_by(email="test2@example.com").first()
            if saved_user:
                print(f"✅ Usuario encontrado en BD: {saved_user.nombre} {saved_user.apellido}")
            else:
                print("❌ Usuario no encontrado en BD")
            
            return True
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print("📋 Traceback completo:")
        traceback.print_exc()
        return False

def test_model_structure():
    """Verificar la estructura del modelo"""
    try:
        print("🔍 Verificando estructura del modelo User...")
        
        from flask import Flask
        app = Flask(__name__)
        app.config.from_object(config['production'])
        
        db.init_app(app)
        
        with app.app_context():
            # Verificar columnas
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            columns = inspector.get_columns('user')
            
            print(f"📋 Columnas en tabla 'user': {len(columns)}")
            for col in columns:
                print(f"  - {col['name']}: {col['type']} ({'NULL' if col['nullable'] else 'NOT NULL'})")
            
            return True
            
    except Exception as e:
        print(f"❌ Error verificando estructura: {e}")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🔍 DEBUG DETALLADO: Error 500 en Registro")
    print("=" * 60)
    
    # Verificar estructura
    test_model_structure()
    
    print("\n" + "=" * 60)
    
    # Probar creación
    test_user_creation() 