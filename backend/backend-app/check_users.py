#!/usr/bin/env python3
"""
Script para verificar usuarios en la base de datos
"""

import os
os.environ['FLASK_ENV'] = 'production'

try:
    from src.main import app
    from src.models.user import User
    
    with app.app_context():
        # Contar usuarios
        user_count = User.query.count()
        print(f"👥 Total de usuarios en la base de datos: {user_count}")
        
        if user_count > 0:
            print("\n📋 Usuarios registrados:")
            users = User.query.all()
            for user in users:
                print(f"  - ID: {user.id}")
                print(f"    Nombre: {user.nombre} {user.apellido}")
                print(f"    Email: {user.email}")
                print(f"    Rol: {user.rol}")
                print(f"    Fecha: {user.fecha_registro}")
                print(f"    Activo: {user.activo}")
                print("    " + "-" * 40)
        else:
            print("📝 No hay usuarios registrados aún")
            print("   Prueba registrando un usuario desde http://localhost:5000")
            
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc() 