#!/usr/bin/env python3
"""
Script de prueba para verificar conexión a MySQL
"""

import os
import sys

# Configurar variables de entorno
os.environ['FLASK_ENV'] = 'production'
os.environ['DATABASE_URL'] = 'mysql+mysqlconnector://root@localhost/elearning_narino'

try:
    from src.main import app
    from src.models.user import db
    
    print("✅ Módulos importados correctamente")
    
    with app.app_context():
        print("✅ Contexto de aplicación creado")
        
        # Crear tablas
        db.create_all()
        print("✅ Tablas creadas correctamente")
        
        # Verificar conexión
        from sqlalchemy import text
        result = db.session.execute(text('SELECT 1')).fetchone()
        print(f"✅ Conexión a MySQL exitosa: {result}")
        
        # Verificar si la tabla user existe
        result = db.session.execute(text("SHOW TABLES LIKE 'user'")).fetchone()
        if result:
            print("✅ Tabla 'user' existe")
        else:
            print("❌ Tabla 'user' no existe")
            
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc() 