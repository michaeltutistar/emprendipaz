#!/usr/bin/env python3
"""
Script para verificar los logs del backend
"""

import requests
import json
import time

def check_backend_health():
    print("🔍 Verificando estado del backend...")
    print("=" * 50)
    
    # Probar endpoint de salud
    try:
        response = requests.get("http://127.0.0.1:5000/", timeout=5)
        print(f"✅ Backend responde: Status {response.status_code}")
    except Exception as e:
        print(f"❌ Backend no responde: {str(e)}")
        return
    
    # Probar endpoint de registro con datos mínimos
    print("\n🧪 Probando registro con datos mínimos...")
    
    test_data = {
        "nombre": "Test",
        "apellido": "User",
        "email": f"test{int(time.time())}@example.com",  # Email único
        "password": "test123",
        "confirm_password": "test123",
        "tipo_documento": "cedula de ciudadania",
        "numero_documento": f"123{int(time.time())}",  # Número único
        "documentoPdf": "",
        "requisitosPdf": ""
    }
    
    try:
        response = requests.post("http://127.0.0.1:5000/api/register", 
                               json=test_data, 
                               timeout=10)
        
        print(f"📥 Respuesta del registro:")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 500:
            print("❌ Error 500 - Revisando respuesta...")
            try:
                error_data = response.json()
                print(f"   Error: {json.dumps(error_data, indent=2)}")
            except:
                print(f"   Error text: {response.text}")
        elif response.status_code == 201:
            print("✅ Registro exitoso")
            try:
                success_data = response.json()
                print(f"   Respuesta: {json.dumps(success_data, indent=2)}")
            except:
                print(f"   Respuesta: {response.text}")
        else:
            print(f"⚠️ Status inesperado: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            
    except Exception as e:
        print(f"❌ Error al probar registro: {str(e)}")

if __name__ == "__main__":
    check_backend_health() 