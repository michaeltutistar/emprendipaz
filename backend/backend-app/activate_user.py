#!/usr/bin/env python3
"""
Script para activar cuentas de usuarios
"""

import os
import sys

# Configurar entorno
os.environ['FLASK_ENV'] = 'production'

try:
    from src.main import app
    from src.models.user import User, db
    
    def list_inactive_users():
        """Listar usuarios inactivos"""
        with app.app_context():
            inactive_users = User.query.filter_by(estado_cuenta='inactiva').all()
            
            if not inactive_users:
                print("✅ No hay usuarios inactivos")
                return []
            
            print(f"📋 Usuarios inactivos ({len(inactive_users)}):")
            print("=" * 60)
            
            for i, user in enumerate(inactive_users, 1):
                print(f"{i}. ID: {user.id}")
                print(f"   Nombre: {user.nombre} {user.apellido}")
                print(f"   Email: {user.email}")
                print(f"   Documento: {user.tipo_documento} - {user.numero_documento}")
                print(f"   Fecha registro: {user.fecha_creacion.strftime('%Y-%m-%d %H:%M:%S')}")
                print("-" * 40)
            
            return inactive_users
    
    def activate_user_by_id(user_id):
        """Activar usuario por ID"""
        with app.app_context():
            user = User.query.get(user_id)
            
            if not user:
                print(f"❌ No se encontró usuario con ID {user_id}")
                return False
            
            if user.estado_cuenta == 'activa':
                print(f"ℹ️ El usuario {user.email} ya está activo")
                return True
            
            user.estado_cuenta = 'activa'
            db.session.commit()
            
            print(f"✅ Usuario {user.email} activado exitosamente")
            return True
    
    def activate_user_by_email(email):
        """Activar usuario por email"""
        with app.app_context():
            user = User.query.filter_by(email=email).first()
            
            if not user:
                print(f"❌ No se encontró usuario con email {email}")
                return False
            
            if user.estado_cuenta == 'activa':
                print(f"ℹ️ El usuario {user.email} ya está activo")
                return True
            
            user.estado_cuenta = 'activa'
            db.session.commit()
            
            print(f"✅ Usuario {user.email} activado exitosamente")
            return True
    
    def activate_all_inactive_users():
        """Activar todos los usuarios inactivos"""
        with app.app_context():
            inactive_users = User.query.filter_by(estado_cuenta='inactiva').all()
            
            if not inactive_users:
                print("✅ No hay usuarios inactivos para activar")
                return 0
            
            count = 0
            for user in inactive_users:
                user.estado_cuenta = 'activa'
                count += 1
            
            db.session.commit()
            print(f"✅ {count} usuarios activados exitosamente")
            return count
    
    def main():
        """Función principal"""
        print("🔐 Gestor de Activación de Cuentas")
        print("=" * 40)
        
        if len(sys.argv) < 2:
            print("Uso:")
            print("  python activate_user.py list                    # Listar usuarios inactivos")
            print("  python activate_user.py activate-all            # Activar todos los usuarios inactivos")
            print("  python activate_user.py activate-id <ID>        # Activar usuario por ID")
            print("  python activate_user.py activate-email <EMAIL>  # Activar usuario por email")
            return
        
        command = sys.argv[1]
        
        if command == "list":
            list_inactive_users()
        
        elif command == "activate-all":
            confirm = input("¿Estás seguro de activar TODOS los usuarios inactivos? (s/N): ")
            if confirm.lower() in ['s', 'si', 'sí', 'y', 'yes']:
                activate_all_inactive_users()
            else:
                print("❌ Operación cancelada")
        
        elif command == "activate-id":
            if len(sys.argv) < 3:
                print("❌ Debes especificar el ID del usuario")
                return
            try:
                user_id = int(sys.argv[2])
                activate_user_by_id(user_id)
            except ValueError:
                print("❌ El ID debe ser un número")
        
        elif command == "activate-email":
            if len(sys.argv) < 3:
                print("❌ Debes especificar el email del usuario")
                return
            email = sys.argv[2]
            activate_user_by_email(email)
        
        else:
            print(f"❌ Comando '{command}' no reconocido")
    
    if __name__ == "__main__":
        main()
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc() 