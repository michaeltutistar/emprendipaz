#!/usr/bin/env python3
"""
Script de debug para verificar la asignación de instructores
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def debug_instructor_assignment():
    """Debug de la asignación de instructores"""
    
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
        return
    print("✅ Login exitoso")
    
    # 2. Obtener instructores
    print("\n👨‍🏫 Obteniendo instructores...")
    response = session.get(f"{BASE_URL}/api/admin/instructors")
    instructors = response.json()
    print(f"✅ {len(instructors)} instructores encontrados")
    
    for instructor in instructors:
        print(f"   - {instructor['nombre']} (ID: {instructor['id']})")
    
    # 3. Obtener cursos ANTES de la asignación
    print("\n📚 Obteniendo cursos ANTES de la asignación...")
    response = session.get(f"{BASE_URL}/api/admin/courses")
    data = response.json()
    courses = data['courses']
    
    print("📋 Estado ANTES de la asignación:")
    for course in courses[:3]:
        print(f"   - {course['titulo']} (ID: {course['id']}): {course.get('instructor_nombre', 'Sin asignar')} (instructor_id: {course.get('instructor_id')})")
    
    # 4. Asignar instructor al primer curso
    course_id = courses[0]['id']
    course_title = courses[0]['titulo']
    instructor_id = instructors[0]['id']
    instructor_name = instructors[0]['nombre']
    
    print(f"\n🔗 Asignando instructor '{instructor_name}' (ID: {instructor_id}) al curso '{course_title}' (ID: {course_id})...")
    
    update_data = {
        "instructor_id": instructor_id
    }
    
    print(f"   Datos enviados: {update_data}")
    
    response = session.put(f"{BASE_URL}/api/admin/courses/{course_id}", json=update_data)
    print(f"   Status code: {response.status_code}")
    print(f"   Respuesta: {response.text}")
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Instructor asignado exitosamente")
        print(f"   Respuesta del servidor: {result}")
    else:
        print("❌ Error asignando instructor")
        return
    
    # 5. Obtener cursos DESPUÉS de la asignación
    print("\n📚 Obteniendo cursos DESPUÉS de la asignación...")
    response = session.get(f"{BASE_URL}/api/admin/courses")
    data = response.json()
    courses = data['courses']
    
    print("📋 Estado DESPUÉS de la asignación:")
    for course in courses[:3]:
        print(f"   - {course['titulo']} (ID: {course['id']}): {course.get('instructor_nombre', 'Sin asignar')} (instructor_id: {course.get('instructor_id')})")
    
    # 6. Obtener el curso específico para verificar
    print(f"\n🔍 Obteniendo curso específico (ID: {course_id})...")
    response = session.get(f"{BASE_URL}/api/admin/courses/{course_id}")
    if response.status_code == 200:
        course_detail = response.json()
        print(f"   Curso específico: {course_detail['titulo']}")
        print(f"   Instructor asignado: {course_detail.get('instructor_nombre', 'Sin asignar')}")
        print(f"   Instructor ID: {course_detail.get('instructor_id')}")
    else:
        print(f"❌ Error obteniendo curso específico: {response.status_code}")

if __name__ == "__main__":
    print("🐛 DEBUG: Asignación de instructores")
    print("=" * 50)
    debug_instructor_assignment()
    print("\n✅ Debug completado") 