from flask import Blueprint, jsonify, request, session
from flask_cors import cross_origin
from datetime import datetime, timedelta
from sqlalchemy import func, and_, select
from src.models import db, User, Curso, Modulo, Leccion, Recurso, Inscripcion, LogActividad
import logging

logger = logging.getLogger(__name__)
student_bp = Blueprint('student', __name__)

# Endpoint de prueba para diagnosticar problemas
@student_bp.route('/test', methods=['GET'])
@cross_origin()
def test_student_endpoint():
    """Endpoint de prueba para diagnosticar problemas"""
    try:
        # Verificar sesión
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa',
                'session_data': dict(session)
            }), 401
        
        # Verificar que el usuario existe
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'success': False,
                'error': 'Usuario no encontrado',
                'user_id': user_id
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Endpoint funcionando correctamente',
            'user_id': user_id,
            'user_rol': user.rol,
            'user_email': user.email
        })
        
    except Exception as e:
        logger.error(f"Error in test endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error interno: {str(e)}'
        }), 500

# Dashboard del estudiante
@student_bp.route('/dashboard', methods=['GET'])
@cross_origin()
def get_student_dashboard():
    """Obtener estadísticas del dashboard del estudiante"""
    try:
        # Verificar sesión
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es estudiante
        user = User.query.get(user_id)
        if not user or user.rol != 'estudiante':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de estudiante'
            }), 403
        
        # Obtener inscripciones del estudiante
        inscripciones = Inscripcion.query.filter_by(estudiante_id=user.id).all()
        
        # Calcular estadísticas
        cursos_activos = sum(1 for ins in inscripciones if ins.estado == 'en_progreso')
        cursos_completados = sum(1 for ins in inscripciones if ins.estado == 'completado')
        
        # Calcular progreso general
        total_progreso = 0
        if inscripciones:
            total_progreso = sum(ins.progreso for ins in inscripciones) / len(inscripciones)
        
        # Obtener próximas fechas límite (simulado)
        proximas_fechas = [
            {
                'titulo': 'Entrega de Proyecto Final',
                'curso': 'Introducción a React',
                'fechaLimite': (datetime.now() + timedelta(days=7)).isoformat()
            },
            {
                'titulo': 'Examen del Módulo 3',
                'curso': 'JavaScript Avanzado',
                'fechaLimite': (datetime.now() + timedelta(days=3)).isoformat()
            }
        ]
        
        # Obtener actividad reciente (simplificado para evitar errores)
        try:
            actividad_reciente = LogActividad.query.filter_by(usuario_id=user.id)\
                .order_by(LogActividad.fecha.desc())\
                .limit(5).all()
            
            actividad_formateada = [
                {
                    'id': act.id,
                    'tipo': act.accion,  # Cambiado de 'tipo' a 'accion'
                    'descripcion': act.detalles,  # Cambiado de 'descripcion' a 'detalles'
                    'fecha': act.fecha.isoformat() if act.fecha else None
                }
                for act in actividad_reciente
            ]
        except Exception as e:
            logger.error(f"Error getting activity log: {str(e)}")
            actividad_formateada = []
        
        return jsonify({
            'success': True,
            'data': {
                'cursosActivos': cursos_activos,
                'cursosCompletados': cursos_completados,
                'progresoGeneral': round(total_progreso, 1),
                'proximasFechas': proximas_fechas,
                'actividadReciente': actividad_formateada
            }
        })
        
    except Exception as e:
        logger.error(f"Error getting student dashboard: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener estadísticas del dashboard'
        }), 500

# Cursos del estudiante
@student_bp.route('/cursos', methods=['GET'])
@cross_origin()
def get_student_courses():
    """Obtener cursos del estudiante"""
    try:
        # Verificar sesión
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es estudiante
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'success': False,
                'error': 'Usuario no encontrado'
            }), 404
            
        if user.rol != 'estudiante':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de estudiante'
            }), 403
        
        # Obtener inscripciones del estudiante con información del curso
        inscripciones = db.session.query(Inscripcion, Curso)\
            .join(Curso, Inscripcion.curso_id == Curso.id)\
            .filter(Inscripcion.estudiante_id == user.id)\
            .all()
        
        cursos_data = []
        for inscripcion, curso in inscripciones:
            # Obtener información del instructor
            instructor = User.query.get(curso.instructor_id)
            
            cursos_data.append({
                'id': curso.id,
                'titulo': curso.titulo,
                'descripcion': curso.descripcion,
                'categoria': curso.categoria,
                'nivel': curso.nivel,
                'estado': inscripcion.estado,
                'progreso': 0,
                'fechaInscripcion': inscripcion.fecha_inscripcion.isoformat() if inscripcion.fecha_inscripcion else None,
                'ultimaActividad': None,
                'fechaCompletado': None,
                'calificacion': None,
                'instructor': instructor.nombre if instructor else 'N/A'
            })
        
        return jsonify({
            'success': True,
            'data': cursos_data
        })
        
    except Exception as e:
        logger.error(f"Error getting student courses: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error al obtener cursos del estudiante: {str(e)}'
        }), 500

# Cursos disponibles para inscripción
@student_bp.route('/cursos/disponibles', methods=['GET'])
@cross_origin()
def get_available_courses():
    """Obtener cursos disponibles para inscripción"""
    try:
        # Verificar sesión
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es estudiante
        user = User.query.get(user_id)
        if not user:
            return jsonify({
                'success': False,
                'error': 'Usuario no encontrado'
            }), 404
            
        if user.rol != 'estudiante':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de estudiante'
            }), 403
        
        # Obtener cursos activos que el estudiante no está inscrito y que coinciden con su convocatoria
        cursos_inscritos = select(Inscripcion.curso_id).where(Inscripcion.estudiante_id == user.id)
        
        cursos_disponibles = Curso.query\
            .filter(and_(
                Curso.estado == 'activo',
                ~Curso.id.in_(cursos_inscritos),
                Curso.convocatoria == user.convocatoria
            ))\
            .all()
        
        cursos_data = []
        for curso in cursos_disponibles:
            # Obtener información del instructor
            instructor = User.query.get(curso.instructor_id)
            
            # Contar estudiantes inscritos
            total_estudiantes = Inscripcion.query.filter_by(curso_id=curso.id).count()
            
            cursos_data.append({
                'id': curso.id,
                'titulo': curso.titulo,
                'descripcion': curso.descripcion,
                'categoria': curso.categoria,
                'nivel': curso.nivel,
                'duracion_horas': curso.duracion_horas,
                'max_estudiantes': curso.max_estudiantes,
                'estado': curso.estado,
                'instructor': instructor.nombre if instructor else 'N/A',
                'totalEstudiantes': total_estudiantes,
                'fechaCreacion': curso.fecha_creacion.isoformat(),
                'convocatoria': curso.convocatoria
            })
        
        return jsonify({
            'success': True,
            'data': cursos_data
        })
        
    except Exception as e:
        logger.error(f"Error getting available courses: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error al obtener cursos disponibles: {str(e)}'
        }), 500

# Inscribirse a un curso
@student_bp.route('/inscribirse', methods=['POST'])
@cross_origin()
def enroll_course():
    """Inscribirse a un curso"""
    try:
        # Verificar sesión
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es estudiante
        user = User.query.get(user_id)
        if not user or user.rol != 'estudiante':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de estudiante'
            }), 403
        
        data = request.json
        curso_id = data.get('curso_id')
        
        if not curso_id:
            return jsonify({
                'success': False,
                'error': 'ID del curso es requerido'
            }), 400
        
        # Verificar que el curso existe y está activo
        curso = Curso.query.filter_by(id=curso_id, estado='activo').first()
        if not curso:
            return jsonify({
                'success': False,
                'error': 'Curso no encontrado o no disponible'
            }), 404
        
        # Verificar que no esté ya inscrito
        inscripcion_existente = Inscripcion.query.filter_by(
            estudiante_id=user.id,
            curso_id=curso_id
        ).first()
        
        if inscripcion_existente:
            return jsonify({
                'success': False,
                'error': 'Ya estás inscrito en este curso'
            }), 400
        
        # Crear nueva inscripción
        nueva_inscripcion = Inscripcion(
            estudiante_id=user.id,
            curso_id=curso_id,
            estado='en_progreso',
            fecha_inscripcion=datetime.utcnow()
        )
        
        db.session.add(nueva_inscripcion)
        db.session.commit()
        
        # Registrar actividad (no debe afectar la inscripción si falla)
        try:
            log_actividad = LogActividad(
                usuario_id=user.id,
                accion='inscripcion_curso',
                detalles=f'Se inscribió al curso: {curso.titulo}',
                fecha=datetime.utcnow()
            )
            db.session.add(log_actividad)
            db.session.commit()
        except Exception:
            db.session.rollback()
        
        return jsonify({
            'success': True,
            'message': 'Inscripción exitosa',
            'data': {
                'inscripcion_id': nueva_inscripcion.id,
                'curso_id': curso_id,
                'estado': 'en_progreso'
            }
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error enrolling in course: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al inscribirse al curso'
        }), 500

# Detalles de un curso específico
@student_bp.route('/curso/<int:curso_id>', methods=['GET'])
@cross_origin()
def get_course_detail(curso_id):
    """Obtener detalles de un curso específico del estudiante"""
    try:
        # Verificar sesión
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es estudiante
        user = User.query.get(user_id)
        if not user or user.rol != 'estudiante':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de estudiante'
            }), 403
        
        # Verificar que el estudiante está inscrito en el curso
        inscripcion = Inscripcion.query.filter_by(
            estudiante_id=user.id,
            curso_id=curso_id
        ).first()
        
        if not inscripcion:
            return jsonify({
                'success': False,
                'error': 'No estás inscrito en este curso'
            }), 404
        
        # Obtener información del curso
        curso = Curso.query.get(curso_id)
        if not curso:
            return jsonify({
                'success': False,
                'error': 'Curso no encontrado'
            }), 404
        
        # Obtener información del instructor
        instructor = User.query.get(curso.instructor_id)
        
        curso_data = {
            'id': curso.id,
            'titulo': curso.titulo,
            'descripcion': curso.descripcion,
            'categoria': curso.categoria,
            'nivel': curso.nivel,
            'duracion_horas': curso.duracion_horas,
            'max_estudiantes': curso.max_estudiantes,
            'estado': curso.estado,
            'instructor': instructor.nombre if instructor else 'N/A',
            'fecha_creacion': curso.fecha_creacion.isoformat(),
            'inscripcion': {
                'estado': inscripcion.estado,
                'progreso': inscripcion.progreso,
                'fecha_inscripcion': inscripcion.fecha_inscripcion.isoformat(),
                'ultima_actividad': inscripcion.ultima_actividad.isoformat() if inscripcion.ultima_actividad else None,
                'fecha_completado': inscripcion.fecha_completado.isoformat() if inscripcion.fecha_completado else None,
                'calificacion': inscripcion.calificacion
            }
        }
        
        return jsonify({
            'success': True,
            'data': curso_data
        })
        
    except Exception as e:
        logger.error(f"Error getting course detail: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener detalles del curso'
        }), 500

# Módulos de un curso
@student_bp.route('/curso/<int:curso_id>/modulos', methods=['GET'])
@cross_origin()
def get_course_modules(curso_id):
    """Obtener módulos de un curso"""
    try:
        # Verificar sesión
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es estudiante
        user = User.query.get(user_id)
        if not user or user.rol != 'estudiante':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de estudiante'
            }), 403
        
        # Verificar que el estudiante está inscrito en el curso
        inscripcion = Inscripcion.query.filter_by(
            estudiante_id=user.id,
            curso_id=curso_id
        ).first()
        
        if not inscripcion:
            return jsonify({
                'success': False,
                'error': 'No estás inscrito en este curso'
            }), 404
        
        # Obtener módulos del curso
        modulos = Modulo.query.filter_by(curso_id=curso_id).order_by(Modulo.orden).all()
        
        modulos_data = []
        for modulo in modulos:
            # Obtener lecciones del módulo
            lecciones = Leccion.query.filter_by(modulo_id=modulo.id).order_by(Leccion.orden).all()
            
            lecciones_data = []
            for leccion in lecciones:
                lecciones_data.append({
                    'id': leccion.id,
                    'titulo': leccion.titulo,
                    'descripcion': leccion.descripcion,
                    'tipo': leccion.tipo,
                    'url': leccion.url,
                    'duracion': leccion.duracion,
                    'orden': leccion.orden,
                    'thumbnail': leccion.thumbnail,
                    'tamanio': leccion.tamanio,
                    'contenido': leccion.contenido
                })
            
            modulos_data.append({
                'id': modulo.id,
                'titulo': modulo.titulo,
                'descripcion': modulo.descripcion,
                'orden': modulo.orden,
                'lecciones': lecciones_data
            })
        
        return jsonify({
            'success': True,
            'data': modulos_data
        })
        
    except Exception as e:
        logger.error(f"Error getting course modules: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener módulos del curso'
        }), 500

# Progreso del estudiante en un curso
@student_bp.route('/curso/<int:curso_id>/progreso', methods=['GET'])
@cross_origin()
def get_course_progress(curso_id):
    """Obtener progreso del estudiante en un curso"""
    try:
        # Verificar sesión
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es estudiante
        user = User.query.get(user_id)
        if not user or user.rol != 'estudiante':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de estudiante'
            }), 403
        
        # Verificar que el estudiante está inscrito en el curso
        inscripcion = Inscripcion.query.filter_by(
            estudiante_id=user.id,
            curso_id=curso_id
        ).first()
        
        if not inscripcion:
            return jsonify({
                'success': False,
                'error': 'No estás inscrito en este curso'
            }), 404
        
        # Obtener lecciones completadas (simulado)
        lecciones_completadas = [1, 3, 5]  # IDs de lecciones completadas
        
        progreso_data = {
            'progreso_general': inscripcion.progreso,
            'lecciones_completadas': lecciones_completadas,
            'total_lecciones': 10,  # Total de lecciones en el curso
            'modulos_completados': inscripcion.modulos_completados,
            'ultima_actividad': inscripcion.ultima_actividad.isoformat() if inscripcion.ultima_actividad else None
        }
        
        return jsonify({
            'success': True,
            'data': progreso_data
        })
        
    except Exception as e:
        logger.error(f"Error getting course progress: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener progreso del curso'
        }), 500

# Marcar lección como completada
@student_bp.route('/leccion/<int:leccion_id>/completar', methods=['POST'])
@cross_origin()
def complete_lesson(leccion_id):
    """Marcar una lección como completada"""
    try:
        # Verificar sesión
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es estudiante
        user = User.query.get(user_id)
        if not user or user.rol != 'estudiante':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de estudiante'
            }), 403
        
        # Obtener la lección
        leccion = Leccion.query.get(leccion_id)
        if not leccion:
            return jsonify({
                'success': False,
                'error': 'Lección no encontrada'
            }), 404
        
        # Verificar que el estudiante está inscrito en el curso
        inscripcion = Inscripcion.query.filter_by(
            estudiante_id=user.id,
            curso_id=leccion.modulo.curso_id
        ).first()
        
        if not inscripcion:
            return jsonify({
                'success': False,
                'error': 'No estás inscrito en este curso'
            }), 404
        
        # Actualizar progreso (simulado)
        inscripcion.ultima_actividad = datetime.utcnow()
        
        # Registrar actividad
        log_actividad = LogActividad(
            usuario_id=user.id,
            accion='leccion_completada',
            detalles=f'Completó la lección: {leccion.titulo}',
            fecha=datetime.utcnow()
        )
        try:
            db.session.add(log_actividad)
            db.session.commit()
        except Exception:
            db.session.rollback()
        
        return jsonify({
            'success': True,
            'message': 'Lección marcada como completada'
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error completing lesson: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al marcar lección como completada'
        }), 500

# Perfil del estudiante
@student_bp.route('/perfil', methods=['GET'])
@cross_origin()
def get_student_profile():
    """Obtener perfil del estudiante"""
    try:
        # Verificar sesión
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es estudiante
        user = User.query.get(user_id)
        if not user or user.rol != 'estudiante':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de estudiante'
            }), 403
        
        perfil_data = {
            'nombre': f"{user.nombre} {user.apellido}",
            'email': user.email,
            'telefono': user.telefono,
            'fechaNacimiento': user.fecha_nacimiento.isoformat() if user.fecha_nacimiento else None,
            'pais': user.pais,
            'ciudad': user.ciudad,
            'bio': user.bio
        }
        
        return jsonify({
            'success': True,
            'data': perfil_data
        })
        
    except Exception as e:
        logger.error(f"Error getting student profile: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener perfil del estudiante'
        }), 500

# Actualizar perfil del estudiante
@student_bp.route('/perfil', methods=['PUT'])
@cross_origin()
def update_student_profile():
    """Actualizar perfil del estudiante"""
    try:
        # Verificar sesión
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es estudiante
        user = User.query.get(user_id)
        if not user or user.rol != 'estudiante':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de estudiante'
            }), 403
        
        data = request.json
        
        # Actualizar campos del usuario
        if 'nombre' in data:
            user.nombre = data['nombre']
        if 'telefono' in data:
            user.telefono = data['telefono']
        if 'fechaNacimiento' in data and data['fechaNacimiento']:
            user.fecha_nacimiento = datetime.fromisoformat(data['fechaNacimiento'])
        if 'pais' in data:
            user.pais = data['pais']
        if 'ciudad' in data:
            user.ciudad = data['ciudad']
        if 'bio' in data:
            user.bio = data['bio']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Perfil actualizado exitosamente'
        })
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating student profile: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al actualizar perfil del estudiante'
        }), 500

# Configuración del estudiante
@student_bp.route('/configuracion', methods=['GET'])
@cross_origin()
def get_student_config():
    """Obtener configuración del estudiante"""
    try:
        # Verificar sesión
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es estudiante
        user = User.query.get(user_id)
        if not user or user.rol != 'estudiante':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de estudiante'
            }), 403
        
        # Configuración por defecto (en un sistema real, esto vendría de una tabla de configuración)
        config_data = {
            'notificacionesEmail': True,
            'notificacionesPush': True,
            'idioma': 'es',
            'tema': 'claro',
            'privacidad': 'publico'
        }
        
        return jsonify({
            'success': True,
            'data': config_data
        })
        
    except Exception as e:
        logger.error(f"Error getting student config: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener configuración del estudiante'
        }), 500

# Actualizar configuración del estudiante
@student_bp.route('/configuracion', methods=['PUT'])
@cross_origin()
def update_student_config():
    """Actualizar configuración del estudiante"""
    try:
        # Verificar sesión
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es estudiante
        user = User.query.get(user_id)
        if not user or user.rol != 'estudiante':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de estudiante'
            }), 403
        
        data = request.json
        
        # En un sistema real, aquí se actualizaría la configuración en la base de datos
        # Por ahora, solo retornamos éxito
        
        return jsonify({
            'success': True,
            'message': 'Configuración actualizada exitosamente'
        })
        
    except Exception as e:
        logger.error(f"Error updating student config: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al actualizar configuración del estudiante'
        }), 500

# Certificados del estudiante
@student_bp.route('/certificados', methods=['GET'])
@cross_origin()
def get_student_certificates():
    """Obtener certificados del estudiante"""
    try:
        # Verificar sesión
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es estudiante
        user = User.query.get(user_id)
        if not user or user.rol != 'estudiante':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de estudiante'
            }), 403
        
        # Obtener cursos completados
        inscripciones_completadas = db.session.query(Inscripcion, Curso)\
            .join(Curso, Inscripcion.curso_id == Curso.id)\
            .filter(and_(
                Inscripcion.estudiante_id == user.id,
                Inscripcion.estado == 'completado'
            ))\
            .all()
        
        certificados_data = []
        for inscripcion, curso in inscripciones_completadas:
            certificados_data.append({
                'id': inscripcion.id,
                'curso': curso.titulo,
                'fechaCompletado': inscripcion.fecha_completado.isoformat() if inscripcion.fecha_completado else None,
                'calificacion': inscripcion.calificacion,
                'url': f'/api/student/certificado/{inscripcion.id}/descargar'
            })
        
        return jsonify({
            'success': True,
            'data': certificados_data
        })
        
    except Exception as e:
        logger.error(f"Error getting student certificates: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener certificados del estudiante'
        }), 500

# Estadísticas del estudiante
@student_bp.route('/estadisticas', methods=['GET'])
@cross_origin()
def get_student_statistics():
    """Obtener estadísticas del estudiante"""
    try:
        # Verificar sesión
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es estudiante
        user = User.query.get(user_id)
        if not user or user.rol != 'estudiante':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de estudiante'
            }), 403
        
        # Obtener inscripciones del estudiante
        inscripciones = Inscripcion.query.filter_by(estudiante_id=user.id).all()
        
        # Calcular estadísticas
        cursos_completados = sum(1 for ins in inscripciones if ins.estado == 'completado')
        horas_estudio = sum(ins.curso.duracion_horas for ins in inscripciones if ins.curso)
        promedio_calificacion = 0
        if inscripciones:
            calificaciones = [ins.calificacion for ins in inscripciones if ins.calificacion]
            if calificaciones:
                promedio_calificacion = sum(calificaciones) / len(calificaciones)
        
        # Días activo (simulado)
        dias_activo = 30
        
        # Progreso por categoría (simulado)
        progreso_por_categoria = [
            {'nombre': 'Desarrollo Web', 'progreso': 75},
            {'nombre': 'JavaScript', 'progreso': 60},
            {'nombre': 'React', 'progreso': 45}
        ]
        
        estadisticas_data = {
            'cursosCompletados': cursos_completados,
            'horasEstudio': horas_estudio,
            'promedioCalificacion': round(promedio_calificacion, 1),
            'diasActivo': dias_activo,
            'progresoPorCategoria': progreso_por_categoria
        }
        
        return jsonify({
            'success': True,
            'data': estadisticas_data
        })
        
    except Exception as e:
        logger.error(f"Error getting student statistics: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener estadísticas del estudiante'
        }), 500 