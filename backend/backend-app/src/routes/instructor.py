from flask import Blueprint, request, jsonify, current_app
from flask_cors import cross_origin
from werkzeug.utils import secure_filename
import boto3
import os
import uuid
from datetime import datetime, timedelta
from ..models import db, User, Curso, Modulo, Leccion, Recurso, Inscripcion, LogActividad
from ..services.auth_service import token_required, instructor_required
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

instructor_bp = Blueprint('instructor', __name__)

# Configuración de S3
def get_s3_client():
    """Obtener cliente de S3"""
    return boto3.client(
        's3',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        region_name=os.getenv('AWS_REGION', 'us-east-1')
    )

def upload_to_s3(file, folder='content'):
    """Subir archivo a S3"""
    try:
        s3_client = get_s3_client()
        bucket_name = os.getenv('S3_BUCKET_NAME')
        
        # Generar nombre único para el archivo
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{folder}/{uuid.uuid4()}{file_extension}"
        
        # Subir archivo
        s3_client.upload_fileobj(
            file,
            bucket_name,
            unique_filename,
            ExtraArgs={
                'ContentType': file.content_type,
                'ACL': 'public-read'
            }
        )
        
        # Generar URL pública
        url = f"https://{bucket_name}.s3.amazonaws.com/{unique_filename}"
        
        return {
            'success': True,
            's3_key': unique_filename,
            's3_url': url,
            's3_bucket': bucket_name
        }
    except Exception as e:
        logger.error(f"Error uploading to S3: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

@instructor_bp.route('/dashboard', methods=['GET'])
@cross_origin()
def get_instructor_dashboard():
    """Obtener datos del dashboard del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Obtener cursos del instructor
        cursos = Curso.query.filter_by(instructor_id=user.id).all()
        
        # Calcular estadísticas
        total_cursos = len(cursos)
        total_estudiantes = 0
        promedio_progreso = 0
        
        cursos_data = []
        for curso in cursos:
            # Contar estudiantes inscritos
            inscripciones = Inscripcion.query.filter_by(curso_id=curso.id).all()
            total_estudiantes_curso = len(inscripciones)
            total_estudiantes += total_estudiantes_curso
            
            # Progreso promedio (no disponible en modelo actual)
            progreso_curso = 0
            
            promedio_progreso += progreso_curso
            
            cursos_data.append({
                'id': curso.id,
                'titulo': curso.titulo,
                'descripcion': curso.descripcion,
                'totalEstudiantes': total_estudiantes_curso,
                'promedioProgreso': progreso_curso,
                'estado': curso.estado,
                'fechaCreacion': curso.fecha_creacion.isoformat(),
                'ultimaActividad': curso.fecha_actualizacion.isoformat()
            })
        
        if total_cursos > 0:
            promedio_progreso = round(promedio_progreso / total_cursos, 1)
        
        # Obtener actividad reciente (temporalmente vacío hasta implementar LogActividad)
        actividad_data = []
        
        return jsonify({
            'success': True,
            'data': {
                'totalCursos': total_cursos,
                'totalEstudiantes': total_estudiantes,
                'promedioProgreso': promedio_progreso,
                'actividadReciente': actividad_data,
                'cursos': cursos_data
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting instructor dashboard: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener datos del dashboard'
        }), 500

@instructor_bp.route('/cursos', methods=['GET'])
@cross_origin()
def get_instructor_courses():
    """Obtener cursos del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        cursos = Curso.query.filter_by(instructor_id=user.id).all()
        
        cursos_data = []
        for curso in cursos:
            # Contar estudiantes y calcular progreso
            inscripciones = Inscripcion.query.filter_by(curso_id=curso.id).all()
            total_estudiantes = len(inscripciones)
            
            progreso_promedio = 0
            
            # Contar módulos y lecciones
            modulos = Modulo.query.filter_by(curso_id=curso.id).all()
            total_modulos = len(modulos)
            
            total_lecciones = 0
            for modulo in modulos:
                lecciones = Leccion.query.filter_by(modulo_id=modulo.id).all()
                total_lecciones += len(lecciones)
            
            cursos_data.append({
                'id': curso.id,
                'titulo': curso.titulo,
                'descripcion': curso.descripcion,
                'totalEstudiantes': total_estudiantes,
                'totalModulos': total_modulos,
                'totalLecciones': total_lecciones,
                'promedioProgreso': progreso_promedio,
                'estado': curso.estado,
                'fechaCreacion': curso.fecha_creacion.isoformat(),
                'fechaActualizacion': curso.fecha_actualizacion.isoformat()
            })
        
        return jsonify({
            'success': True,
            'data': cursos_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting instructor courses: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener cursos'
        }), 500

@instructor_bp.route('/curso/<int:curso_id>', methods=['GET'])
@cross_origin()
def get_course_detail(curso_id):
    """Obtener detalles de un curso específico del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Verificar que el curso pertenece al instructor
        curso = Curso.query.filter_by(id=curso_id, instructor_id=user.id).first()
        if not curso:
            return jsonify({
                'success': False,
                'error': 'Curso no encontrado'
            }), 404
        
        # Contar estudiantes y calcular progreso
        inscripciones = Inscripcion.query.filter_by(curso_id=curso_id).all()
        total_estudiantes = len(inscripciones)
        
        progreso_promedio = 0
        
        curso_data = {
            'id': curso.id,
            'titulo': curso.titulo,
            'descripcion': curso.descripcion,
            'totalEstudiantes': total_estudiantes,
            'promedioProgreso': progreso_promedio,
            'estado': curso.estado,
            'fechaCreacion': curso.fecha_creacion.isoformat(),
            'fechaActualizacion': curso.fecha_actualizacion.isoformat(),
            'fechaApertura': curso.fecha_apertura.isoformat() if curso.fecha_apertura else None,
            'fechaCierre': curso.fecha_cierre.isoformat() if curso.fecha_cierre else None,
            'duracionHoras': curso.duracion_horas,
            'nivel': curso.nivel,
            'categoria': curso.categoria,
            'imagenUrl': curso.imagen_url,
            'maxEstudiantes': curso.max_estudiantes
        }
        
        return jsonify({
            'success': True,
            'data': curso_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting course detail: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener detalles del curso'
        }), 500

@instructor_bp.route('/curso', methods=['POST'])
@cross_origin()
def create_course():
    """Crear nuevo curso para el instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        data = request.json
        
        # Validar campos obligatorios
        if not data.get('titulo'):
            return jsonify({
                'success': False,
                'error': 'El título del curso es obligatorio'
            }), 400
        
        # Validar convocatoria (1 o 2)
        if data.get('convocatoria') not in ['1', '2']:
            return jsonify({
                'success': False,
                'error': 'La convocatoria es obligatoria y debe ser 1 o 2'
            }), 400
        
        # Crear nuevo curso
        curso = Curso(
            titulo=data['titulo'],
            descripcion=data.get('descripcion', ''),
            categoria=data.get('categoria', ''),
            nivel=data.get('nivel', 'básico'),
            duracion_horas=data.get('duracion_horas', 0),
            max_estudiantes=data.get('max_estudiantes', 0),
            estado=data.get('estado', 'activo'),
            instructor_id=user.id,
            convocatoria=data.get('convocatoria')
        )
        
        db.session.add(curso)
        db.session.commit()
        
        # Registrar actividad (modelo simplificado usa 'accion' y 'detalles')
        log_actividad = LogActividad(
            usuario_id=user.id,
            accion='nuevo_curso',
            detalles=f'Creó nuevo curso: {curso.titulo}',
            fecha=datetime.utcnow()
        )
        # Nota: Si LogActividad no es un modelo mapeado, omitir el add/commit
        try:
            db.session.add(log_actividad)
            db.session.commit()
        except Exception:
            db.session.rollback()
        
        return jsonify({
            'success': True,
            'message': 'Curso creado exitosamente',
            'data': {
                'id': curso.id,
                'titulo': curso.titulo,
                'descripcion': curso.descripcion,
                'categoria': curso.categoria,
                'nivel': curso.nivel,
                'duracion_horas': curso.duracion_horas,
                'max_estudiantes': curso.max_estudiantes,
                'estado': curso.estado,
                'instructor_id': curso.instructor_id,
                'convocatoria': curso.convocatoria,
                'fecha_creacion': curso.fecha_creacion.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating course: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al crear curso'
        }), 500

@instructor_bp.route('/curso/<int:curso_id>/estudiantes', methods=['GET'])
@cross_origin()
def get_course_students(curso_id):
    """Obtener estudiantes de un curso específico"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Verificar que el curso pertenece al instructor
        curso = Curso.query.filter_by(id=curso_id, instructor_id=user.id).first()
        if not curso:
            return jsonify({
                'success': False,
                'error': 'Curso no encontrado'
            }), 404
        
        # Obtener inscripciones con datos del estudiante
        inscripciones = db.session.query(Inscripcion, User).join(
            User, Inscripcion.estudiante_id == User.id
        ).filter(Inscripcion.curso_id == curso_id).all()
        
        estudiantes_data = []
        for inscripcion, estudiante in inscripciones:
            estudiantes_data.append({
                'id': estudiante.id,
                'nombre': f"{estudiante.nombre} {estudiante.apellido}",
                'email': estudiante.email,
                'progreso': inscripcion.progreso,
                'fechaInscripcion': inscripcion.fecha_inscripcion.isoformat(),
                'ultimaActividad': inscripcion.fecha_ultima_actividad.isoformat() if inscripcion.fecha_ultima_actividad else None
            })
        
        return jsonify({
            'success': True,
            'data': estudiantes_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting course students: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener estudiantes'
        }), 500

@instructor_bp.route('/contenido/upload', methods=['POST'])
@cross_origin()
def upload_content():
    """Subir contenido a S3"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No se proporcionó archivo'
            }), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No se seleccionó archivo'
            }), 400
        
        # Validar tipo de archivo
        allowed_extensions = {
            'video': ['.mp4', '.webm', '.ogg', '.avi', '.mov'],
            'documento': ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt']
        }
        
        file_extension = os.path.splitext(file.filename)[1].lower()
        tipo_contenido = request.form.get('tipo_contenido', 'documento')
        
        if file_extension not in allowed_extensions.get(tipo_contenido, []):
            return jsonify({
                'success': False,
                'error': f'Tipo de archivo no permitido para {tipo_contenido}'
            }), 400
        
        # Validar tamaño
        max_size = 500 * 1024 * 1024 if tipo_contenido == 'video' else 50 * 1024 * 1024  # 500MB o 50MB
        if len(file.read()) > max_size:
            return jsonify({
                'success': False,
                'error': f'Archivo demasiado grande. Máximo: {max_size // (1024*1024)}MB'
            }), 400
        
        file.seek(0)  # Reset file pointer
        
        # Subir a S3
        upload_result = upload_to_s3(file, folder=f'content/{tipo_contenido}')
        
        if not upload_result['success']:
            return jsonify({
                'success': False,
                'error': f'Error al subir archivo: {upload_result["error"]}'
            }), 500
        
        # Guardar en base de datos
        recurso = Recurso(
            titulo=request.form.get('titulo', file.filename),
            descripcion=request.form.get('descripcion', ''),
            tipo=tipo_contenido,
            categoria=request.form.get('categoria', ''),
            s3_key=upload_result['s3_key'],
            s3_url=upload_result['s3_url'],
            s3_bucket=upload_result['s3_bucket'],
            nombre_original=file.filename,
            extension=file_extension,
            tamano_bytes=len(file.read()),
            mime_type=file.content_type,
            curso_id=request.form.get('curso_id'),
            modulo_id=request.form.get('modulo_id'),
            subido_por=user.id,
            acceso_publico=request.form.get('acceso_publico', 'true').lower() == 'true',
            requiere_autenticacion=request.form.get('requiere_autenticacion', 'false').lower() == 'true'
        )
        
        db.session.add(recurso)
        db.session.commit()
        
        # Registrar actividad
        log_actividad = LogActividad(
            usuario_id=user.id,
            tipo='nuevo_recurso',
            descripcion=f'Subió {tipo_contenido}: {recurso.titulo}',
            fecha=datetime.utcnow()
        )
        db.session.add(log_actividad)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': recurso.to_dict(),
            'message': 'Contenido subido exitosamente'
        }), 201
        
    except Exception as e:
        logger.error(f"Error uploading content: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al subir contenido'
        }), 500

@instructor_bp.route('/modulos', methods=['GET'])
@cross_origin()
def get_instructor_modules():
    """Obtener módulos de los cursos del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Obtener IDs de cursos del instructor
        curso_ids = [curso.id for curso in Curso.query.filter_by(instructor_id=user.id).all()]
        
        if not curso_ids:
            return jsonify({
                'success': True,
                'data': []
            }), 200
        
        # Obtener módulos
        modulos = Modulo.query.filter(Modulo.curso_id.in_(curso_ids)).all()
        
        modulos_data = []
        for modulo in modulos:
            # Contar lecciones y recursos
            lecciones = Leccion.query.filter_by(modulo_id=modulo.id).all()
            recursos = Recurso.query.filter_by(modulo_id=modulo.id).all()
            
            modulos_data.append({
                'id': modulo.id,
                'curso_id': modulo.curso_id,
                'titulo': modulo.titulo,
                'descripcion': modulo.descripcion,
                'orden': modulo.orden,
                'duracion_estimada': modulo.duracion_estimada,
                'estado': modulo.estado,
                'totalLecciones': len(lecciones),
                'totalRecursos': len(recursos),
                'fechaCreacion': modulo.fecha_creacion.isoformat()
            })
        
        return jsonify({
            'success': True,
            'data': modulos_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting instructor modules: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener módulos'
        }), 500

@instructor_bp.route('/modulo', methods=['POST'])
@cross_origin()
def create_module():
    """Crear nuevo módulo"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        data = request.get_json()
        
        # Verificar que el curso pertenece al instructor
        curso = Curso.query.filter_by(
            id=data.get('curso_id'), 
            instructor_id=user.id
        ).first()
        
        if not curso:
            return jsonify({
                'success': False,
                'error': 'Curso no encontrado'
            }), 404
        
        # Crear módulo
        modulo = Modulo(
            curso_id=data.get('curso_id'),
            titulo=data.get('titulo'),
            descripcion=data.get('descripcion', ''),
            orden=data.get('orden', 1),
            duracion_estimada=data.get('duracion_estimada', ''),
            estado=data.get('estado', 'activo')
        )
        
        db.session.add(modulo)
        db.session.commit()
        
        # Registrar actividad
        log_actividad = LogActividad(
            usuario_id=user.id,
            accion='nuevo_modulo',
            detalles=f'Creó módulo: {modulo.titulo}',
            fecha=datetime.utcnow()
        )
        try:
            db.session.add(log_actividad)
            db.session.commit()
        except Exception:
            db.session.rollback()
        
        return jsonify({
            'success': True,
            'data': {
                'id': modulo.id,
                'titulo': modulo.titulo,
                'descripcion': modulo.descripcion,
                'orden': modulo.orden,
                'estado': modulo.estado
            },
            'message': 'Módulo creado exitosamente'
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating module: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al crear módulo'
        }), 500

@instructor_bp.route('/modulo/<int:modulo_id>', methods=['PUT'])
@cross_origin()
def update_module(modulo_id):
    """Actualizar módulo"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Verificar que el módulo pertenece a un curso del instructor
        modulo = db.session.query(Modulo).join(Curso).filter(
            Modulo.id == modulo_id,
            Curso.instructor_id == user.id
        ).first()
        
        if not modulo:
            return jsonify({
                'success': False,
                'error': 'Módulo no encontrado'
            }), 404
        
        data = request.get_json()
        
        # Actualizar campos
        if 'titulo' in data:
            modulo.titulo = data['titulo']
        if 'descripcion' in data:
            modulo.descripcion = data['descripcion']
        if 'orden' in data:
            modulo.orden = data['orden']
        if 'duracion_estimada' in data:
            modulo.duracion_estimada = data['duracion_estimada']
        if 'estado' in data:
            modulo.estado = data['estado']
        
        modulo.fecha_actualizacion = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {
                'id': modulo.id,
                'titulo': modulo.titulo,
                'descripcion': modulo.descripcion,
                'orden': modulo.orden,
                'estado': modulo.estado
            },
            'message': 'Módulo actualizado exitosamente'
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating module: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al actualizar módulo'
        }), 500

@instructor_bp.route('/modulo/<int:modulo_id>', methods=['DELETE'])
@cross_origin()
def delete_module(modulo_id):
    """Eliminar módulo"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Verificar que el módulo pertenece a un curso del instructor
        modulo = db.session.query(Modulo).join(Curso).filter(
            Modulo.id == modulo_id,
            Curso.instructor_id == user.id
        ).first()
        
        if not modulo:
            return jsonify({
                'success': False,
                'error': 'Módulo no encontrado'
            }), 404
        
        # Verificar que no tenga lecciones
        lecciones = Leccion.query.filter_by(modulo_id=modulo_id).count()
        if lecciones > 0:
            return jsonify({
                'success': False,
                'error': 'No se puede eliminar un módulo que contiene lecciones'
            }), 400
        
        db.session.delete(modulo)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Módulo eliminado exitosamente'
        }), 200
        
    except Exception as e:
        logger.error(f"Error deleting module: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al eliminar módulo'
        }), 500

@instructor_bp.route('/recursos', methods=['GET'])
@cross_origin()
def get_instructor_resources():
    """Obtener recursos del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        recursos = Recurso.query.filter_by(subido_por=user.id).order_by(
            Recurso.fecha_creacion.desc()
        ).all()
        
        recursos_data = []
        for recurso in recursos:
            recursos_data.append(recurso.to_dict())
        
        return jsonify({
            'success': True,
            'data': recursos_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting instructor resources: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener recursos'
        }), 500

@instructor_bp.route('/recurso/<int:recurso_id>', methods=['DELETE'])
@cross_origin()
def delete_resource(recurso_id):
    """Eliminar recurso"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        recurso = Recurso.query.filter_by(
            id=recurso_id, 
            subido_por=user.id
        ).first()
        
        if not recurso:
            return jsonify({
                'success': False,
                'error': 'Recurso no encontrado'
            }), 404
        
        # Eliminar de S3
        try:
            s3_client = get_s3_client()
            s3_client.delete_object(
                Bucket=recurso.s3_bucket,
                Key=recurso.s3_key
            )
        except Exception as e:
            logger.warning(f"Error deleting from S3: {str(e)}")
        
        # Eliminar de base de datos
        db.session.delete(recurso)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Recurso eliminado exitosamente'
        }), 200
        
    except Exception as e:
        logger.error(f"Error deleting resource: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al eliminar recurso'
        }), 500

@instructor_bp.route('/estadisticas', methods=['GET'])
@cross_origin()
def get_instructor_statistics():
    """Obtener estadísticas detalladas del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Cursos
        cursos = Curso.query.filter_by(instructor_id=user.id).all()
        total_cursos = len(cursos)
        
        # Estudiantes totales
        total_estudiantes = 0
        progreso_promedio = 0
        
        for curso in cursos:
            inscripciones = Inscripcion.query.filter_by(curso_id=curso.id).all()
            total_estudiantes += len(inscripciones)
            
            if inscripciones:
                progreso_curso = sum(inscripcion.progreso for inscripcion in inscripciones)
                progreso_promedio += progreso_curso / len(inscripciones)
        
        if total_cursos > 0:
            progreso_promedio = round(progreso_promedio / total_cursos, 1)
        
        # Recursos
        total_recursos = Recurso.query.filter_by(subido_por=user.id).count()
        
        # Módulos
        curso_ids = [curso.id for curso in cursos]
        total_modulos = 0
        if curso_ids:
            total_modulos = Modulo.query.filter(Modulo.curso_id.in_(curso_ids)).count()
        
        # Actividad reciente (últimos 7 días)
        fecha_limite = datetime.utcnow() - timedelta(days=7)
        actividad_reciente = LogActividad.query.filter(
            LogActividad.usuario_id == user.id,
            LogActividad.fecha >= fecha_limite
        ).count()
        
        return jsonify({
            'success': True,
            'data': {
                'totalCursos': total_cursos,
                'totalEstudiantes': total_estudiantes,
                'progresoPromedio': progreso_promedio,
                'totalRecursos': total_recursos,
                'totalModulos': total_modulos,
                'actividadReciente': actividad_reciente
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting instructor statistics: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener estadísticas'
        }), 500

# ==================== RUTAS PARA GESTIÓN DE CONTENIDO ====================

@instructor_bp.route('/content/courses/<int:course_id>/modules', methods=['GET'])
@cross_origin()
def get_course_modules(course_id):
    """Obtener módulos de un curso del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Verificar que el curso pertenece al instructor
        curso = Curso.query.filter_by(id=course_id, instructor_id=user.id).first()
        if not curso:
            return jsonify({
                'success': False,
                'error': 'Curso no encontrado'
            }), 404
        
        # Obtener módulos ordenados por orden
        modulos = Modulo.query.filter_by(curso_id=course_id).order_by(Modulo.orden).all()
        
        # Obtener información adicional para cada módulo
        module_dicts = []
        for modulo in modulos:
            module_dict = {
                'id': modulo.id,
                'titulo': modulo.titulo,
                'descripcion': modulo.descripcion,
                'orden': modulo.orden,
                'estado': modulo.estado,
                'curso_id': modulo.curso_id,
                'fecha_creacion': modulo.fecha_creacion.isoformat(),
                'fecha_actualizacion': modulo.fecha_actualizacion.isoformat()
            }
            
            # Obtener total de lecciones
            total_lecciones = Leccion.query.filter_by(modulo_id=modulo.id).count()
            module_dict['total_lecciones'] = total_lecciones
            
            module_dicts.append(module_dict)
        
        return jsonify({
            'success': True,
            'modules': module_dicts
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting course modules: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener módulos'
        }), 500

@instructor_bp.route('/content/courses/<int:course_id>/modules', methods=['POST'])
@cross_origin()
def create_content_module(course_id):
    """Crear nuevo módulo en un curso del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Verificar que el curso pertenece al instructor
        curso = Curso.query.filter_by(id=course_id, instructor_id=user.id).first()
        if not curso:
            return jsonify({
                'success': False,
                'error': 'Curso no encontrado'
            }), 404
        
        data = request.json
        
        # Validar campos obligatorios
        if not data.get('titulo'):
            return jsonify({
                'success': False,
                'error': 'El título del módulo es obligatorio'
            }), 400
        
        # Obtener el siguiente orden
        ultimo_modulo = Modulo.query.filter_by(curso_id=course_id).order_by(Modulo.orden.desc()).first()
        siguiente_orden = (ultimo_modulo.orden + 1) if ultimo_modulo else 1
        
        # Crear nuevo módulo
        modulo = Modulo(
            titulo=data['titulo'],
            descripcion=data.get('descripcion', ''),
            curso_id=course_id,
            orden=siguiente_orden,
            estado=data.get('estado', 'activo')
        )
        
        db.session.add(modulo)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Módulo creado exitosamente',
            'module': {
                'id': modulo.id,
                'titulo': modulo.titulo,
                'descripcion': modulo.descripcion,
                'orden': modulo.orden,
                'estado': modulo.estado,
                'curso_id': modulo.curso_id,
                'total_lecciones': 0
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating module: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al crear módulo'
        }), 500

@instructor_bp.route('/content/modules/<int:module_id>', methods=['PUT'])
@cross_origin()
def update_content_module(module_id):
    """Actualizar módulo del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Verificar que el módulo pertenece a un curso del instructor
        modulo = Modulo.query.join(Curso).filter(
            Modulo.id == module_id,
            Curso.instructor_id == user.id
        ).first()
        
        if not modulo:
            return jsonify({
                'success': False,
                'error': 'Módulo no encontrado'
            }), 404
        
        data = request.json
        
        # Actualizar campos
        if 'titulo' in data:
            modulo.titulo = data['titulo']
        if 'descripcion' in data:
            modulo.descripcion = data['descripcion']
        if 'estado' in data:
            modulo.estado = data['estado']
        
        modulo.fecha_actualizacion = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Módulo actualizado exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating module: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al actualizar módulo'
        }), 500

@instructor_bp.route('/content/modules/<int:module_id>', methods=['DELETE'])
@cross_origin()
def delete_content_module(module_id):
    """Eliminar módulo del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Verificar que el módulo pertenece a un curso del instructor
        modulo = Modulo.query.join(Curso).filter(
            Modulo.id == module_id,
            Curso.instructor_id == user.id
        ).first()
        
        if not modulo:
            return jsonify({
                'success': False,
                'error': 'Módulo no encontrado'
            }), 404
        
        # Eliminar lecciones asociadas
        Leccion.query.filter_by(modulo_id=module_id).delete()
        
        # Eliminar módulo
        db.session.delete(modulo)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Módulo eliminado exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting module: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al eliminar módulo'
        }), 500

@instructor_bp.route('/content/modules/<int:module_id>/lessons', methods=['GET'])
@cross_origin()
def get_module_lessons(module_id):
    """Obtener lecciones de un módulo del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Verificar que el módulo pertenece a un curso del instructor
        modulo = Modulo.query.join(Curso).filter(
            Modulo.id == module_id,
            Curso.instructor_id == user.id
        ).first()
        
        if not modulo:
            return jsonify({
                'success': False,
                'error': 'Módulo no encontrado'
            }), 404
        
        # Obtener lecciones ordenadas por orden
        lecciones = Leccion.query.filter_by(modulo_id=module_id).order_by(Leccion.orden).all()
        
        lesson_dicts = []
        for leccion in lecciones:
            lesson_dict = {
                'id': leccion.id,
                'titulo': leccion.titulo,
                'descripcion': leccion.descripcion,
                'contenido': leccion.contenido,
                'tipo': leccion.tipo,
                'duracion_minutos': leccion.duracion_minutos,
                'url_video': leccion.url_video,
                'archivo_url': leccion.archivo_url,
                'orden': leccion.orden,
                'estado': leccion.estado,
                'modulo_id': leccion.modulo_id,
                'fecha_creacion': leccion.fecha_creacion.isoformat(),
                'fecha_actualizacion': leccion.fecha_actualizacion.isoformat()
            }
            lesson_dicts.append(lesson_dict)
        
        return jsonify({
            'success': True,
            'lessons': lesson_dicts
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting module lessons: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener lecciones'
        }), 500

@instructor_bp.route('/content/modules/<int:module_id>/lessons', methods=['POST'])
@cross_origin()
def create_module_lesson(module_id):
    """Crear nueva lección en un módulo del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Verificar que el módulo pertenece a un curso del instructor
        modulo = Modulo.query.join(Curso).filter(
            Modulo.id == module_id,
            Curso.instructor_id == user.id
        ).first()
        
        if not modulo:
            return jsonify({
                'success': False,
                'error': 'Módulo no encontrado'
            }), 404
        
        data = request.json
        
        # Validar campos obligatorios
        if not data.get('titulo'):
            return jsonify({
                'success': False,
                'error': 'El título de la lección es obligatorio'
            }), 400
        
        # Obtener el siguiente orden
        ultima_leccion = Leccion.query.filter_by(modulo_id=module_id).order_by(Leccion.orden.desc()).first()
        siguiente_orden = (ultima_leccion.orden + 1) if ultima_leccion else 1
        
        # Crear nueva lección
        leccion = Leccion(
            titulo=data['titulo'],
            descripcion=data.get('descripcion', ''),
            contenido=data.get('contenido', ''),
            tipo=data.get('tipo', 'texto'),
            duracion_minutos=data.get('duracion_minutos', 0),
            url_video=data.get('url_video', ''),
            archivo_url=data.get('archivo_url', ''),
            modulo_id=module_id,
            orden=siguiente_orden,
            estado=data.get('estado', 'activo')
        )
        
        db.session.add(leccion)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Lección creada exitosamente',
            'lesson': {
                'id': leccion.id,
                'titulo': leccion.titulo,
                'descripcion': leccion.descripcion,
                'contenido': leccion.contenido,
                'tipo': leccion.tipo,
                'duracion_minutos': leccion.duracion_minutos,
                'url_video': leccion.url_video,
                'archivo_url': leccion.archivo_url,
                'orden': leccion.orden,
                'estado': leccion.estado,
                'modulo_id': leccion.modulo_id,
                'fecha_creacion': leccion.fecha_creacion.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating lesson: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al crear lección'
        }), 500

@instructor_bp.route('/content/lessons/<int:lesson_id>', methods=['PUT'])
@cross_origin()
def update_content_lesson(lesson_id):
    """Actualizar lección del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Verificar que la lección pertenece a un módulo de un curso del instructor
        leccion = Leccion.query.join(Modulo).join(Curso).filter(
            Leccion.id == lesson_id,
            Curso.instructor_id == user.id
        ).first()
        
        if not leccion:
            return jsonify({
                'success': False,
                'error': 'Lección no encontrada'
            }), 404
        
        data = request.json
        
        # Actualizar campos
        if 'titulo' in data:
            leccion.titulo = data['titulo']
        if 'descripcion' in data:
            leccion.descripcion = data['descripcion']
        if 'contenido' in data:
            leccion.contenido = data['contenido']
        if 'tipo' in data:
            leccion.tipo = data['tipo']
        if 'duracion_minutos' in data:
            leccion.duracion_minutos = data['duracion_minutos']
        if 'url_video' in data:
            leccion.url_video = data['url_video']
        if 'archivo_url' in data:
            leccion.archivo_url = data['archivo_url']
        if 'estado' in data:
            leccion.estado = data['estado']
        
        leccion.fecha_actualizacion = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Lección actualizada exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating lesson: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al actualizar lección'
        }), 500

@instructor_bp.route('/content/lessons/<int:lesson_id>', methods=['DELETE'])
@cross_origin()
def delete_content_lesson(lesson_id):
    """Eliminar lección del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Verificar que la lección pertenece a un módulo de un curso del instructor
        leccion = Leccion.query.join(Modulo).join(Curso).filter(
            Leccion.id == lesson_id,
            Curso.instructor_id == user.id
        ).first()
        
        if not leccion:
            return jsonify({
                'success': False,
                'error': 'Lección no encontrada'
            }), 404
        
        # Eliminar lección
        db.session.delete(leccion)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Lección eliminada exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting lesson: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al eliminar lección'
        }), 500 

@instructor_bp.route('/curso/<int:curso_id>', methods=['DELETE'])
@cross_origin()
def delete_course(curso_id):
    """Eliminar curso del instructor"""
    try:
        # Verificar sesión
        from flask import session
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'No hay sesión activa'
            }), 401
        
        # Verificar que el usuario es instructor
        user = User.query.get(user_id)
        if not user or user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        # Buscar curso del instructor
        curso = Curso.query.filter_by(id=curso_id, instructor_id=user.id).first()
        if not curso:
            return jsonify({
                'success': False,
                'error': 'Curso no encontrado'
            }), 404
        
        # Verificar inscripciones (no eliminar si hay estudiantes inscritos)
        from src.models import Inscripcion
        inscripciones_count = Inscripcion.query.filter_by(curso_id=curso.id).count()
        if inscripciones_count > 0:
            return jsonify({
                'success': False,
                'error': 'No se puede eliminar un curso que tiene estudiantes inscritos'
            }), 400
        
        db.session.delete(curso)
        db.session.commit()
        
        # Registrar actividad
        try:
            log_actividad = LogActividad(
                usuario_id=user.id,
                accion='eliminar_curso',
                detalles=f'Eliminó el curso: {curso.titulo}',
                fecha=datetime.utcnow()
            )
            db.session.add(log_actividad)
            db.session.commit()
        except Exception:
            db.session.rollback()
        
        return jsonify({
            'success': True,
            'message': 'Curso eliminado exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting course: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al eliminar curso'
        }), 500 