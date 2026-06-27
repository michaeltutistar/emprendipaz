from flask import Blueprint, jsonify, request, session
from flask_cors import cross_origin
from datetime import datetime, timedelta
from sqlalchemy import func, and_, select
from src.models import db, User, Curso, Modulo, Leccion, Recurso, Inscripcion, LogActividad, AsistenciaJornada
from src.models.intentos_evaluacion import IntentosEvaluacion
from src.services.auth_service import token_required
from src.services.s3_service import S3Service
from src.services.student_municipio_service import get_preferred_municipio
import os
import uuid
import base64
import logging

logger = logging.getLogger(__name__)
student_bp = Blueprint('student', __name__)

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

def _upload_user_image(s3_service: S3Service, user_id: int, folder: str, file_storage):
    """Sube una imagen del usuario a S3 y retorna URL prefirmada."""
    if not file_storage:
        return None, "No se proporcionó archivo"

    filename = file_storage.filename or "image"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in _IMAGE_EXTS:
        ct = (file_storage.content_type or '').lower()
        if ct == 'image/png':
            ext = '.png'
        elif ct in ('image/jpeg', 'image/jpg'):
            ext = '.jpg'
        elif ct == 'image/webp':
            ext = '.webp'
        else:
            return None, "Tipo de archivo no permitido. Use JPG, PNG o WEBP."

    data = file_storage.read()
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
            ContentType=file_storage.content_type or 'application/octet-stream'
        )
        url = s3_service.s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': s3_service.bucket_name, 'Key': key},
            ExpiresIn=3600
        )
        return url, None
    except Exception as e:
        logger.error(f"Error uploading image to S3: {e}")
        return None, "Error al subir la imagen"


def _upload_user_image_bytes(s3_service: S3Service, user_id: int, folder: str, data: bytes, filename: str = "image", content_type: str = ""):
    """Sube bytes de imagen a S3 y retorna URL prefirmada (para dataUrl/base64 desde API Gateway)."""
    filename = filename or "image"
    ext = os.path.splitext(filename)[1].lower()
    ct = (content_type or '').lower()

    if ext not in _IMAGE_EXTS:
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
@token_required
@cross_origin()
def get_student_dashboard(current_user):
    """Obtener estadísticas del dashboard del estudiante"""
    try:
        # Verificar que el usuario es estudiante
        if current_user.rol not in ['estudiante', 'usuario']:
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de estudiante'
            }), 403
        
        user = current_user
        
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
        
        # Asistencia presencial (10 jornadas, 10% cada una)
        asistencia_presencial = 0
        try:
            jornadas_marcadas = AsistenciaJornada.query.filter_by(estudiante_id=user.id, marcada=True).count()
            asistencia_presencial = max(0, min(100, int(jornadas_marcadas) * 10))
        except Exception as e:
            # Si la tabla no existe aún o hay error de consulta, no fallar el dashboard.
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
@token_required
@cross_origin()
def get_student_courses(current_user):
    """Obtener cursos del estudiante"""
    try:
        # Verificar que el usuario es estudiante
        if current_user.rol not in ['estudiante', 'usuario']:
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de estudiante'
            }), 403
        
        user = current_user
        
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
@token_required
@cross_origin()
def get_student_profile(current_user):
    """Obtener perfil del estudiante"""
    try:
        # Verificar que el usuario es estudiante
        if current_user.rol not in ['estudiante', 'usuario']:
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de estudiante'
            }), 403
        
        user = current_user
        preferred_municipio = get_preferred_municipio(
            user.id,
            f"{(user.nombre or '').strip()} {(user.apellido or '').strip()}".strip(),
            user.municipio,
        )
        
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
            'municipio': preferred_municipio,
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
@token_required
@cross_origin()
def update_student_profile(current_user):
    """Actualizar perfil del estudiante"""
    try:
        # Verificar que el usuario es estudiante
        if current_user.rol not in ['estudiante', 'usuario']:
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de estudiante'
            }), 403
        
        user = current_user
        
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
            'error': 'Error al actualizar el perfil'
        }), 500


@student_bp.route('/perfil/foto-perfil', methods=['POST'])
@token_required
@cross_origin()
def upload_foto_perfil(current_user):
    """Subir foto de perfil del estudiante a S3. Acepta multipart (file) o JSON (dataUrl base64)."""
    try:
        user = current_user
        if not user or user.rol not in ['estudiante', 'usuario']:
            return jsonify({'success': False, 'error': 'Acceso denegado'}), 403

        file = request.files.get('file')
        s3_service = S3Service()
        url, err = None, None

        if file:
            url, err = _upload_user_image(s3_service, user.id, 'perfil', file)
        else:
            # Fallback: JSON base64 (dataUrl) para API Gateway y PWA
            payload = request.get_json(silent=True, force=True) or {}
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
@token_required
@cross_origin()
def upload_foto_emprendimiento(current_user):
    """Subir foto/logo del emprendimiento del estudiante a S3. Acepta multipart (file) o JSON (dataUrl base64)."""
    try:
        user = current_user
        if not user or user.rol not in ['estudiante', 'usuario']:
            return jsonify({'success': False, 'error': 'Acceso denegado'}), 403

        file = request.files.get('file')
        s3_service = S3Service()
        url, err = None, None

        if file:
            url, err = _upload_user_image(s3_service, user.id, 'emprendimiento', file)
        else:
            payload = request.get_json(silent=True, force=True) or {}
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
@token_required
@cross_origin()
def get_student_certificates(current_user):
    """Obtener certificados del estudiante"""
    try:
        user = current_user
        if not user or user.rol not in ('estudiante', 'usuario'):
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
@token_required
@cross_origin()
def get_student_statistics(current_user):
    """Obtener estadísticas del estudiante"""
    try:
        user = current_user
        if not user or user.rol not in ('estudiante', 'usuario'):
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

# Progreso del estudiante por módulo
@student_bp.route('/mi-progreso', methods=['GET'])
@token_required
@cross_origin()
def get_my_progress(current_user):
    """Obtener progreso del estudiante actual por módulo"""
    try:
        from collections import defaultdict
        import re
        
        # Verificar que el usuario es estudiante
        if current_user.rol not in ['estudiante', 'usuario']:
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de estudiante'
            }), 403
        
        user = current_user
        nombre_estudiante = f"{user.nombre} {user.apellido}".strip()
        
        # Obtener intentos de evaluación solo del estudiante actual
        from ..models import IntentosEvaluacion, PuntosPlanNegocio
        intentos_evaluacion = IntentosEvaluacion.query.filter_by(usuario_id=user.id).all()
        logger.info(f"📊 Intentos encontrados para {nombre_estudiante}: {len(intentos_evaluacion)}")
        
        # Obtener puntos del plan de negocio del estudiante actual por módulo
        # Normalizar nombres (BD/frontend) al canónico para que coincida con la UI
        mapeo_modulo_plan_negocio = {
            'Finanzas y Gestión Empresarial': 'Finanzas',
            'Atención al Cliente y Resolución de Conflictos': 'Atención al Cliente',
        }
        nombres_canonicos_modulos = [
            'Descubrimiento de Oportunidades', 'Modelo de Negocios', 'Marketing y Comercialización',
            'Marketing Digital', 'Atención al Cliente', 'Trabajo en Equipo', 'Finanzas', 'Liderazgo'
        ]

        def _canonico_plan_negocio(nombre):
            n = (nombre or '').strip()
            if n in mapeo_modulo_plan_negocio:
                return mapeo_modulo_plan_negocio[n]
            for c in nombres_canonicos_modulos:
                if c.lower() == n.lower():
                    return c
            return n

        puntos_por_modulo = defaultdict(int)
        fechas_plan_negocio_por_modulo = {}
        try:
            puntos_plan_negocio = PuntosPlanNegocio.query.filter_by(usuario_id=user.id).all()
            for punto in puntos_plan_negocio:
                mod_canonico = _canonico_plan_negocio(punto.modulo_nombre)
                puntos_por_modulo[mod_canonico] += punto.puntos
                if punto.fecha_registro:
                    fecha_actual = fechas_plan_negocio_por_modulo.get(mod_canonico)
                    if fecha_actual is None or punto.fecha_registro > fecha_actual:
                        fechas_plan_negocio_por_modulo[mod_canonico] = punto.fecha_registro
        except Exception as e:
            logger.warning(f"Error obteniendo puntos del plan de negocio: {str(e)}")
            pass

        # Agrupar intentos por módulo y unidad
        intentos_por_modulo = defaultdict(lambda: defaultdict(int))
        modulos_por_estudiante = set()
        
        for intento in intentos_evaluacion:
            modulo_normalizado = intento.modulo_nombre.strip()
            paso_normalizado = intento.paso_nombre.strip()
            
            # Extraer el número de unidad del paso
            match = re.search(r'Unidad\s+(\d+)', paso_normalizado, re.IGNORECASE)
            if match:
                numero_unidad = match.group(1)
                unidad_key = f"Unidad {numero_unidad}"
                intentos_por_modulo[modulo_normalizado][unidad_key] += 1
                modulos_por_estudiante.add(modulo_normalizado)
        
        # Obtener actividades de completado solo del estudiante actual
        actividades = LogActividad.query.filter(
            LogActividad.usuario_id == user.id,
            LogActividad.accion.like('Completó:%')
        ).all()
        
        # Agrupar actividades por módulo y paso
        progreso_modulos = defaultdict(list)
        
        for actividad in actividades:
            paso = actividad.accion.replace('Completó: ', '')
            fecha_actividad = actividad.fecha.isoformat()
            
            # Buscar el módulo en los detalles o en el paso
            modulo = None
            detalles = actividad.detalles or ''
            
            # Lista de módulos posibles (case insensitive)
            modulos_posibles = [
                'Marketing Digital', 'Marketing y Comercialización', 'Proyecto de vida', 
                'Trabajo en Equipo', 'Descubrimiento de Oportunidades', 'Modelo de Negocios', 
                'Atención al Cliente', 'Finanzas', 'Liderazgo', 'Plan de Inversión'
            ]
            
            # Buscar módulo en detalles o paso
            texto_buscar = (detalles + ' ' + paso).lower()
            for mod in modulos_posibles:
                if mod.lower() in texto_buscar:
                    modulo = mod
                    break
            
            # Si no se encontró, saltar esta actividad
            if not modulo:
                continue
            
            modulos_por_estudiante.add(modulo)
            
            # Agregar el paso al progreso (evitar duplicados)
            paso_existente = False
            for paso_exist in progreso_modulos[modulo]:
                if paso_exist['paso'] == paso:
                    paso_existente = True
                    break
            
            if not paso_existente:
                progreso_modulos[modulo].append({
                    'paso': paso,
                    'fecha': fecha_actividad,
                    'detalles': detalles
                })

        # Incluir módulos que solo tienen puntos de plan de negocio (sin intentos ni actividades)
        for mod in puntos_por_modulo:
            if mod and puntos_por_modulo[mod] > 0:
                modulos_por_estudiante.add(mod)
        
        # Calcular progreso por módulo
        modulos_progreso = []
        
        for modulo in modulos_por_estudiante:
            pasos_completados = progreso_modulos.get(modulo, [])
            pasos_completados_nombres = [p['paso'] for p in pasos_completados]
            
            # Agrupar pasos por unidad
            unidades_encontradas = set()
            pasos_por_unidad = defaultdict(list)
            otros_pasos = []
            
            for paso_obj in pasos_completados:
                paso = paso_obj['paso']
                match = re.search(r'Unidad\s+(\d+)', paso, re.IGNORECASE)
                if match:
                    numero_unidad = match.group(1)
                    unidad_key = f"Unidad {numero_unidad}"
                    unidades_encontradas.add(unidad_key)
                    pasos_por_unidad[unidad_key].append(paso_obj)
                else:
                    otros_pasos.append(paso_obj)
            
            # Crear array de progreso para este módulo
            progreso_pasos = []
            
            # Agregar otros pasos (no unidades)
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
            
            # Obtener todas las unidades que tienen intentos (incluso si no tienen pasos completados)
            unidades_con_intentos = set(intentos_por_modulo.get(modulo, {}).keys())
            # Combinar con las unidades encontradas en los pasos
            todas_las_unidades = unidades_encontradas.union(unidades_con_intentos)
            
            # Agregar unidades con sus intentos
            for unidad_key in sorted(todas_las_unidades, key=lambda x: int(re.search(r'\d+', x).group()) if re.search(r'\d+', x) else 0):
                # Verificar si esta unidad tiene pasos completados
                pasos_unidad = pasos_por_unidad.get(unidad_key, [])
                # Todos los módulos tienen 4 pasos por unidad (25% cada uno = 100% total)
                # "Proyecto de vida": Presentación, Fundamentación, Taller, Evaluación
                # Módulos 2-10: Inicio, Desarrollo, Taller, Cierre
                total_pasos_unidad = 4  # 4 pasos = 25% cada uno = 100% total
                completados_count = len(pasos_unidad)
                porcentaje_paso = min(100.0, (completados_count / total_pasos_unidad) * 100) if total_pasos_unidad > 0 else 0
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
                
                # Obtener fecha más reciente
                fecha_completado = None
                if pasos_unidad:
                    fechas = [p.get('fecha') for p in pasos_unidad if p.get('fecha')]
                    if fechas:
                        fecha_completado = max(fechas)
                
                # Buscar intentos para esta unidad
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
            
            # Señal robusta de plan de negocio completado: el registro "Plan de Negocio"
            # en LogActividad sobrevive a la sincronización offline aunque los puntos
            # (PuntosPlanNegocio) se pierdan en el camino. Si existe cualquiera de las
            # dos señales, el plan se considera hecho (igual criterio que el desbloqueo
            # de módulos en modulos-disponibles).
            tiene_log_plan_negocio = any(
                ('plan de negocio' in (nombre or '').lower() or 'plan negocio' in (nombre or '').lower())
                for nombre in pasos_completados_nombres
            )

            # Agregar tarjeta "Plan de Negocio" si el módulo tiene plan de negocio con puntos
            if modulo in modulos_con_plan_negocio:
                mod_key = _canonico_plan_negocio(modulo)
                puntos_plan = puntos_por_modulo.get(mod_key, 0)
                fecha_plan = fechas_plan_negocio_por_modulo.get(mod_key)
                plan_hecho = (puntos_plan > 0) or tiene_log_plan_negocio
                progreso_pasos.append({
                    'nombre': 'Plan de Negocio',
                    'completado': plan_hecho,
                    'porcentaje': 100.0 if plan_hecho else 0,
                    'subpasos_completados': 1 if plan_hecho else 0,
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
                mod_key = _canonico_plan_negocio(modulo)
                puntos_plan = puntos_por_modulo.get(mod_key, 0)
                tiene_plan_negocio_completado = (puntos_plan > 0) or tiene_log_plan_negocio
            
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
        
        return jsonify({
            'success': True,
            'modulos': modulos_progreso
        }), 200
        
    except Exception as e:
        logger.error(f"Error obteniendo progreso del estudiante: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({'error': 'Error al obtener progreso'}), 500

# Endpoint para determinar qué módulos y unidades están disponibles
@student_bp.route('/modulos-disponibles', methods=['GET'])
@token_required
@cross_origin()
def get_modulos_disponibles(current_user):
    """Determinar qué módulos y unidades están disponibles según el progreso del estudiante"""
    try:
        from collections import defaultdict
        import re
        
        # Verificar que el usuario es estudiante
        if current_user.rol not in ['estudiante', 'usuario']:
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de estudiante'
            }), 403
        
        user = current_user
        
        # Módulos que tienen plan de negocio
        modulos_con_plan_negocio = {
            'Marketing Digital',
            'Marketing y Comercialización',
            'Modelo de Negocios',
            'Descubrimiento de Oportunidades',
            'Trabajo en Equipo',
            'Atención al Cliente'
        }
        
        # Orden de módulos (secuencial)
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
        
        # Obtener actividades de completado
        actividades = LogActividad.query.filter(
            LogActividad.usuario_id == user.id,
            LogActividad.accion.like('Completó:%')
        ).all()
        
        # Obtener intentos de evaluación
        from ..models import IntentosEvaluacion
        intentos_evaluacion = IntentosEvaluacion.query.filter_by(usuario_id=user.id).all()
        
        # Agrupar actividades por módulo
        progreso_modulos = defaultdict(list)
        modulos_por_estudiante = set()
        
        for actividad in actividades:
            paso = actividad.accion.replace('Completó: ', '')
            detalles = actividad.detalles or ''
            
            # Buscar el módulo en los detalles o en el paso
            modulo = None
            modulos_posibles = orden_modulos + ['Plan de Negocios']
            texto_buscar = (detalles + ' ' + paso).lower()
            
            for mod in modulos_posibles:
                if mod.lower() in texto_buscar:
                    modulo = mod
                    break
            
            if modulo and modulo != 'Plan de Negocios':
                modulos_por_estudiante.add(modulo)
                progreso_modulos[modulo].append({
                    'paso': paso,
                    'fecha': actividad.fecha.isoformat()
                })
        
        # Verificar si se completó plan de negocio
        def modulo_tiene_plan_negocio_completado(modulo_nombre):
            if modulo_nombre not in modulos_con_plan_negocio:
                return True  # Si no tiene plan de negocio, se considera completado
            
            # Buscar actividad de plan de negocio
            for actividad in actividades:
                detalles = actividad.detalles or ''
                paso = actividad.accion.replace('Completó: ', '')
                texto_buscar = (detalles + ' ' + paso).lower()
                
                if modulo_nombre.lower() in texto_buscar and ('plan de negocio' in texto_buscar or 'plan negocio' in texto_buscar):
                    return True
            return False
        
        # Determinar unidades completadas por módulo
        def get_unidades_completadas(modulo_nombre):
            pasos_completados = progreso_modulos.get(modulo_nombre, [])
            unidades_completadas = set()
            
            # Agrupar pasos por unidad
            pasos_por_unidad = defaultdict(list)
            for paso_obj in pasos_completados:
                paso = paso_obj['paso']
                match = re.search(r'Unidad\s+(\d+)', paso, re.IGNORECASE)
                if match:
                    numero_unidad = int(match.group(1))
                    pasos_por_unidad[numero_unidad].append(paso_obj)
            
            # Verificar cada unidad
            for numero_unidad, pasos_unidad in pasos_por_unidad.items():
                if modulo_nombre == 'Proyecto de vida':
                    # Proyecto de vida tiene 4 pasos: Presentación, Fundamentación, Taller, Evaluación
                    # Verificar que tenga los 4 tipos de pasos
                    pasos_nombres = [p['paso'].lower() for p in pasos_unidad]
                    tiene_presentacion = any('presentación' in p or 'presentacion' in p for p in pasos_nombres)
                    tiene_fundamentacion = any('fundamentación' in p or 'fundamentacion' in p or 'desarrollo' in p for p in pasos_nombres)
                    tiene_taller = any('taller' in p for p in pasos_nombres)
                    tiene_evaluacion = any('evaluación' in p or 'evaluacion' in p or 'cierre' in p for p in pasos_nombres)
                    
                    if tiene_presentacion and tiene_fundamentacion and tiene_taller and tiene_evaluacion:
                        unidades_completadas.add(numero_unidad)
                elif modulo_nombre == 'Marketing Digital':
                    # Marketing Digital tiene 4 pasos: Inicio, Fundamentación, Taller, Cierre
                    pasos_nombres = [p['paso'].lower() for p in pasos_unidad]
                    tiene_inicio = any('inicio' in p for p in pasos_nombres)
                    tiene_fundamentacion = any('fundamentación' in p or 'fundamentacion' in p for p in pasos_nombres)
                    tiene_taller = any('taller' in p for p in pasos_nombres)
                    tiene_cierre = any('cierre' in p for p in pasos_nombres)
                    
                    if tiene_inicio and tiene_fundamentacion and tiene_taller and tiene_cierre:
                        unidades_completadas.add(numero_unidad)
                else:
                    # Otros módulos tienen 3 pasos: Inicio, Desarrollo, Cierre
                    pasos_nombres = [p['paso'].lower() for p in pasos_unidad]
                    tiene_inicio = any('inicio' in p or 'presentación' in p or 'presentacion' in p for p in pasos_nombres)
                    tiene_desarrollo = any('desarrollo' in p or 'fundamentación' in p or 'fundamentacion' in p for p in pasos_nombres)
                    tiene_cierre = any('cierre' in p or 'evaluación' in p or 'evaluacion' in p for p in pasos_nombres)
                    
                    if tiene_inicio and tiene_desarrollo and tiene_cierre:
                        unidades_completadas.add(numero_unidad)
            
            return unidades_completadas
        
        # Construir respuesta
        modulos_disponibles = {}
        
        for i, modulo_nombre in enumerate(orden_modulos):
            # El primer módulo siempre está disponible
            if i == 0:
                modulo_disponible = True
            else:
                # Verificar si el módulo anterior está completado
                modulo_anterior = orden_modulos[i - 1]
                unidades_anteriores = get_unidades_completadas(modulo_anterior)
                
                # El módulo anterior debe tener todas sus unidades completadas (3 unidades)
                modulo_anterior_completado = len(unidades_anteriores) >= 3
                
                # Si el módulo anterior tiene plan de negocio, también debe estar completado
                if modulo_anterior in modulos_con_plan_negocio:
                    plan_negocio_completado = modulo_tiene_plan_negocio_completado(modulo_anterior)
                    modulo_anterior_completado = modulo_anterior_completado and plan_negocio_completado
                
                modulo_disponible = modulo_anterior_completado
            
            # Determinar unidades disponibles
            unidades_disponibles = {}
            if modulo_disponible:
                unidades_completadas = get_unidades_completadas(modulo_nombre)
                
                # Unidad 1 siempre está disponible si el módulo está disponible
                unidades_disponibles[1] = True
                
                # Unidad 2 está disponible si unidad 1 está completada
                unidades_disponibles[2] = 1 in unidades_completadas
                
                # Unidad 3 está disponible si unidad 2 está completada
                unidades_disponibles[3] = 2 in unidades_completadas
            else:
                unidades_disponibles = {1: False, 2: False, 3: False}
            
            # Convertir unidades_disponibles a formato JSON serializable
            unidades_dict = {
                '1': unidades_disponibles.get(1, False),
                '2': unidades_disponibles.get(2, False),
                '3': unidades_disponibles.get(3, False)
            }
            
            modulos_disponibles[modulo_nombre] = {
                'disponible': modulo_disponible,
                'unidades': unidades_dict,
                'tiene_plan_negocio': modulo_nombre in modulos_con_plan_negocio,
                'plan_negocio_completado': modulo_tiene_plan_negocio_completado(modulo_nombre) if modulo_nombre in modulos_con_plan_negocio else True
            }
        
        return jsonify({
            'success': True,
            'modulos': modulos_disponibles
        }), 200
        
    except Exception as e:
        logger.error(f"Error obteniendo módulos disponibles: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({'error': 'Error al obtener módulos disponibles'}), 500

@student_bp.route('/registrar-progreso-modulo', methods=['POST'])
@token_required
@cross_origin()
def registrar_progreso_modulo(current_user):
    """Registrar progreso de un módulo para el estudiante"""
    try:
        user = current_user
        if not user or user.rol not in ['estudiante', 'usuario']:
            return jsonify({'success': False, 'error': 'Acceso denegado'}), 403

        data = request.json
        modulo_nombre = data.get('modulo_nombre')
        paso_nombre = data.get('paso_nombre')
        curso_nombre = data.get('curso_nombre', modulo_nombre)

        if not modulo_nombre or not paso_nombre:
            return jsonify({'success': False, 'error': 'Faltan datos requeridos'}), 400

        # Registrar en LogActividad
        accion = f"Completó: {paso_nombre}"
        detalles = f"Módulo: {modulo_nombre}, Curso: {curso_nombre}"
        
        log_actividad = LogActividad(
            usuario_id=user.id,
            accion=accion,
            detalles=detalles,
            fecha=datetime.utcnow()
        )
        
        db.session.add(log_actividad)
        db.session.commit()

        logger.info(f"✅ Progreso registrado: {user.nombre} - {modulo_nombre} - {paso_nombre}")

        return jsonify({
            'success': True,
            'message': 'Progreso registrado exitosamente'
        }), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error registrando progreso: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({'success': False, 'error': 'Error al registrar progreso'}), 500

@student_bp.route('/registrar-intento-evaluacion', methods=['POST'])
@token_required
@cross_origin()
def registrar_intento_evaluacion(current_user):
    """Registrar un intento de evaluación del estudiante"""
    try:
        user = current_user
        if not user or user.rol not in ['estudiante', 'usuario']:
            return jsonify({'success': False, 'error': 'Acceso denegado'}), 403

        data = request.json
        modulo_nombre = data.get('modulo_nombre')
        unidad_nombre = data.get('unidad_nombre')
        paso_nombre = data.get('paso_nombre')
        todas_correctas = data.get('todas_correctas', False)

        if not modulo_nombre or not unidad_nombre or not paso_nombre:
            return jsonify({'success': False, 'error': 'Faltan datos requeridos'}), 400

        # Crear registro de intento
        intento = IntentosEvaluacion(
            usuario_id=user.id,
            modulo_nombre=modulo_nombre,
            unidad_nombre=unidad_nombre,
            paso_nombre=paso_nombre,
            todas_correctas=todas_correctas,
            fecha_intento=datetime.utcnow()
        )
        
        db.session.add(intento)
        db.session.commit()

        logger.info(f"✅ Intento registrado: {user.nombre} - {modulo_nombre} - {unidad_nombre} - {paso_nombre} - Correctas: {todas_correctas}")

        return jsonify({
            'success': True,
            'message': 'Intento de evaluación registrado exitosamente'
        }), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error registrando intento: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({'success': False, 'error': 'Error al registrar intento'}), 500


@student_bp.route('/verificar-evaluacion', methods=['GET'])
@token_required
@cross_origin()
def verificar_evaluacion(current_user):
    """Verificar si el usuario ya pasó una evaluación específica"""
    try:
        user = current_user
        if not user or user.rol not in ['estudiante', 'usuario']:
            return jsonify({'success': False, 'error': 'Acceso denegado'}), 403

        modulo_nombre = request.args.get('modulo_nombre')
        unidad_nombre = request.args.get('unidad_nombre')
        paso_nombre = request.args.get('paso_nombre')

        if not modulo_nombre or not unidad_nombre or not paso_nombre:
            return jsonify({'success': False, 'error': 'Faltan parámetros requeridos'}), 400

        # Buscar si existe un intento con todas_correctas = True
        intento_exitoso = IntentosEvaluacion.query.filter_by(
            usuario_id=user.id,
            modulo_nombre=modulo_nombre,
            unidad_nombre=unidad_nombre,
            paso_nombre=paso_nombre,
            todas_correctas=True
        ).first()

        return jsonify({
            'success': True,
            'ya_paso': intento_exitoso is not None,
            'fecha_paso': intento_exitoso.fecha_intento.isoformat() if intento_exitoso else None
        }), 200

    except Exception as e:
        logger.error(f"Error verificando evaluación: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({'success': False, 'error': 'Error al verificar evaluación'}), 500 