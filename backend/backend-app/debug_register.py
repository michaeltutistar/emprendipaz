#!/usr/bin/env python3
"""
Script para debuggear el endpoint de registro
"""

import requests
import json
import base64

def test_register():
    """Probar el endpoint de registro"""
    
    # Datos de prueba
    test_data = {
        "nombre": "Test",
        "apellido": "Usuario",
        "email": "test3@example.com",
        "password": "password123",
        "confirm_password": "password123",
        "tipo_documento": "cedula de ciudadania",
        "numero_documento": "1234567892",
        "documento_pdf": "",
        "documento_pdf_nombre": "",
        "requisitos_pdf": "",
        "requisitos_pdf_nombre": ""
    }
    
    try:
        print("🧪 Probando endpoint de registro...")
        print(f"📤 Enviando datos: {json.dumps(test_data, indent=2)}")
        
        # Hacer la petición
        response = requests.post(
            "http://localhost:5000/api/register",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📥 Status Code: {response.status_code}")
        print(f"📥 Headers: {dict(response.headers)}")
        
        if response.status_code == 201:
            print("✅ Registro exitoso!")
            print(f"📄 Response: {response.json()}")
        else:
            print("❌ Error en el registro")
            print(f"📄 Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")

def test_backend_health():
    """Probar que el backend esté funcionando"""
    try:
        response = requests.get("http://localhost:5000/")
        print(f"🏥 Backend Health Check: {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Backend no responde: {e}")
        return False

if __name__ == "__main__":
    print("🔍 DEBUG: Endpoint de Registro")
    print("=" * 50)
    
    # Verificar que el backend esté funcionando
    if test_backend_health():
        test_register()
    else:
        print("❌ Backend no está disponible") 