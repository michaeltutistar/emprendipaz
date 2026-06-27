from flask import Blueprint, jsonify, request, session
from flask_cors import cross_origin
from datetime import datetime, timedelta
from sqlalchemy import func, and_, select
from src.models import db, User, Curso, Modulo, Leccion, Recurso, Inscripcion, LogActividad, AsistenciaJornada
from src.services.auth_service import token_required
from src.services.s3_service import S3Service
import base64
import os
import uuid
import logging

logger = logging.getLogger(__name__)
student_bp = Blueprint('student', __name__)

# Asegurar que cross_origin no rompa credenciales (credentials: include) en el frontend.
_cross_origin = cross_origin
def cross_origin(*args, **kwargs):
    kwargs.setdefault('supports_credentials', True)
    kwargs.setdefault('origins', [
        'https://emprendimiento-narino.com',
        'https://www.emprendimiento-narino.com',
        'http://localhost:5173',
        'http://localhost:3000',
    ])
    return _cross_origin(*args, **kwargs)

_IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.webp'}
_MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 5MB

def _latest_user_image_presigned_url(s3_service: S3Service, user_id: int, folder: str, expires_in: int = 3600):
    """Retorna URL prefirmada del archivo de imagen más reciente en un folder del usuario."""
    prefix = f"usuarios/{user_id}/{folder}/"
    try:
        resp = s3_service.s3_client.list_objects_v2(Bucket=s3_service.bucket_name, Prefix=prefix)
        contents = resp.get('Contents') or []
        images = []
        for obj in contents:
            key = obj.get('Key') or ''
            ext = os.path.splitext(key)[1].lower()
            if ext in _IMAGE_EXTS:
                images.append(obj)
        if not images:
            return None
        latest = max(images, key=lambda o: o.get('LastModified'))
        key = latest.get('Key')
        if not key:
            return None
        return s3_service.s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': s3_service.bucket_name, 'Key': key},
            ExpiresIn=expires_in
        )
    except Exception as e:
        logger.error(f"Error getting latest image for user {user_id} folder {folder}: {e}")
        return None

def _upload_user_image_bytes(s3_service: S3Service, user_id: int, folder: str, data: bytes, filename: str = "image", content_type: str = ""):
    """Sube bytes de imagen a S3 y retorna URL prefirmada."""
    filename = filename or "image"
    ext = os.path.splitext(filename)[1].lower()
    ct = (content_type or '').lower()

    if ext not in _IMAGE_EXTS:
        # Fallback por content-type
        if ct == 'image/png':
            ext = '.png'
        elif ct in ('image/jpeg', 'image/jpg'):
            ext = '.jpg'
        elif ct == 'image/webp':
            ext = '.webp'
        else:
            return None, "Tipo de archivo no permitido. Use JPG, PNG o WEBP."

    if not data:
        return None, "Archivo vacío"
    if len(data) > _MAX_IMAGE_BYTES:
        return None, "La imagen es demasiado grande. Máximo 5MB."

    key = f"usuarios/{user_id}/{folder}/{uuid.uuid4().hex}{ext}"
    try:
        s3_service.s3_client.put_object(
            Bucket=s3_service.bucket_name,
            Key=key,
            Body=data,
            ContentType=ct or 'application/octet-stream'
        )
        url = s3_service.s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': s3_service.bucket_name, 'Key': key},
            ExpiresIn=3600
        )
        return url, None
    except Exception as e:
        logger.error(f"Error uploading image bytes to S3: {e}")
        return None, "Error al subir la imagen"

def _upload_user_image(s3_service: S3Service, user_id: int, folder: str, file_storage):
    """Sube una imagen del usuario a S3 y retorna URL prefirmada."""
    if not file_storage:
        return None, "No se proporcionó archivo"

    filename = file_storage.filename or "image"
    data = file_storage.read()
    return _upload_user_image_bytes(
        s3_service=s3_service,
        user_id=user_id,
        folder=folder,
        data=data,
        filename=filename,
        content_type=file_storage.content_type or ''
    )

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
@token_required
def get_student_dashboard(current_user):
    """Obtener estadísticas del dashboard del estudiante"""
    try:
        # Verificar que el usuario es estudiante
        user = current_user
        if not user or user.rol not in ['estudiante', 'usuario']:
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
        
        # Asistencia presencial: 10 jornadas (10% cada una)
        asistencia_presencial = 0
        try:
            jornadas_marcadas = AsistenciaJornada.query.filter_by(estudiante_id=user.id, marcada=True).count()
            asistencia_presencial = max(0, min(100, int(jornadas_marcadas) * 10))
        except Exception as e:
            # No romper el dashboard si la tabla no existe todavía o falla la consulta
            logger.warning(f"No se pudo calcular asistencia para user_id={user.id}: {str(e)}")

        return jsonify({
            'success': True,
            'data': {
                'cursosActivos': cursos_activos,
                'cursosCompletados': cursos_completados,
                'progresoGeneral': round(total_progreso, 1),
                'asistenciaPresencial': asistencia_presencial,
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
@token_required
def get_student_courses(current_user):
    """Obtener cursos del estudiante"""
    try:
        user = current_user
        if user.rol not in ['estudiante', 'usuario']:
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
@token_required
def get_available_courses(current_user):
    """Obtener cursos disponibles para inscripción"""
    try:
        user = current_user
        if user.rol not in ['estudiante', 'usuario']:
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
@token_required
def get_student_profile(current_user):
    """Obtener perfil del estudiante"""
    try:
        # Verificar que el usuario es estudiante
        user = current_user
        if not user or user.rol not in ['estudiante', 'usuario']:
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de estudiante'
            }), 403
        
        s3_service = S3Service()
        foto_perfil_url = _latest_user_image_presigned_url(s3_service, user.id, 'perfil')
        foto_emprendimiento_url = _latest_user_image_presigned_url(s3_service, user.id, 'emprendimiento')

        perfil_data = {
            'nombre': f"{user.nombre} {user.apellido}",
            'email': user.email,
            'telefono': user.telefono,
            'fechaNacimiento': user.fecha_nacimiento.isoformat() if user.fecha_nacimiento else None,
            'pais': user.pais,
            'ciudad': user.ciudad,
            'municipio': user.municipio,
            'emprendimiento_nombre': user.emprendimiento_nombre,
            'foto_perfil_url': foto_perfil_url,
            'foto_emprendimiento_url': foto_emprendimiento_url,
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
@token_required
def update_student_profile(current_user):
    """Actualizar perfil del estudiante"""
    try:
        # Verificar que el usuario es estudiante
        user = current_user
        if not user or user.rol not in ['estudiante', 'usuario']:
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de estudiante'
            }), 403
        
        data = request.json or {}
        
        # Actualizar campos del usuario
        # IMPORTANT: El frontend históricamente envía "nombre" como NOMBRE COMPLETO (nombre + apellido),
        # y este endpoint lo guardaba directo en user.nombre, causando duplicación progresiva:
        #   GET /student/perfil -> nombre="A B" (A=user.nombre, B=user.apellido)
        #   PUT /student/perfil -> user.nombre="A B"
        #   Siguiente GET -> "A B B"
        #
        # Para ser retrocompatible y evitar duplicación, si llega un "nombre" que termina en el apellido
        # (nuevo o actual), se recorta ese sufijo y solo se persiste el/los nombres.
        if 'apellido' in data and data.get('apellido') is not None:
            user.apellido = str(data.get('apellido') or '').strip()

        if 'nombre' in data and data.get('nombre') is not None:
            raw_nombre = str(data.get('nombre') or '').strip()
            apellido_ref = (str(data.get('apellido') or '').strip() or (user.apellido or '')).strip()

            if raw_nombre and apellido_ref:
                # remover repeticiones del apellido al final (case-insensitive), ej: "Ana Perez Perez" + "Perez"
                # Nota: no intentamos "partir" apellidos compuestos; solo quitamos el sufijo exacto.
                lowered = raw_nombre.lower()
                apellido_lower = apellido_ref.lower()
                guard = 0
                while guard < 5:
                    suffix = (' ' + apellido_lower)
                    if lowered.endswith(suffix):
                        raw_nombre = raw_nombre[: -len(suffix)].strip()
                        lowered = raw_nombre.lower()
                        guard += 1
                        continue
                    break

            # Persistir nombre (sin apellido duplicado)
            user.nombre = raw_nombre
        if 'telefono' in data:
            user.telefono = data['telefono']
        if 'fechaNacimiento' in data and data['fechaNacimiento']:
            user.fecha_nacimiento = datetime.fromisoformat(data['fechaNacimiento'])
        if 'pais' in data:
            user.pais = data['pais']
        if 'ciudad' in data:
            user.ciudad = data['ciudad']
        if 'municipio' in data:
            user.municipio = data['municipio']
        if 'emprendimiento_nombre' in data:
            user.emprendimiento_nombre = data['emprendimiento_nombre']
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


@student_bp.route('/perfil/foto-perfil', methods=['POST'])
@cross_origin()
@token_required
def upload_foto_perfil(current_user):
    """Subir foto de perfil del estudiante a S3"""
    try:
        user = current_user
        if not user or user.rol not in ['estudiante', 'usuario']:
            return jsonify({'success': False, 'error': 'Acceso denegado'}), 403

        file = request.files.get('file')
        s3_service = S3Service()
        if file:
            url, err = _upload_user_image(s3_service, user.id, 'perfil', file)
        else:
            # Fallback: JSON base64 (dataUrl) para evitar problemas de multipart en API Gateway
            payload = request.get_json(silent=True) or {}
            data_url = payload.get('dataUrl') or payload.get('file_base64')
            filename = payload.get('filename') or 'perfil.png'
            content_type = payload.get('content_type') or ''

            if isinstance(data_url, str) and data_url.startswith('data:'):
                try:
                    header, b64 = data_url.split(',', 1)
                    if not content_type and ';base64' in header:
                        content_type = header.split(';', 1)[0].replace('data:', '').strip()
                    data_url = b64
                except Exception:
                    data_url = None

            if not data_url or not isinstance(data_url, str):
                return jsonify({'success': False, 'error': 'No se proporcionó archivo'}), 400

            try:
                raw = base64.b64decode(data_url, validate=False)
            except Exception:
                return jsonify({'success': False, 'error': 'Archivo inválido'}), 400

            url, err = _upload_user_image_bytes(s3_service, user.id, 'perfil', raw, filename=filename, content_type=content_type)
        if err:
            return jsonify({'success': False, 'error': err}), 400

        return jsonify({'success': True, 'url': url}), 200
    except Exception as e:
        logger.error(f"Error uploading profile photo: {e}")
        return jsonify({'success': False, 'error': 'Error al subir foto de perfil'}), 500


@student_bp.route('/perfil/foto-emprendimiento', methods=['POST'])
@cross_origin()
@token_required
def upload_foto_emprendimiento(current_user):
    """Subir foto/logo del emprendimiento del estudiante a S3"""
    try:
        user = current_user
        if not user or user.rol not in ['estudiante', 'usuario']:
            return jsonify({'success': False, 'error': 'Acceso denegado'}), 403

        file = request.files.get('file')
        s3_service = S3Service()
        if file:
            url, err = _upload_user_image(s3_service, user.id, 'emprendimiento', file)
        else:
            payload = request.get_json(silent=True) or {}
            data_url = payload.get('dataUrl') or payload.get('file_base64')
            filename = payload.get('filename') or 'emprendimiento.png'
            content_type = payload.get('content_type') or ''

            if isinstance(data_url, str) and data_url.startswith('data:'):
                try:
                    header, b64 = data_url.split(',', 1)
                    if not content_type and ';base64' in header:
                        content_type = header.split(';', 1)[0].replace('data:', '').strip()
                    data_url = b64
                except Exception:
                    data_url = None

            if not data_url or not isinstance(data_url, str):
                return jsonify({'success': False, 'error': 'No se proporcionó archivo'}), 400

            try:
                raw = base64.b64decode(data_url, validate=False)
            except Exception:
                return jsonify({'success': False, 'error': 'Archivo inválido'}), 400

            url, err = _upload_user_image_bytes(s3_service, user.id, 'emprendimiento', raw, filename=filename, content_type=content_type)
        if err:
            return jsonify({'success': False, 'error': err}), 400

        return jsonify({'success': True, 'url': url}), 200
    except Exception as e:
        logger.error(f"Error uploading emprendimiento photo: {e}")
        return jsonify({'success': False, 'error': 'Error al subir foto del emprendimiento'}), 500

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
@token_required
def get_student_certificates(current_user):
    """Obtener certificados del estudiante"""
    try:
        # Verificar que el usuario es estudiante
        user = current_user
        if not user or user.rol not in ['estudiante', 'usuario']:
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
@token_required
def get_student_statistics(current_user):
    """Obtener estadísticas del estudiante"""
    try:
        # Verificar que el usuario es estudiante
        user = current_user
        if not user or user.rol not in ['estudiante', 'usuario']:
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

# -------------------------------
# ENDPOINTS ESPERADOS POR FRONTEND (JWT)
# -------------------------------

@student_bp.route('/mi-progreso', methods=['GET'])
@token_required
def get_my_progress(current_user):
    """Obtener progreso del estudiante actual por módulo (JWT)."""
    try:
        from collections import defaultdict
        import re
        from src.models import IntentosEvaluacion

        if current_user.rol not in ['estudiante', 'usuario']:
            return jsonify({'success': False, 'error': 'Acceso denegado. Se requiere rol de estudiante'}), 403

        user = current_user

        # Obtener intentos de evaluación solo del estudiante actual
        intentos_evaluacion = IntentosEvaluacion.query.filter_by(usuario_id=user.id).all()
        intentos_por_modulo = defaultdict(lambda: defaultdict(int))
        modulos_por_estudiante = set()
        
        # Obtener puntos del plan de negocio del estudiante actual por módulo
        puntos_por_modulo = defaultdict(int)
        fechas_plan_negocio_por_modulo = {}
        try:
            # Intentar consultar la tabla directamente (si no existe, el try-except la capturará)
            from src.models import PuntosPlanNegocio
            puntos_plan_negocio = PuntosPlanNegocio.query.filter_by(usuario_id=user.id).all()
            for punto in puntos_plan_negocio:
                puntos_por_modulo[punto.modulo_nombre] += punto.puntos
                # Guardar la fecha más reciente del plan de negocio por módulo
                if punto.fecha_registro:
                    fecha_actual = fechas_plan_negocio_por_modulo.get(punto.modulo_nombre)
                    if fecha_actual is None or punto.fecha_registro > fecha_actual:
                        fechas_plan_negocio_por_modulo[punto.modulo_nombre] = punto.fecha_registro
        except Exception as e:
            # Si la tabla no existe o hay algún error, simplemente continuar sin puntos
            logger.warning(f"Error obteniendo puntos del plan de negocio: {str(e)}")
            pass

        for intento in intentos_evaluacion:
            modulo_normalizado = (intento.modulo_nombre or '').strip()
            paso_normalizado = (intento.paso_nombre or '').strip()
            match = re.search(r'Unidad\s+(\d+)', paso_normalizado, re.IGNORECASE)
            if match:
                unidad_key = f"Unidad {match.group(1)}"
                intentos_por_modulo[modulo_normalizado][unidad_key] += 1
                modulos_por_estudiante.add(modulo_normalizado)

        actividades = LogActividad.query.filter(
            LogActividad.usuario_id == user.id,
            LogActividad.accion.like('Completó:%')
        ).all()

        progreso_modulos = defaultdict(list)

        modulos_posibles = [
            'Marketing Digital', 'Marketing y Comercialización', 'Proyecto de vida',
            'Trabajo en Equipo', 'Descubrimiento de Oportunidades', 'Modelo de Negocios',
            'Atención al Cliente', 'Finanzas', 'Liderazgo', 'Plan de Inversión'
        ]

        for actividad in actividades:
            paso = actividad.accion.replace('Completó: ', '')
            detalles = actividad.detalles or ''
            modulo = None
            texto_buscar = (detalles + ' ' + paso).lower()
            for mod in modulos_posibles:
                if mod.lower() in texto_buscar:
                    modulo = mod
                    break
            if not modulo:
                continue
            modulos_por_estudiante.add(modulo)
            if not any(p['paso'] == paso for p in progreso_modulos[modulo]):
                progreso_modulos[modulo].append({
                    'paso': paso,
                    'fecha': actividad.fecha.isoformat() if actividad.fecha else None,
                    'detalles': detalles
                })

        modulos_progreso = []
        for modulo in modulos_por_estudiante:
            pasos_completados = progreso_modulos.get(modulo, [])
            unidades_encontradas = set()
            pasos_por_unidad = defaultdict(list)
            otros_pasos = []

            for paso_obj in pasos_completados:
                paso = paso_obj['paso']
                match = re.search(r'Unidad\s+(\d+)', paso, re.IGNORECASE)
                if match:
                    unidad_key = f"Unidad {match.group(1)}"
                    unidades_encontradas.add(unidad_key)
                    pasos_por_unidad[unidad_key].append(paso_obj)
                else:
                    otros_pasos.append(paso_obj)

            progreso_pasos = []
            for paso_obj in otros_pasos:
                progreso_pasos.append({
                    'nombre': paso_obj['paso'],
                    'completado': True,
                    'porcentaje': 100.0,
                    'subpasos_completados': 1,
                    'total_subpasos': 1,
                    'fecha': paso_obj.get('fecha'),
                    'intentos': 0
                })

            unidades_con_intentos = set(intentos_por_modulo.get(modulo, {}).keys())
            todas_las_unidades = unidades_encontradas.union(unidades_con_intentos)

            def unidad_sort_key(x):
                m = re.search(r'\d+', x)
                return int(m.group()) if m else 0

            for unidad_key in sorted(todas_las_unidades, key=unidad_sort_key):
                pasos_unidad = pasos_por_unidad.get(unidad_key, [])
                # Todos los módulos tienen 4 pasos por unidad (25% cada uno = 100% total)
                # "Proyecto de vida": Presentación, Fundamentación, Taller, Evaluación
                # Módulos 2-10: Inicio, Desarrollo, Taller, Cierre
                total_pasos_unidad = 4  # 4 pasos = 25% cada uno = 100% total
                completados_count = len(pasos_unidad)
                porcentaje_paso = min(100.0, (completados_count / total_pasos_unidad) * 100) if total_pasos_unidad else 0
                completado = completados_count >= total_pasos_unidad

                # Incluir subpasos reales para permitir verificación de pasos específicos en frontend
                # (p. ej. "Unidad 1: Evaluación") mediante useProgressTracking.
                subpasos = []
                seen_subpasos = set()
                for p in pasos_unidad:
                    nombre_subpaso = p.get('paso')
                    if not nombre_subpaso:
                        continue
                    if nombre_subpaso in seen_subpasos:
                        continue
                    seen_subpasos.add(nombre_subpaso)
                    subpasos.append({
                        'nombre': nombre_subpaso,
                        'completado': True,
                        'fecha': p.get('fecha')
                    })

                fecha_completado = None
                fechas = [p.get('fecha') for p in pasos_unidad if p.get('fecha')]
                if fechas:
                    fecha_completado = max(fechas)
                intentos = intentos_por_modulo.get(modulo, {}).get(unidad_key, 0)

                progreso_pasos.append({
                    'nombre': unidad_key,
                    'completado': completado,
                    'porcentaje': round(porcentaje_paso, 1),
                    'subpasos_completados': completados_count,
                    'total_subpasos': total_pasos_unidad,
                    'subpasos': subpasos,
                    'fecha': fecha_completado,
                    'intentos': intentos
                })
            
            # Módulos que tienen plan de negocio con puntos (Módulos 2-8 y 10)
            modulos_con_plan_negocio = [
                'Descubrimiento de Oportunidades', 'Modelo de Negocios', 'Marketing y Comercialización', 
                'Marketing Digital', 'Atención al Cliente', 'Trabajo en Equipo', 'Finanzas', 'Liderazgo'
            ]
            
            # Agregar tarjeta "Plan de Negocio" si el módulo tiene plan de negocio con puntos
            if modulo in modulos_con_plan_negocio:
                puntos_plan = puntos_por_modulo.get(modulo, 0)
                fecha_plan = fechas_plan_negocio_por_modulo.get(modulo)
                progreso_pasos.append({
                    'nombre': 'Plan de Negocio',
                    'completado': puntos_plan > 0,
                    'porcentaje': 100.0 if puntos_plan > 0 else 0,
                    'subpasos_completados': 1 if puntos_plan > 0 else 0,
                    'total_subpasos': 1,
                    'fecha': fecha_plan.isoformat() if fecha_plan else None,
                    'intentos': 0,
                    'puntos_plan_negocio': puntos_plan
                })

            # Calcular porcentaje total del módulo
            # NUEVA LÓGICA: Cada unidad completada = 25%, Plan de negocio completado = 25%
            # Total = 100% (3 unidades * 25% + 1 plan de negocio * 25% = 100%)
            unidades_en_progreso = [p for p in progreso_pasos if re.search(r'Unidad\s+\d+', p['nombre'], re.IGNORECASE)]
            unidades_completadas = len([p for p in unidades_en_progreso if p['completado']])
            
            # Para módulos sin plan de negocio, siempre hay 3 unidades
            # Para módulos con plan de negocio, también hay 3 unidades + 1 plan de negocio
            total_unidades_esperadas = 3
            
            # Verificar si tiene plan de negocio completado (solo para módulos que lo tienen)
            tiene_plan_negocio_completado = False
            if modulo in modulos_con_plan_negocio:
                puntos_plan = puntos_por_modulo.get(modulo, 0)
                tiene_plan_negocio_completado = puntos_plan > 0
            
            # Calcular porcentaje del módulo:
            # - Cada unidad completada = 25%
            # - Plan de negocio completado = 25% adicional
            # - Máximo = 100% (3 unidades + 1 plan de negocio)
            if modulo in modulos_con_plan_negocio:
                # Módulos con plan de negocio: 3 unidades (25% cada una) + plan de negocio (25%) = 100%
                porcentaje_por_unidades = unidades_completadas * 25
                porcentaje_plan_negocio = 25 if tiene_plan_negocio_completado else 0
                porcentaje_modulo = min(100.0, porcentaje_por_unidades + porcentaje_plan_negocio)
            else:
                # Módulos sin plan de negocio: 3 unidades (33.33% cada una) = 100%
                # Usar total_unidades_esperadas (3) en lugar de len(unidades_en_progreso)
                porcentaje_modulo = (unidades_completadas / total_unidades_esperadas * 100) if total_unidades_esperadas > 0 else 0

            modulos_progreso.append({
                'modulo': modulo,
                'progreso_pasos': progreso_pasos,
                'porcentaje': round(porcentaje_modulo, 1),
                'pasos_completados': unidades_completadas,
                'total_pasos': total_unidades_esperadas + (1 if modulo in modulos_con_plan_negocio else 0)
            })

        return jsonify({'success': True, 'modulos': modulos_progreso}), 200
    except Exception as e:
        logger.error(f"Error obteniendo progreso del estudiante: {str(e)}", exc_info=True)
        return jsonify({'error': 'Error al obtener progreso'}), 500


@student_bp.route('/progreso-curso', methods=['GET'])
@token_required
def get_progreso_curso(current_user):
    """
    Progreso del curso (persistente por usuario).
    Regla: cada módulo completado suma 10% (10 módulos = 100%).

    Se considera un módulo "completado" cuando tiene sus 3 unidades completadas; y si el módulo requiere
    plan de negocio, también debe estar completado (según puntos/registro en BD).
    """
    try:
        import re
        from collections import defaultdict

        if current_user.rol not in ['estudiante', 'usuario']:
            return jsonify({'success': False, 'error': 'Acceso denegado. Se requiere rol de estudiante'}), 403

        user = current_user

        # Los 10 módulos del curso (mismo set usado por /modulos-disponibles y /mi-progreso)
        orden_modulos = [
            'Proyecto de vida',
            'Descubrimiento de Oportunidades',
            'Modelo de Negocios',
            'Marketing y Comercialización',
            'Marketing Digital',
            'Atención al Cliente',
            'Trabajo en Equipo',
            'Finanzas',
            'Plan de Inversión',
            'Liderazgo'
        ]

        modulos_con_plan_negocio = {
            'Marketing Digital',
            'Marketing y Comercialización',
            'Modelo de Negocios',
            'Descubrimiento de Oportunidades',
            'Trabajo en Equipo',
            'Atención al Cliente'
        }

        # 1) Unidades completadas por módulo a partir de LogActividad "Completó:"
        actividades = LogActividad.query.filter(
            LogActividad.usuario_id == user.id,
            LogActividad.accion.like('Completó:%')
        ).all()

        pasos_por_modulo = defaultdict(list)

        # Detectar el módulo al que pertenece un paso (en detalle o en el mismo texto del paso)
        for actividad in actividades:
            paso = (actividad.accion or '').replace('Completó: ', '').strip()
            detalles = (actividad.detalles or '').strip()
            texto_buscar = (detalles + ' ' + paso).lower()

            modulo_detectado = None
            for mod in orden_modulos:
                if mod.lower() in texto_buscar:
                    modulo_detectado = mod
                    break
            if not modulo_detectado:
                continue

            pasos_por_modulo[modulo_detectado].append(paso)

        def unidades_completadas(modulo_nombre: str) -> set[int]:
            """
            Una unidad se considera completada si tiene evidencias de:
            - inicio
            - desarrollo/fundamentación
            - cierre/evaluación
            para la misma unidad.
            """
            pasos = [p.lower() for p in pasos_por_modulo.get(modulo_nombre, [])]
            unidades = defaultdict(list)
            for p in pasos:
                m = re.search(r'unidad\\s*(\\d+)', p, re.IGNORECASE)
                if m:
                    unidades[int(m.group(1))].append(p)

            completadas = set()
            for num, pasos_unidad in unidades.items():
                tiene_inicio = any('inicio' in p for p in pasos_unidad)
                tiene_desarrollo = any('desarrollo' in p or 'fundamentación' in p or 'fundamentacion' in p for p in pasos_unidad)
                tiene_cierre = any('cierre' in p or 'evaluación' in p or 'evaluacion' in p for p in pasos_unidad)
                if tiene_inicio and tiene_desarrollo and tiene_cierre:
                    completadas.add(num)
            return completadas

        # 2) Plan de negocio completado por módulo (si aplica) a partir de PuntosPlanNegocio (BD)
        plan_ok_por_modulo = defaultdict(bool)
        try:
            from src.models import PuntosPlanNegocio
            puntos = PuntosPlanNegocio.query.filter_by(usuario_id=user.id).all()
            puntos_sum = defaultdict(int)
            for p in puntos:
                puntos_sum[(p.modulo_nombre or '').strip()] += int(p.puntos or 0)
            for mod in modulos_con_plan_negocio:
                plan_ok_por_modulo[mod] = puntos_sum.get(mod, 0) > 0
        except Exception as e:
            # Si la tabla no existe o hay error, no bloquear el endpoint: se asume no completado
            logger.warning(f"Error obteniendo puntos plan de negocio para progreso-curso: {str(e)}")

        completados = 0
        completado_por_modulo = {}
        for mod in orden_modulos:
            unidades_ok = unidades_completadas(mod)
            modulo_ok = (1 in unidades_ok and 2 in unidades_ok and 3 in unidades_ok)
            if modulo_ok and mod in modulos_con_plan_negocio:
                modulo_ok = bool(plan_ok_por_modulo.get(mod, False))
            completado_por_modulo[mod] = modulo_ok
            if modulo_ok:
                completados += 1

        porcentaje = max(0, min(100, completados * 10))

        return jsonify({
            'success': True,
            'data': {
                'porcentaje': porcentaje,
                'modulosCompletados': completados,
                'totalModulos': len(orden_modulos),
                'detalle': completado_por_modulo
            }
        }), 200
    except Exception as e:
        logger.error(f"Error en progreso-curso: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': 'Error al obtener progreso del curso'}), 500


@student_bp.route('/modulos-disponibles', methods=['GET'])
@token_required
def get_modulos_disponibles(current_user):
    """Determinar qué módulos y unidades están disponibles según el progreso del estudiante (JWT)."""
    try:
        from collections import defaultdict
        import re
        from src.models import IntentosEvaluacion

        if current_user.rol not in ['estudiante', 'usuario']:
            return jsonify({'success': False, 'error': 'Acceso denegado. Se requiere rol de estudiante'}), 403

        user = current_user

        modulos_con_plan_negocio = {
            'Marketing Digital',
            'Marketing y Comercialización',
            'Modelo de Negocios',
            'Descubrimiento de Oportunidades',
            'Trabajo en Equipo',
            'Atención al Cliente'
        }

        orden_modulos = [
            'Proyecto de vida',
            'Descubrimiento de Oportunidades',
            'Modelo de Negocios',
            'Marketing y Comercialización',
            'Marketing Digital',
            'Atención al Cliente',
            'Trabajo en Equipo',
            'Finanzas',
            'Plan de Inversión',
            'Liderazgo'
        ]

        actividades = LogActividad.query.filter(
            LogActividad.usuario_id == user.id,
            LogActividad.accion.like('Completó:%')
        ).all()

        intentos_evaluacion = IntentosEvaluacion.query.filter_by(usuario_id=user.id).all()

        progreso_modulos = defaultdict(list)
        modulos_por_estudiante = set()

        for actividad in actividades:
            paso = actividad.accion.replace('Completó: ', '')
            detalles = actividad.detalles or ''
            modulo = None
            modulos_posibles = orden_modulos + ['Plan de Negocios']
            texto_buscar = (detalles + ' ' + paso).lower()
            for mod in modulos_posibles:
                if mod.lower() in texto_buscar:
                    modulo = mod
                    break
            if modulo and modulo != 'Plan de Negocios':
                modulos_por_estudiante.add(modulo)
                progreso_modulos[modulo].append({'paso': paso, 'fecha': actividad.fecha.isoformat() if actividad.fecha else None})

        def modulo_tiene_plan_negocio_completado(modulo_nombre: str) -> bool:
            texto = modulo_nombre.lower()
            for act in actividades:
                det = (act.detalles or '').lower()
                acc = (act.accion or '').lower()
                if 'plan de negocio' in det or 'plan de negocio' in acc:
                    # asociarlo al módulo si aparece el nombre
                    if texto in det or texto in acc:
                        return True
            return False

        def get_unidades_completadas(modulo_nombre: str):
            unidades = defaultdict(list)
            pasos = progreso_modulos.get(modulo_nombre, [])
            for p in pasos:
                paso = p.get('paso') or ''
                m = re.search(r'Unidad\s+(\d+)', paso, re.IGNORECASE)
                if m:
                    unidades[m.group(1)].append(p)
            unidades_completadas = set()
            for num, pasos_unidad in unidades.items():
                if modulo_nombre == 'Proyecto de vida':
                    # Proyecto de vida tiene 4 pasos: Presentación, Fundamentación, Taller, Evaluación
                    pasos_nombres = [p.get('paso', '').lower() for p in pasos_unidad]
                    tiene_presentacion = any('presentación' in p or 'presentacion' in p for p in pasos_nombres)
                    tiene_fundamentacion = any('fundamentación' in p or 'fundamentacion' in p or 'desarrollo' in p for p in pasos_nombres)
                    tiene_taller = any('taller' in p for p in pasos_nombres)
                    tiene_evaluacion = any('evaluación' in p or 'evaluacion' in p or 'cierre' in p for p in pasos_nombres)
                    if tiene_presentacion and tiene_fundamentacion and tiene_taller and tiene_evaluacion:
                        unidades_completadas.add(int(num))
                elif modulo_nombre == 'Marketing Digital':
                    # Marketing Digital tiene 4 pasos: Inicio, Fundamentación, Taller, Cierre
                    pasos_nombres = [p.get('paso', '').lower() for p in pasos_unidad]
                    tiene_inicio = any('inicio' in p for p in pasos_nombres)
                    tiene_fundamentacion = any('fundamentación' in p or 'fundamentacion' in p for p in pasos_nombres)
                    tiene_taller = any('taller' in p for p in pasos_nombres)
                    tiene_cierre = any('cierre' in p for p in pasos_nombres)
                    if tiene_inicio and tiene_fundamentacion and tiene_taller and tiene_cierre:
                        unidades_completadas.add(int(num))
                else:
                    # Otros módulos tienen 3 pasos: Inicio, Desarrollo, Cierre
                    pasos_nombres = [p.get('paso', '').lower() for p in pasos_unidad]
                    tiene_inicio = any('inicio' in p or 'presentación' in p or 'presentacion' in p for p in pasos_nombres)
                    tiene_desarrollo = any('desarrollo' in p or 'fundamentación' in p or 'fundamentacion' in p for p in pasos_nombres)
                    tiene_cierre = any('cierre' in p or 'evaluación' in p or 'evaluacion' in p for p in pasos_nombres)
                    if tiene_inicio and tiene_desarrollo and tiene_cierre:
                        unidades_completadas.add(int(num))
            return unidades_completadas

        resultado = {}
        modulo_anterior_completado = True
        # Índice de Marketing Digital (módulo 5) - habilitar todo a partir de aquí
        indice_marketing_digital = orden_modulos.index('Marketing Digital') if 'Marketing Digital' in orden_modulos else 4

        for i, modulo_nombre in enumerate(orden_modulos):
            # Habilitar todos los módulos desde Marketing Digital (módulo 5) en adelante
            if i >= indice_marketing_digital:
                modulo_disponible = True
                # Habilitar todas las unidades también
                unidades_disponibles = {'1': True, '2': True, '3': True}
                modulo_actual_completado = True  # Considerar completado para no bloquear siguientes
            else:
                if i == 0:
                    modulo_disponible = True
                else:
                    modulo_disponible = modulo_anterior_completado

                unidades_disponibles = {'1': False, '2': False, '3': False}
                if modulo_disponible:
                    unidades_disponibles['1'] = True
                    unidades_completadas = get_unidades_completadas(modulo_nombre)
                    if 1 in unidades_completadas:
                        unidades_disponibles['2'] = True
                    if 2 in unidades_completadas:
                        unidades_disponibles['3'] = True

                # Determinar si el módulo actual está "completado" para desbloquear el siguiente
                unidades_completadas = get_unidades_completadas(modulo_nombre)
                modulo_actual_completado = (1 in unidades_completadas and 2 in unidades_completadas and 3 in unidades_completadas)

                if modulo_actual_completado and modulo_nombre in modulos_con_plan_negocio:
                    modulo_actual_completado = modulo_tiene_plan_negocio_completado(modulo_nombre)

            modulo_anterior_completado = modulo_actual_completado

            resultado[modulo_nombre] = {
                'disponible': modulo_disponible,
                'unidades': unidades_disponibles
            }

        return jsonify({'success': True, 'modulos': resultado}), 200
    except Exception as e:
        logger.error(f"Error en modulos-disponibles: {str(e)}", exc_info=True)
        return jsonify({'error': 'Error desconocido'}), 500