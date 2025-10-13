#!/usr/bin/env python3
"""
Script para actualizar la tabla de usuarios con nuevos campos del perfil
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend', 'backend-app'))

from src.main import app
from src.models import db
from sqlalchemy import text

def update_user_table():
    """Actualizar la tabla de usuarios con nuevos campos"""
    
    with app.app_context():
        print("🔧 Actualizando tabla de usuarios...")
        
        try:
            # Agregar nuevos campos a la tabla de usuarios
            with db.engine.connect() as conn:
                conn.execute(text("""
                    ALTER TABLE "user" 
                    ADD COLUMN IF NOT EXISTS telefono VARCHAR(20)
                """))
                conn.execute(text("""
                    ALTER TABLE "user" 
                    ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE
                """))
                conn.execute(text("""
                    ALTER TABLE "user" 
                    ADD COLUMN IF NOT EXISTS pais VARCHAR(100)
                """))
                conn.execute(text("""
                    ALTER TABLE "user" 
                    ADD COLUMN IF NOT EXISTS ciudad VARCHAR(100)
                """))
                conn.execute(text("""
                    ALTER TABLE "user" 
                    ADD COLUMN IF NOT EXISTS bio TEXT
                """))
                conn.commit()
            
            print("✅ Campos agregados exitosamente a la tabla de usuarios")
            
            # Actualizar algunos usuarios de prueba con datos de ejemplo
            with db.engine.connect() as conn:
                conn.execute(text("""
                    UPDATE "user" 
                    SET telefono = '+57 300 123 4567',
                        pais = 'Colombia',
                        ciudad = 'Pasto',
                        bio = 'Estudiante apasionado por el aprendizaje en línea'
                    WHERE email = 'juan.perez@elearning.com'
                """))
                conn.commit()
            
            print("✅ Datos de ejemplo agregados al usuario de prueba")
            
        except Exception as e:
            print(f"❌ Error al actualizar la tabla: {str(e)}")
            return False
        
        return True

if __name__ == '__main__':
    if update_user_table():
        print("🎉 Actualización completada exitosamente")
    else:
        print("💥 Error en la actualización") 