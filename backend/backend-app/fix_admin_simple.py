#!/usr/bin/env python3
"""
Script simple para arreglar la contraseña del administrador
"""

import os
import sys

# Agregar el directorio actual al path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Configurar entorno
os.environ['FLASK_ENV'] = 'production'

try:
    from src.main import app
    from src.models.user import User, db
    from werkzeug.security import generate_password_hash
    
    def fix_admin_password():
        """Arreglar la contraseña del administrador"""
        with app.app_context():
            # Buscar el usuario administrador
            admin = User.query.filter_by(email='admin@elearning.com').first()
            
            if not admin:
                print("❌ No se encontró el usuario administrador")
                return False
            
            print(f"✅ Usuario administrador encontrado: {admin.nombre} {admin.apellido}")
            print(f"   Email: {admin.email}")
            print(f"   Rol: {admin.rol}")
            print(f"   Estado: {admin.estado_cuenta}")
            
            # Generar hash correcto para la contraseña admin123
            new_password_hash = generate_password_hash('admin123')
            
            # Actualizar la contraseña
            admin.password_hash = new_password_hash
            admin.estado_cuenta = 'activa'  # Asegurar que esté activa
            admin.rol = 'admin'  # Asegurar que tenga rol de admin
            
            db.session.commit()
            
            print("✅ Contraseña del administrador actualizada exitosamente")
            print("   Nueva contraseña: admin123")
            print("   Hash generado correctamente")
            
            return True
    
    def test_admin_login():
        """Probar el login del administrador"""
        with app.app_context():
            admin = User.query.filter_by(email='admin@elearning.com').first()
            
            if not admin:
                print("❌ No se encontró el usuario administrador")
                return False
            
            # Probar la contraseña
            if admin.check_password('admin123'):
                print("✅ La contraseña funciona correctamente")
                return True
            else:
                print("❌ La contraseña no funciona")
                return False
    
    def main():
        print("🔧 ARREGLANDO CONTRASEÑA DEL ADMINISTRADOR")
        print("=" * 50)
        
        # Arreglar contraseña
        if fix_admin_password():
            print("\n🧪 Probando login...")
            if test_admin_login():
                print("\n✅ ¡Todo listo!")
                print("\n🌐 Credenciales del administrador:")
                print("   Email: admin@elearning.com")
                print("   Password: admin123")
                print("   URL: http://localhost:5173/admin")
            else:
                print("\n❌ Error al probar la contraseña")
        else:
            print("\n❌ Error al arreglar la contraseña")
    
    if __name__ == "__main__":
        main()
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc() 