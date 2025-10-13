#!/usr/bin/env python3
"""
Script para verificar que el registro de usuarios funciona
"""

import os
import requests
import json

def test_registration():
    """Probar el registro de usuarios"""
    print("🧪 Probando registro de usuarios...")
    print("=" * 50)
    
    # URL del backend
    base_url = "http://localhost:5000"
    
    # Datos de prueba
    test_user = {
        "nombre": "Usuario",
        "apellido": "Prueba",
        "email": "usuario.prueba@example.com",
        "tipo_documento": "cedula_ciudadania",
        "numero_documento": "1234567890",
        "password": "password123",
        "confirm_password": "password123"
    }
    
    try:
        # Probar registro
        print(f"📝 Registrando usuario: {test_user['email']}")
        response = requests.post(
            f"{base_url}/api/register",
            json=test_user,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📄 Response: {response.text}")
        
        if response.status_code == 201:
            print("✅ Usuario registrado exitosamente")
            
            # Probar login
            print("\n🔐 Probando login...")
            login_data = {
                "email": test_user["email"],
                "password": test_user["password"]
            }
            
            login_response = requests.post(
                f"{base_url}/api/login",
                json=login_data,
                headers={'Content-Type': 'application/json'}
            )
            
            print(f"📊 Login Status: {login_response.status_code}")
            print(f"📄 Login Response: {login_response.text}")
            
            if login_response.status_code == 200:
                print("✅ Login exitoso")
            else:
                print("❌ Error en login")
                
        else:
            print("❌ Error en registro")
            
    except requests.exceptions.ConnectionError:
        print("❌ No se puede conectar al backend")
        print("   Asegúrate de que el backend esté ejecutándose en http://localhost:5000")
    except Exception as e:
        print(f"❌ Error: {e}")

def check_database():
    """Verificar la base de datos"""
    print("\n📊 Verificando base de datos...")
    print("=" * 50)
    
    try:
        from src.main import app
        from src.models.user import db, User
        
        with app.app_context():
            # Contar usuarios
            user_count = User.query.count()
            print(f"👥 Total de usuarios en la base de datos: {user_count}")
            
            # Mostrar últimos 5 usuarios
            recent_users = User.query.order_by(User.fecha_registro.desc()).limit(5).all()
            print("\n📋 Últimos usuarios registrados:")
            for user in recent_users:
                print(f"  - {user.nombre} {user.apellido} ({user.email}) - {user.fecha_registro}")
                
    except Exception as e:
        print(f"❌ Error verificando base de datos: {e}")

if __name__ == "__main__":
    test_registration()
    check_database() 