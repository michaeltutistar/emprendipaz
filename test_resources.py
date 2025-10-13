#!/usr/bin/env python3
"""
Script de prueba para la funcionalidad de Gestión de Recursos
"""

import requests
import json
import os
from datetime import datetime

# Configuración
BASE_URL = "http://localhost:5000"
ADMIN_EMAIL = "admin@elearning.com"
ADMIN_PASSWORD = "admin123"

def login_admin():
    """Iniciar sesión como administrador"""
    print("🔐 Iniciando sesión como administrador...")
    
    login_data = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    response = requests.post(f"{BASE_URL}/api/login", json=login_data)
    
    if response.status_code == 200:
        print("✅ Login exitoso")
        return response.cookies
    else:
        print(f"❌ Error en login: {response.status_code}")
        print(response.text)
        return None

def test_get_resources(cookies):
    """Probar obtener lista de recursos"""
    print("\n📋 Probando obtener lista de recursos...")
    
    response = requests.get(f"{BASE_URL}/api/resources/resources", cookies=cookies)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Recursos obtenidos: {len(data.get('resources', []))}")
        print(f"   Total: {data.get('pagination', {}).get('total', 0)}")
        
        # Mostrar algunos recursos
        resources = data.get('resources', [])
        for i, resource in enumerate(resources[:3]):
            print(f"   {i+1}. {resource.get('titulo')} ({resource.get('tipo')}) - {resource.get('tamano_formateado')}")
        
        return data
    else:
        print(f"❌ Error obteniendo recursos: {response.status_code}")
        print(response.text)
        return None

def test_get_resource_stats(cookies):
    """Probar obtener estadísticas de recursos"""
    print("\n📊 Probando obtener estadísticas de recursos...")
    
    response = requests.get(f"{BASE_URL}/api/resources/resources/stats", cookies=cookies)
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Estadísticas obtenidas:")
        print(f"   Total recursos: {data.get('total_recursos', 0)}")
        print(f"   Tamaño total: {data.get('tamano_total_formateado', 'N/A')}")
        print(f"   Recursos por tipo: {data.get('recursos_por_tipo', {})}")
        print(f"   Recursos por categoría: {data.get('recursos_por_categoria', {})}")
        return data
    else:
        print(f"❌ Error obteniendo estadísticas: {response.status_code}")
        print(response.text)
        return None

def test_get_categories(cookies):
    """Probar obtener categorías disponibles"""
    print("\n🏷️ Probando obtener categorías...")
    
    response = requests.get(f"{BASE_URL}/api/resources/resources/categories", cookies=cookies)
    
    if response.status_code == 200:
        categories = response.json()
        print(f"✅ Categorías obtenidas: {categories}")
        return categories
    else:
        print(f"❌ Error obteniendo categorías: {response.status_code}")
        print(response.text)
        return None

def test_get_types(cookies):
    """Probar obtener tipos disponibles"""
    print("\n📁 Probando obtener tipos de archivo...")
    
    response = requests.get(f"{BASE_URL}/api/resources/resources/types", cookies=cookies)
    
    if response.status_code == 200:
        types = response.json()
        print(f"✅ Tipos obtenidos: {types}")
        return types
    else:
        print(f"❌ Error obteniendo tipos: {response.status_code}")
        print(response.text)
        return None

def test_get_courses(cookies):
    """Probar obtener cursos para asociar recursos"""
    print("\n📚 Probando obtener cursos...")
    
    response = requests.get(f"{BASE_URL}/api/admin/courses", cookies=cookies)
    
    if response.status_code == 200:
        data = response.json()
        courses = data.get('courses', [])
        print(f"✅ Cursos obtenidos: {len(courses)}")
        
        for i, course in enumerate(courses[:3]):
            print(f"   {i+1}. {course.get('titulo')} (ID: {course.get('id')})")
        
        return courses
    else:
        print(f"❌ Error obteniendo cursos: {response.status_code}")
        print(response.text)
        return None

def test_create_mock_resource(cookies):
    """Probar crear un recurso simulado (sin archivo real)"""
    print("\n📤 Probando crear recurso simulado...")
    
    # Crear un archivo de prueba temporal
    test_filename = "test_document.txt"
    test_content = "Este es un documento de prueba para el sistema de recursos."
    
    with open(test_filename, 'w', encoding='utf-8') as f:
        f.write(test_content)
    
    try:
        # Preparar datos del formulario
        form_data = {
            'titulo': 'Documento de Prueba',
            'descripcion': 'Este es un documento de prueba para verificar la funcionalidad de recursos',
            'categoria': 'tutorial',
            'curso_id': '',
            'acceso_publico': 'true',
            'requiere_autenticacion': 'false'
        }
        
        # Preparar archivo
        files = {
            'file': (test_filename, open(test_filename, 'rb'), 'text/plain')
        }
        
        response = requests.post(
            f"{BASE_URL}/api/resources/resources",
            data=form_data,
            files=files,
            cookies=cookies
        )
        
        if response.status_code == 201:
            data = response.json()
            print("✅ Recurso creado exitosamente:")
            print(f"   ID: {data.get('resource', {}).get('id')}")
            print(f"   Título: {data.get('resource', {}).get('titulo')}")
            print(f"   Tipo: {data.get('resource', {}).get('tipo')}")
            print(f"   Tamaño: {data.get('resource', {}).get('tamano_formateado')}")
            return data.get('resource', {}).get('id')
        else:
            print(f"❌ Error creando recurso: {response.status_code}")
            print(response.text)
            return None
            
    finally:
        # Limpiar archivo temporal
        if os.path.exists(test_filename):
            os.remove(test_filename)

def test_update_resource(cookies, resource_id):
    """Probar actualizar un recurso"""
    print(f"\n✏️ Probando actualizar recurso ID: {resource_id}...")
    
    update_data = {
        'titulo': 'Documento de Prueba - Actualizado',
        'descripcion': 'Descripción actualizada del documento de prueba',
        'categoria': 'academico',
        'estado': 'activo',
        'acceso_publico': True,
        'requiere_autenticacion': False
    }
    
    response = requests.put(
        f"{BASE_URL}/api/resources/resources/{resource_id}",
        json=update_data,
        cookies=cookies
    )
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Recurso actualizado exitosamente:")
        print(f"   Nuevo título: {data.get('resource', {}).get('titulo')}")
        print(f"   Nueva categoría: {data.get('resource', {}).get('categoria')}")
        return True
    else:
        print(f"❌ Error actualizando recurso: {response.status_code}")
        print(response.text)
        return False

def test_get_specific_resource(cookies, resource_id):
    """Probar obtener un recurso específico"""
    print(f"\n👁️ Probando obtener recurso específico ID: {resource_id}...")
    
    response = requests.get(f"{BASE_URL}/api/resources/resources/{resource_id}", cookies=cookies)
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Recurso obtenido:")
        print(f"   Título: {data.get('titulo')}")
        print(f"   Tipo: {data.get('tipo')}")
        print(f"   Tamaño: {data.get('tamano_formateado')}")
        print(f"   URL S3: {data.get('s3_url')}")
        print(f"   Subido por: {data.get('subido_por_nombre')}")
        return data
    else:
        print(f"❌ Error obteniendo recurso: {response.status_code}")
        print(response.text)
        return None

def test_delete_resource(cookies, resource_id):
    """Probar eliminar un recurso"""
    print(f"\n🗑️ Probando eliminar recurso ID: {resource_id}...")
    
    response = requests.delete(f"{BASE_URL}/api/resources/resources/{resource_id}", cookies=cookies)
    
    if response.status_code == 200:
        print("✅ Recurso eliminado exitosamente")
        return True
    else:
        print(f"❌ Error eliminando recurso: {response.status_code}")
        print(response.text)
        return False

def test_filters(cookies):
    """Probar filtros de recursos"""
    print("\n🔍 Probando filtros de recursos...")
    
    # Probar filtro por tipo
    print("   Probando filtro por tipo 'pdf'...")
    response = requests.get(
        f"{BASE_URL}/api/resources/resources?tipo=pdf",
        cookies=cookies
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Recursos PDF encontrados: {len(data.get('resources', []))}")
    else:
        print(f"   ❌ Error con filtro por tipo: {response.status_code}")
    
    # Probar filtro por categoría
    print("   Probando filtro por categoría 'tutorial'...")
    response = requests.get(
        f"{BASE_URL}/api/resources/resources?categoria=tutorial",
        cookies=cookies
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Recursos tutorial encontrados: {len(data.get('resources', []))}")
    else:
        print(f"   ❌ Error con filtro por categoría: {response.status_code}")
    
    # Probar búsqueda
    print("   Probando búsqueda por 'manual'...")
    response = requests.get(
        f"{BASE_URL}/api/resources/resources?search=manual",
        cookies=cookies
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Resultados de búsqueda: {len(data.get('resources', []))}")
    else:
        print(f"   ❌ Error con búsqueda: {response.status_code}")

def main():
    """Función principal de pruebas"""
    print("🧪 INICIANDO PRUEBAS DE GESTIÓN DE RECURSOS")
    print("=" * 50)
    
    # Iniciar sesión
    cookies = login_admin()
    if not cookies:
        print("❌ No se pudo iniciar sesión. Abortando pruebas.")
        return
    
    try:
        # Ejecutar pruebas
        test_get_resources(cookies)
        test_get_resource_stats(cookies)
        test_get_categories(cookies)
        test_get_types(cookies)
        test_get_courses(cookies)
        test_filters(cookies)
        
        # Probar CRUD completo
        resource_id = test_create_mock_resource(cookies)
        if resource_id:
            test_get_specific_resource(cookies, resource_id)
            test_update_resource(cookies, resource_id)
            test_delete_resource(cookies, resource_id)
        
        print("\n✅ TODAS LAS PRUEBAS COMPLETADAS")
        print("=" * 50)
        
    except Exception as e:
        print(f"\n❌ Error durante las pruebas: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 