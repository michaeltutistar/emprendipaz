from flask import Blueprint, jsonify, request, session
from src.models import db, User, Recurso, Curso, Modulo, Leccion
from src.services.s3_service import s3_service
from datetime import datetime
import os
import mimetypes

resources_bp = Blueprint('resources', __name__)

def require_admin(f):
    """Decorador para requerir rol de administrador"""
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'No autorizado'}), 401
        
        user = User.query.get(session['user_id'])
        if not user or user.rol != 'admin':
            return jsonify({'error': 'Acceso denegado. Se requiere rol de administrador'}), 403
        
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

def get_file_type(filename):
    """Determinar el tipo de archivo basado en la extensión"""
    extension = os.path.splitext(filename)[1].lower()
    
    type_mapping = {
        # Documentos
        '.pdf': 'pdf',
        '.doc': 'documento',
        '.docx': 'documento',
        '.txt': 'documento',
        '.rtf': 'documento',
        
        # Presentaciones
        '.ppt': 'presentacion',
        '.pptx': 'presentacion',
        
        # Hojas de cálculo
        '.xls': 'hoja_calculo',
        '.xlsx': 'hoja_calculo',
        '.csv': 'hoja_calculo',
        
        # Imágenes
        '.jpg': 'imagen',
        '.jpeg': 'imagen',
        '.png': 'imagen',
        '.gif': 'imagen',
        '.bmp': 'imagen',
        '.svg': 'imagen',
        '.webp': 'imagen',
        
        # Videos
        '.mp4': 'video',
        '.avi': 'video',
        '.mov': 'video',
        '.wmv': 'video',
        '.flv': 'video',
        '.webm': 'video',
        '.mkv': 'video',
        
        # Audio
        '.mp3': 'audio',
        '.wav': 'audio',
        '.ogg': 'audio',
        '.flac': 'audio',
        '.aac': 'audio',
        
        # Archivos comprimidos
        '.zip': 'zip',
        '.rar': 'zip',
        '.7z': 'zip',
        '.tar': 'zip',
        '.gz': 'zip'
    }
    
    return type_mapping.get(extension, 'archivo')

@resources_bp.route('/resources', methods=['GET'])
@require_admin
def get_resources():
    """Obtener lista de recursos con filtros"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        tipo = request.args.get('tipo')
        categoria = request.args.get('categoria')
        curso_id = request.args.get('curso_id', type=int)
        search = request.args.get('search')
        
        query = Recurso.query
        
        # Aplicar filtros
        if tipo:
            query = query.filter_by(tipo=tipo)
        if categoria:
            query = query.filter_by(categoria=categoria)
        if curso_id:
            query = query.filter_by(curso_id=curso_id)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Recurso.titulo.ilike(search_term)) |
                (Recurso.descripcion.ilike(search_term)) |
                (Recurso.nombre_original.ilike(search_term))
            )
        
        # Ordenar por fecha de creación (más recientes primero)
        query = query.order_by(Recurso.fecha_creacion.desc())
        
        # Paginación
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        resources = pagination.items
        
        # Obtener información adicional para cada recurso
        resource_dicts = []
        for resource in resources:
            resource_dict = resource.to_dict()
            
            # Obtener información del usuario que subió el recurso
            if resource.subido_por:
                user = User.query.get(resource.subido_por)
                if user:
                    resource_dict['subido_por_nombre'] = f"{user.nombre} {user.apellido}"
                else:
                    resource_dict['subido_por_nombre'] = 'Usuario no encontrado'
            else:
                resource_dict['subido_por_nombre'] = 'N/A'
            
            # Obtener información del curso si está asociado
            if resource.curso_id:
                course = Curso.query.get(resource.curso_id)
                if course:
                    resource_dict['curso_titulo'] = course.titulo
                else:
                    resource_dict['curso_titulo'] = 'Curso no encontrado'
            else:
                resource_dict['curso_titulo'] = None
            
            resource_dicts.append(resource_dict)
        
        return jsonify({
            'resources': resource_dicts,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener recursos: {str(e)}'}), 500

@resources_bp.route('/resources', methods=['POST'])
@require_admin
def upload_resource():
    """Subir nuevo recurso"""
    try:
        # Verificar que se envió un archivo
        if 'file' not in request.files:
            return jsonify({'error': 'No se proporcionó ningún archivo'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No se seleccionó ningún archivo'}), 400
        
        # Obtener datos del formulario
        titulo = request.form.get('titulo', file.filename)
        descripcion = request.form.get('descripcion', '')
        categoria = request.form.get('categoria', 'general')
        curso_id = request.form.get('curso_id', type=int)
        modulo_id = request.form.get('modulo_id', type=int)
        leccion_id = request.form.get('leccion_id', type=int)
        acceso_publico = request.form.get('acceso_publico', 'true').lower() == 'true'
        requiere_autenticacion = request.form.get('requiere_autenticacion', 'false').lower() == 'true'
        
        # Validar tamaño del archivo (máximo 100MB)
        file.seek(0, 2)  # Ir al final del archivo
        file_size = file.tell()
        file.seek(0)  # Volver al inicio
        
        if file_size > 100 * 1024 * 1024:  # 100MB
            return jsonify({'error': 'El archivo es demasiado grande. Máximo 100MB'}), 400
        
        # Determinar tipo de archivo
        tipo = get_file_type(file.filename)
        
        # Leer datos del archivo
        file_data = file.read()
        
        # Subir archivo a S3
        upload_result = s3_service.upload_file(
            file_data=file_data,
            filename=file.filename,
            content_type=file.content_type
        )
        
        if not upload_result['success']:
            return jsonify({'error': upload_result['error']}), 500
        
        # Crear registro en la base de datos
        recurso = Recurso(
            titulo=titulo,
            descripcion=descripcion,
            tipo=tipo,
            categoria=categoria,
            s3_key=upload_result['s3_key'],
            s3_url=upload_result['s3_url'],
            s3_bucket=upload_result['s3_bucket'],
            nombre_original=file.filename,
            extension=os.path.splitext(file.filename)[1],
            tamano_bytes=file_size,
            mime_type=file.content_type or 'application/octet-stream',
            curso_id=curso_id,
            modulo_id=modulo_id,
            leccion_id=leccion_id,
            subido_por=session['user_id'],
            acceso_publico=acceso_publico,
            requiere_autenticacion=requiere_autenticacion
        )
        
        db.session.add(recurso)
        db.session.commit()
        
        return jsonify({
            'message': 'Recurso subido exitosamente',
            'resource': recurso.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al subir recurso: {str(e)}'}), 500

@resources_bp.route('/resources/<int:resource_id>', methods=['GET'])
@require_admin
def get_resource(resource_id):
    """Obtener recurso específico"""
    try:
        recurso = Recurso.query.get_or_404(resource_id)
        resource_dict = recurso.to_dict()
        
        # Obtener información adicional
        if recurso.subido_por:
            user = User.query.get(recurso.subido_por)
            if user:
                resource_dict['subido_por_nombre'] = f"{user.nombre} {user.apellido}"
            else:
                resource_dict['subido_por_nombre'] = 'Usuario no encontrado'
        
        if recurso.curso_id:
            course = Curso.query.get(recurso.curso_id)
            if course:
                resource_dict['curso_titulo'] = course.titulo
            else:
                resource_dict['curso_titulo'] = 'Curso no encontrado'
        
        return jsonify(resource_dict), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener recurso: {str(e)}'}), 500

@resources_bp.route('/resources/<int:resource_id>', methods=['PUT'])
@require_admin
def update_resource(resource_id):
    """Actualizar recurso"""
    try:
        recurso = Recurso.query.get_or_404(resource_id)
        data = request.json
        
        # Actualizar campos permitidos
        if 'titulo' in data:
            recurso.titulo = data['titulo']
        if 'descripcion' in data:
            recurso.descripcion = data['descripcion']
        if 'categoria' in data:
            recurso.categoria = data['categoria']
        if 'estado' in data:
            recurso.estado = data['estado']
        if 'acceso_publico' in data:
            recurso.acceso_publico = data['acceso_publico']
        if 'requiere_autenticacion' in data:
            recurso.requiere_autenticacion = data['requiere_autenticacion']
        if 'curso_id' in data:
            recurso.curso_id = data['curso_id']
        if 'modulo_id' in data:
            recurso.modulo_id = data['modulo_id']
        if 'leccion_id' in data:
            recurso.leccion_id = data['leccion_id']
        
        recurso.fecha_actualizacion = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Recurso actualizado exitosamente',
            'resource': recurso.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al actualizar recurso: {str(e)}'}), 500

@resources_bp.route('/resources/<int:resource_id>', methods=['DELETE'])
@require_admin
def delete_resource(resource_id):
    """Eliminar recurso"""
    try:
        recurso = Recurso.query.get_or_404(resource_id)
        
        # Eliminar archivo de S3
        if s3_service.delete_file(recurso.s3_key):
            # Eliminar registro de la base de datos
            db.session.delete(recurso)
            db.session.commit()
            
            return jsonify({'message': 'Recurso eliminado exitosamente'}), 200
        else:
            return jsonify({'error': 'Error al eliminar archivo de S3'}), 500
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al eliminar recurso: {str(e)}'}), 500

@resources_bp.route('/resources/stats', methods=['GET'])
@require_admin
def get_resource_stats():
    """Obtener estadísticas de recursos"""
    try:
        # Estadísticas generales
        total_resources = Recurso.query.count()
        total_size = sum(r.tamano_bytes for r in Recurso.query.all())
        
        # Recursos por tipo
        tipos = db.session.query(Recurso.tipo, db.func.count(Recurso.id)).group_by(Recurso.tipo).all()
        recursos_por_tipo = {tipo: count for tipo, count in tipos}
        
        # Recursos por categoría
        categorias = db.session.query(Recurso.categoria, db.func.count(Recurso.id)).group_by(Recurso.categoria).all()
        recursos_por_categoria = {categoria: count for categoria, count in categorias}
        
        # Recursos por estado
        estados = db.session.query(Recurso.estado, db.func.count(Recurso.id)).group_by(Recurso.estado).all()
        recursos_por_estado = {estado: count for estado, count in estados}
        
        # Tamaño del bucket S3
        bucket_size = s3_service.get_bucket_size()
        
        return jsonify({
            'total_recursos': total_resources,
            'tamano_total_bytes': total_size,
            'tamano_total_formateado': s3_service.format_file_size(total_size),
            'tamano_bucket_s3_bytes': bucket_size,
            'tamano_bucket_s3_formateado': s3_service.format_file_size(bucket_size),
            'recursos_por_tipo': recursos_por_tipo,
            'recursos_por_categoria': recursos_por_categoria,
            'recursos_por_estado': recursos_por_estado
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener estadísticas: {str(e)}'}), 500

@resources_bp.route('/resources/categories', methods=['GET'])
@require_admin
def get_resource_categories():
    """Obtener categorías disponibles"""
    try:
        categorias = db.session.query(Recurso.categoria).distinct().all()
        return jsonify([cat[0] for cat in categorias if cat[0]]), 200
    except Exception as e:
        return jsonify({'error': f'Error al obtener categorías: {str(e)}'}), 500

@resources_bp.route('/resources/types', methods=['GET'])
@require_admin
def get_resource_types():
    """Obtener tipos de archivo disponibles"""
    try:
        tipos = db.session.query(Recurso.tipo).distinct().all()
        return jsonify([tipo[0] for tipo in tipos if tipo[0]]), 200
    except Exception as e:
        return jsonify({'error': f'Error al obtener tipos: {str(e)}'}), 500 