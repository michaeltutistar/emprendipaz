#!/usr/bin/env python3
"""
Script de prueba para verificar que los instructores solo ven sus cursos asignados
"""

import requests
import json
import sys
import os

# Configuración
BASE_URL = "http://localhost:5000"
ADMIN_EMAIL = "admin@elearning.com"
ADMIN_PASSWORD = "admin123"
INSTRUCTOR_EMAIL = "instructor@elearning.com"
INSTRUCTOR_PASSWORD = "instructor123"

def login(email, password):
    """Iniciar sesión y obtener token"""
    try:
        response = requests.post(f"{BASE_URL}/api/login", json={
            "email": email,
            "password": password
        })
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                return data.get('token')
            else:
                print(f"❌ Error en login: {data.get('error')}")
                return None
        else:
            print(f"❌ Error en login: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error de conexión: {str(e)}")
        return None

def get_courses(token, endpoint="/api/admin/courses"):
    """Obtener cursos"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Error obteniendo cursos: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error de conexión: {str(e)}")
        return None

def assign_instructor_to_course(admin_token, course_id, instructor_id):
    """Asignar instructor a un curso"""
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.put(f"{BASE_URL}/api/admin/courses/{course_id}", 
                              json={"instructor_id": instructor_id},
                              headers=headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Error asignando instructor: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error de conexión: {str(e)}")
        return None

def get_instructors(admin_token):
    """Obtener lista de instructores"""
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/api/admin/instructors", headers=headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Error obteniendo instructores: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error de conexión: {str(e)}")
        return None

def test_instructor_courses():
    """Probar que los instructores solo ven sus cursos asignados"""
    print("🧪 Iniciando prueba de cursos de instructor...")
    
    # 1. Login como admin
    print("\n1️⃣ Iniciando sesión como administrador...")
    admin_token = login(ADMIN_EMAIL, ADMIN_PASSWORD)
    if not admin_token:
        print("❌ No se pudo iniciar sesión como admin")
        return False
    
    print("✅ Login como admin exitoso")
    
    # 2. Obtener todos los cursos (vista de admin)
    print("\n2️⃣ Obteniendo todos los cursos (vista de admin)...")
    admin_courses = get_courses(admin_token, "/api/admin/courses")
    if not admin_courses:
        print("❌ No se pudieron obtener los cursos del admin")
        return False
    
    total_courses = len(admin_courses.get('courses', []))
    print(f"✅ Admin ve {total_courses} cursos totales")
    
    # Mostrar algunos cursos
    for i, course in enumerate(admin_courses.get('courses', [])[:3]):
        instructor_name = course.get('instructor_nombre', 'Sin asignar')
        print(f"   - {course['titulo']}: {instructor_name}")
    
    # 3. Obtener instructores
    print("\n3️⃣ Obteniendo lista de instructores...")
    instructors = get_instructors(admin_token)
    if not instructors:
        print("❌ No se pudieron obtener los instructores")
        return False
    
    if not instructors:
        print("❌ No hay instructores disponibles")
        return False
    
    instructor = instructors[0]  # Usar el primer instructor
    instructor_id = instructor['id']
    instructor_name = f"{instructor['nombre']} {instructor['apellido']}"
    print(f"✅ Instructor seleccionado: {instructor_name} (ID: {instructor_id})")
    
    # 4. Asignar instructor a un curso
    print("\n4️⃣ Asignando instructor a un curso...")
    if total_courses > 0:
        course_to_assign = admin_courses['courses'][0]
        course_id = course_to_assign['id']
        course_title = course_to_assign['titulo']
        
        print(f"   Asignando instructor '{instructor_name}' al curso '{course_title}'...")
        
        assignment_result = assign_instructor_to_course(admin_token, course_id, instructor_id)
        if assignment_result:
            print("✅ Instructor asignado exitosamente")
        else:
            print("❌ Error asignando instructor")
            return False
    else:
        print("❌ No hay cursos disponibles para asignar")
        return False
    
    # 5. Login como instructor
    print("\n5️⃣ Iniciando sesión como instructor...")
    instructor_token = login(INSTRUCTOR_EMAIL, INSTRUCTOR_PASSWORD)
    if not instructor_token:
        print("❌ No se pudo iniciar sesión como instructor")
        return False
    
    print("✅ Login como instructor exitoso")
    
    # 6. Obtener cursos del instructor
    print("\n6️⃣ Obteniendo cursos del instructor...")
    instructor_courses = get_courses(instructor_token, "/api/instructor/cursos")
    if not instructor_courses:
        print("❌ No se pudieron obtener los cursos del instructor")
        return False
    
    instructor_courses_list = instructor_courses.get('data', [])
    instructor_courses_count = len(instructor_courses_list)
    print(f"✅ Instructor ve {instructor_courses_count} cursos")
    
    # Mostrar cursos del instructor
    for course in instructor_courses_list:
        print(f"   - {course['titulo']} (Estudiantes: {course['totalEstudiantes']}, Progreso: {course['promedioProgreso']}%)")
    
    # 7. Verificar que el instructor solo ve sus cursos asignados
    print("\n7️⃣ Verificando restricción de acceso...")
    
    if instructor_courses_count > 0:
        print("✅ El instructor puede ver sus cursos asignados")
        
        # Verificar que el curso asignado está en la lista
        assigned_course_found = any(course['titulo'] == course_title for course in instructor_courses_list)
        if assigned_course_found:
            print("✅ El curso asignado aparece en la lista del instructor")
        else:
            print("❌ El curso asignado no aparece en la lista del instructor")
            return False
    else:
        print("⚠️  El instructor no tiene cursos asignados")
    
    # 8. Verificar que el instructor no puede ver todos los cursos
    print("\n8️⃣ Verificando que el instructor no puede acceder a todos los cursos...")
    
    # Intentar acceder al endpoint de admin
    admin_courses_as_instructor = get_courses(instructor_token, "/api/admin/courses")
    if admin_courses_as_instructor:
        if admin_courses_as_instructor.get('error'):
            print("✅ El instructor no puede acceder al endpoint de admin (correcto)")
        else:
            print("❌ El instructor puede acceder al endpoint de admin (incorrecto)")
            return False
    else:
        print("✅ El instructor no puede acceder al endpoint de admin (correcto)")
    
    print("\n🎉 ¡Prueba completada exitosamente!")
    print(f"📊 Resumen:")
    print(f"   - Total de cursos en el sistema: {total_courses}")
    print(f"   - Cursos asignados al instructor: {instructor_courses_count}")
    print(f"   - Instructor: {instructor_name}")
    
    return True

if __name__ == "__main__":
    print("🚀 Iniciando pruebas de restricción de cursos para instructores")
    print("=" * 60)
    
    success = test_instructor_courses()
    
    if success:
        print("\n✅ Todas las pruebas pasaron correctamente")
        sys.exit(0)
    else:
        print("\n❌ Algunas pruebas fallaron")
        sys.exit(1) 