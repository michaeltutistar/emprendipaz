#!/usr/bin/env python3
"""
Script para crear la tabla de notificaciones en la base de datos
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.models import db, Notificacion
from src.config import config
from flask import Flask

def create_notifications_table():
    """Crear la tabla de notificaciones"""
    try:
        # Determinar el entorno
        env = os.getenv('FLASK_ENV', 'development').strip()
        if env not in config:
            print(f"❌ Entorno '{env}' no válido. Usando 'development'")
            env = 'development'
        
        app_config = config[env]
        
        # Crear aplicación Flask
        app = Flask(__name__)
        app.config.from_object(app_config)
        
        # Inicializar base de datos
        db.init_app(app)
        
        with app.app_context():
            # Crear la tabla
            db.create_all()
            print("✅ Tabla de notificaciones creada exitosamente")
            
            # Verificar que la tabla existe
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            
            if 'notificacion' in tables:
                print("✅ Tabla 'notificacion' verificada en la base de datos")
            else:
                print("❌ Error: Tabla 'notificacion' no encontrada")
                return False
                
        return True
        
    except Exception as e:
        print(f"❌ Error al crear tabla de notificaciones: {str(e)}")
        return False

if __name__ == '__main__':
    print("🚀 Creando tabla de notificaciones...")
    success = create_notifications_table()
    
    if success:
        print("🎉 ¡Tabla de notificaciones creada exitosamente!")
    else:
        print("💥 Error al crear tabla de notificaciones")
        sys.exit(1)
