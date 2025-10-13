#!/usr/bin/env python3
"""
Script para inicializar datos de prueba en la base de datos
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend', 'backend-app'))

from src.main import app
from src.models import db, User, Curso
from werkzeug.security import generate_password_hash
from datetime import datetime

def init_test_data():
    """Inicializar datos de prueba"""
    
    with app.app_context():
        print("🔧 Inicializando datos de prueba...")
        
        # Crear usuarios de prueba
        users_data = [
            {
                'nombre': 'Admin',
                'apellido': 'Sistema',
                'email': 'admin@elearning.com',
                'password': 'admin123',
                'rol': 'admin',
                'estado_cuenta': 'activa',
                'tipo_documento': 'CC',
                'numero_documento': '12345678'
            },
            {
                'nombre': 'Diego',
                'apellido': 'Ayala',
                'email': 'diego.ayala@elearning.com',
                'password': 'instructor123',
                'rol': 'instructor',
                'estado_cuenta': 'activa',
                'tipo_documento': 'CC',
                'numero_documento': '87654321'
            },
            {
                'nombre': 'María',
                'apellido': 'García',
                'email': 'maria.garcia@elearning.com',
                'password': 'instructor123',
                'rol': 'instructor',
                'estado_cuenta': 'activa',
                'tipo_documento': 'CC',
                'numero_documento': '11223344'
            },
            {
                'nombre': 'Juan',
                'apellido': 'Pérez',
                'email': 'juan.perez@elearning.com',
                'password': 'estudiante123',
                'rol': 'estudiante',
                'estado_cuenta': 'activa',
                'tipo_documento': 'CC',
                'numero_documento': '55667788'
            }
        ]
        
        # Crear o actualizar usuarios
        created_users = []
        for user_data in users_data:
            existing_user = User.query.filter_by(email=user_data['email']).first()
            
            if existing_user:
                print(f"✅ Usuario existente: {user_data['email']}")
                created_users.append(existing_user)
            else:
                user = User(
                    nombre=user_data['nombre'],
                    apellido=user_data['apellido'],
                    email=user_data['email'],
                    password_hash=generate_password_hash(user_data['password']),
                    rol=user_data['rol'],
                    estado_cuenta=user_data['estado_cuenta'],
                    tipo_documento=user_data['tipo_documento'],
                    numero_documento=user_data['numero_documento']
                )
                db.session.add(user)
                print(f"✅ Usuario creado: {user_data['email']}")
                created_users.append(user)
        
        # Crear cursos de prueba
        cursos_data = [
            {
                'titulo': 'Introducción a React',
                'descripcion': 'Aprende los fundamentos de React desde cero',
                'estado': 'activo',
                'nivel': 'básico',
                'categoria': 'Desarrollo Web',
                'duracion_horas': 20,
                'max_estudiantes': 50
            },
            {
                'titulo': 'Desarrollo Web Avanzado',
                'descripcion': 'Técnicas avanzadas de desarrollo web moderno',
                'estado': 'activo',
                'nivel': 'intermedio',
                'categoria': 'Desarrollo Web',
                'duracion_horas': 30,
                'max_estudiantes': 40
            },
            {
                'titulo': 'Bases de Datos SQL',
                'descripcion': 'Fundamentos de bases de datos relacionales',
                'estado': 'activo',
                'nivel': 'básico',
                'categoria': 'Bases de Datos',
                'duracion_horas': 25,
                'max_estudiantes': 35
            },
            {
                'titulo': 'Python para Ciencia de Datos',
                'descripcion': 'Análisis de datos con Python y librerías populares',
                'estado': 'activo',
                'nivel': 'intermedio',
                'categoria': 'Ciencia de Datos',
                'duracion_horas': 35,
                'max_estudiantes': 30
            }
        ]
        
        # Crear o actualizar cursos
        created_cursos = []
        for curso_data in cursos_data:
            existing_curso = Curso.query.filter_by(titulo=curso_data['titulo']).first()
            
            if existing_curso:
                print(f"✅ Curso existente: {curso_data['titulo']}")
                created_cursos.append(existing_curso)
            else:
                curso = Curso(
                    titulo=curso_data['titulo'],
                    descripcion=curso_data['descripcion'],
                    estado=curso_data['estado'],
                    nivel=curso_data['nivel'],
                    categoria=curso_data['categoria'],
                    duracion_horas=curso_data['duracion_horas'],
                    max_estudiantes=curso_data['max_estudiantes'],
                    fecha_creacion=datetime.utcnow(),
                    fecha_actualizacion=datetime.utcnow()
                )
                db.session.add(curso)
                print(f"✅ Curso creado: {curso_data['titulo']}")
                created_cursos.append(curso)
        
        # Asignar instructores a cursos
        instructores = [u for u in created_users if u.rol == 'instructor']
        if instructores and created_cursos:
            # Asignar Diego Ayala a los primeros 2 cursos
            if len(instructores) > 0:
                created_cursos[0].instructor_id = instructores[0].id  # Diego Ayala
                created_cursos[1].instructor_id = instructores[0].id  # Diego Ayala
                print(f"✅ Asignado {instructores[0].nombre} {instructores[0].apellido} a 2 cursos")
            
            # Asignar María García a los otros 2 cursos
            if len(instructores) > 1:
                created_cursos[2].instructor_id = instructores[1].id  # María García
                created_cursos[3].instructor_id = instructores[1].id  # María García
                print(f"✅ Asignado {instructores[1].nombre} {instructores[1].apellido} a 2 cursos")
        
        # Guardar cambios
        try:
            db.session.commit()
            print("\n✅ Datos de prueba inicializados correctamente")
            
            # Mostrar resumen
            print(f"\n📊 Resumen:")
            print(f"   - Usuarios creados/actualizados: {len(created_users)}")
            print(f"   - Cursos creados/actualizados: {len(created_cursos)}")
            print(f"   - Instructores: {len(instructores)}")
            
            print(f"\n👥 Usuarios disponibles:")
            for user in created_users:
                print(f"   - {user.email} ({user.rol}) - {user.nombre} {user.apellido}")
            
            print(f"\n📚 Cursos disponibles:")
            for curso in created_cursos:
                instructor_name = "Sin asignar"
                if curso.instructor_id:
                    instructor = User.query.get(curso.instructor_id)
                    if instructor:
                        instructor_name = f"{instructor.nombre} {instructor.apellido}"
                print(f"   - {curso.titulo} (Instructor: {instructor_name})")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error guardando datos: {str(e)}")
            return False
        
        return True

if __name__ == "__main__":
    success = init_test_data()
    if success:
        print("\n🎉 ¡Datos de prueba inicializados exitosamente!")
        print("💡 Ahora puedes probar el login con las credenciales mostradas arriba")
    else:
        print("\n❌ Error inicializando datos de prueba")
        sys.exit(1) 