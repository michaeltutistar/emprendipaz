#!/usr/bin/env python3
"""
Script para probar el dashboard administrativo manteniendo la sesión
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_admin_with_session():
    """Probar endpoints administrativos manteniendo la sesión"""
    print("🧪 PRUEBAS DEL DASHBOARD ADMINISTRATIVO CON SESIÓN")
    print("=" * 60)
    
    # Crear sesión para mantener cookies
    session = requests.Session()
    
    # 1. Login del administrador
    print("🔐 Probando login del administrador...")
    
    login_data = {
        "email": "admin@elearning.com",
        "password": "admin123"
    }
    
    try:
        response = session.post(f"{BASE_URL}/api/login", json=login_data)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login exitoso")
            print(f"   Usuario: {data['user']['nombre']} {data['user']['apellido']}")
            print(f"   Rol: {data['user']['rol']}")
        else:
            print(f"❌ Error en login: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False
    
    # 2. Probar endpoint de métricas
    print("\n📊 Probando endpoint de métricas...")
    
    try:
        response = session.get(f"{BASE_URL}/api/admin/dashboard/metrics")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Métricas obtenidas exitosamente")
            print(f"   Total usuarios: {data['usuarios']['total']}")
            print(f"   Usuarios activos: {data['usuarios']['activos']}")
            print(f"   Cursos activos: {data['cursos']['activos']}")
            print(f"   Inscripciones: {data['inscripciones']['total']}")
        else:
            print(f"❌ Error obteniendo métricas: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
    
    # 3. Probar endpoint de usuarios
    print("\n👥 Probando endpoint de usuarios...")
    
    try:
        response = session.get(f"{BASE_URL}/api/admin/users")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Usuarios obtenidos exitosamente")
            print(f"   Total usuarios en respuesta: {len(data['users'])}")
            print(f"   Página actual: {data['pagination']['page']}")
            print(f"   Total páginas: {data['pagination']['pages']}")
        else:
            print(f"❌ Error obteniendo usuarios: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
    
    # 4. Probar endpoint de logs
    print("\n📋 Probando endpoint de logs...")
    
    try:
        response = session.get(f"{BASE_URL}/api/admin/logs")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Logs obtenidos exitosamente")
            print(f"   Total logs en respuesta: {len(data['logs'])}")
            print(f"   Página actual: {data['pagination']['page']}")
            print(f"   Total páginas: {data['pagination']['pages']}")
        else:
            print(f"❌ Error obteniendo logs: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
    
    # 5. Probar endpoint de profile
    print("\n👤 Probando endpoint de profile...")
    
    try:
        response = session.get(f"{BASE_URL}/api/profile")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Profile obtenido exitosamente")
            print(f"   Usuario: {data['nombre']} {data['apellido']}")
            print(f"   Email: {data['email']}")
            print(f"   Rol: {data['rol']}")
        else:
            print(f"❌ Error obteniendo profile: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
    
    print("\n" + "=" * 60)
    print("✅ Pruebas completadas")
    print("\n🌐 Para acceder al dashboard:")
    print("   1. Asegúrate de que el frontend esté ejecutándose en http://localhost:5173")
    print("   2. Ve a http://localhost:5173/admin")
    print("   3. Usa las credenciales: admin@elearning.com / admin123")

if __name__ == "__main__":
    test_admin_with_session() 