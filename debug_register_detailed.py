#!/usr/bin/env python3
"""
Script detallado para debuggear el endpoint de registro
"""

import requests
import json
import time
import sys

def test_register_with_detailed_logging():
    print("🔍 Debug detallado del endpoint de registro")
    print("=" * 60)
    
    # URL del endpoint
    url = "http://127.0.0.1:5000/api/register"
    
    # Generar datos únicos
    timestamp = int(time.time())
    unique_email = f"test{timestamp}@example.com"
    unique_doc = f"123{timestamp}"
    
    # Datos de prueba que coinciden exactamente con lo que espera el backend
    test_data = {
        "nombre": "Usuario",
        "apellido": "Prueba",
        "email": unique_email,
        "password": "password123",
        "confirm_password": "password123",
        "tipo_documento": "cedula de ciudadania",
        "numero_documento": unique_doc,
        "documento_pdf": "",  # Base64 vacío
        "documento_pdf_nombre": "",
        "requisitos_pdf": "",  # Base64 vacío
        "requisitos_pdf_nombre": ""
    }
    
    print(f"📤 Enviando solicitud a: {url}")
    print(f"📋 Datos enviados:")
    for key, value in test_data.items():
        if key in ['documento_pdf', 'requisitos_pdf']:
            print(f"   {key}: [Base64 data - length: {len(value)}]")
        else:
            print(f"   {key}: {value}")
    
    try:
        # Realizar la solicitud
        response = requests.post(url, json=test_data, timeout=15)
        
        print(f"\n📥 Respuesta recibida:")
        print(f"   Status Code: {response.status_code}")
        print(f"   Content-Type: {response.headers.get('Content-Type', 'No especificado')}")
        print(f"   Content-Length: {response.headers.get('Content-Length', 'No especificado')}")
        
        # Intentar parsear la respuesta
        try:
            response_json = response.json()
            print(f"   JSON Response:")
            print(json.dumps(response_json, indent=4, ensure_ascii=False))
        except json.JSONDecodeError:
            print(f"   Text Response (no JSON):")
            print(f"   {response.text}")
        except Exception as e:
            print(f"   Error al parsear respuesta: {str(e)}")
            print(f"   Raw response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Error de conexión: No se pudo conectar al backend")
        print("   Verifica que el backend esté corriendo en http://127.0.0.1:5000")
    except requests.exceptions.Timeout:
        print("❌ Error de timeout: La solicitud tardó demasiado")
    except Exception as e:
        print(f"❌ Error inesperado: {str(e)}")
        print(f"   Tipo de error: {type(e).__name__}")
    
    print("=" * 60)

if __name__ == "__main__":
    test_register_with_detailed_logging() 