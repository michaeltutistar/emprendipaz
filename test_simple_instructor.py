#!/usr/bin/env python3
"""
Script simple para probar la asignación de instructores
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_simple():
    """Prueba simple de asignación de instructores"""
    
    session = requests.Session()
    
    # 1. Login
    print("🔐 Login...")
    login_data = {
        "email": "admin@elearning.com",
        "password": "admin123"
    }
    
    response = session.post(f"{BASE_URL}/api/login", json=login_data)
    if response.status_code != 200:
        print(f"❌ Error en login: {response.status_code}")
        print(f"   Respuesta: {response.text}")
        return
    print("✅ Login exitoso")
    
    # 2. Obtener instructores
    print("\n👨‍🏫 Obteniendo instructores...")
    response = session.get(f"{BASE_URL}/api/admin/instructors")
    if response.status_code != 200:
        print(f"❌ Error obteniendo instructores: {response.status_code}")
        return
    
    instructors = response.json()
    print(f"✅ {len(instructors)} instructores encontrados")
    
    if len(instructors) == 0:
        print("❌ No hay instructores disponibles")
        return
    
    instructor_id = instructors[0]['id']
    instructor_name = instructors[0]['nombre']
    print(f"   Usando instructor: {instructor_name} (ID: {instructor_id})")
    
    # 3. Obtener cursos
    print("\n📚 Obteniendo cursos...")
    response = session.get(f"{BASE_URL}/api/admin/courses")
    if response.status_code != 200:
        print(f"❌ Error obteniendo cursos: {response.status_code}")
        print(f"   Respuesta: {response.text}")
        return
    
    data = response.json()
    courses = data['courses']
    print(f"✅ {len(courses)} cursos encontrados")
    
    if len(courses) == 0:
        print("❌ No hay cursos disponibles")
        return
    
    # Mostrar estado actual
    print("\n📋 Estado actual de instructores:")
    for course in courses[:3]:
        instructor_name = course.get('instructor_nombre', 'Sin asignar')
        print(f"   - {course['titulo']}: {instructor_name}")
    
    # 4. Asignar instructor al primer curso
    course_id = courses[0]['id']
    course_title = courses[0]['titulo']
    
    print(f"\n🔗 Asignando instructor '{instructor_name}' al curso '{course_title}'...")
    
    update_data = {
        "instructor_id": instructor_id
    }
    
    response = session.put(f"{BASE_URL}/api/admin/courses/{course_id}", json=update_data)
    if response.status_code != 200:
        print(f"❌ Error asignando instructor: {response.status_code}")
        print(f"   Respuesta: {response.text}")
        return
    
    result = response.json()
    print("✅ Instructor asignado exitosamente")
    print(f"   Respuesta: {result['message']}")
    
    # 5. Verificar asignación
    print("\n🔍 Verificando asignación...")
    response = session.get(f"{BASE_URL}/api/admin/courses")
    if response.status_code == 200:
        data = response.json()
        courses = data['courses']
        
        # Buscar el curso actualizado
        for course in courses:
            if course['id'] == course_id:
                instructor_name_updated = course.get('instructor_nombre', 'Sin asignar')
                print(f"   Curso: {course['titulo']}")
                print(f"   Instructor: {instructor_name_updated}")
                
                if instructor_name_updated == instructor_name:
                    print("✅ ¡La asignación funcionó correctamente!")
                else:
                    print("❌ La asignación no funcionó")
                break
    else:
        print(f"❌ Error verificando: {response.status_code}")

if __name__ == "__main__":
    print("🧪 Prueba simple de asignación de instructores")
    print("=" * 50)
    test_simple()
    print("\n✅ Prueba completada") 