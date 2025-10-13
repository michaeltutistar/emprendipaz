from flask import Blueprint, jsonify, request, session
from src.models import db, User, Curso, Modulo, Leccion
from datetime import datetime

content_bp = Blueprint('content', __name__)

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

# ==================== RUTAS PARA MÓDULOS ====================

@content_bp.route('/courses/<int:course_id>/modules', methods=['GET'])
@require_admin
def get_modules(course_id):
    """Obtener módulos de un curso"""
    try:
        # Verificar que el curso existe
        curso = Curso.query.get_or_404(course_id)
        
        # Obtener módulos ordenados por orden
        modulos = Modulo.query.filter_by(curso_id=course_id).order_by(Modulo.orden).all()
        
        # Obtener información adicional para cada módulo
        module_dicts = []
        for modulo in modulos:
            module_dict = modulo.to_dict()
            
            # Obtener total de lecciones
            total_lecciones = Leccion.query.filter_by(modulo_id=modulo.id).count()
            module_dict['total_lecciones'] = total_lecciones
            
            module_dicts.append(module_dict)
        
        return jsonify({
            'modules': module_dicts,
            'course': {
                'id': curso.id,
                'titulo': curso.titulo
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener módulos: {str(e)}'}), 500

@content_bp.route('/courses/<int:course_id>/modules', methods=['POST'])
@require_admin
def create_module(course_id):
    """Crear nuevo módulo"""
    try:
        # Verificar que el curso existe
        curso = Curso.query.get_or_404(course_id)
        
        data = request.json
        
        # Validar campos obligatorios
        if not data.get('titulo'):
            return jsonify({'error': 'El título del módulo es obligatorio'}), 400
        
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
            'message': 'Módulo creado exitosamente',
            'module': modulo.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al crear módulo: {str(e)}'}), 500

@content_bp.route('/modules/<int:module_id>', methods=['GET'])
@require_admin
def get_module(module_id):
    """Obtener módulo específico"""
    try:
        modulo = Modulo.query.get_or_404(module_id)
        module_dict = modulo.to_dict()
        
        # Obtener total de lecciones
        total_lecciones = Leccion.query.filter_by(modulo_id=modulo.id).count()
        module_dict['total_lecciones'] = total_lecciones
        
        return jsonify(module_dict), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener módulo: {str(e)}'}), 500

@content_bp.route('/modules/<int:module_id>', methods=['PUT'])
@require_admin
def update_module(module_id):
    """Actualizar módulo"""
    try:
        modulo = Modulo.query.get_or_404(module_id)
        data = request.json
        
        # Actualizar campos
        if 'titulo' in data:
            modulo.titulo = data['titulo']
        if 'descripcion' in data:
            modulo.descripcion = data['descripcion']
        if 'estado' in data:
            modulo.estado = data['estado']
        if 'orden' in data:
            modulo.orden = data['orden']
        
        modulo.fecha_actualizacion = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Módulo actualizado exitosamente',
            'module': modulo.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al actualizar módulo: {str(e)}'}), 500

@content_bp.route('/modules/<int:module_id>', methods=['DELETE'])
@require_admin
def delete_module(module_id):
    """Eliminar módulo"""
    try:
        modulo = Modulo.query.get_or_404(module_id)
        
        # Verificar si tiene lecciones
        if Leccion.query.filter_by(modulo_id=modulo.id).count() > 0:
            return jsonify({'error': 'No se puede eliminar un módulo que tiene lecciones'}), 400
        
        db.session.delete(modulo)
        db.session.commit()
        
        return jsonify({'message': 'Módulo eliminado exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al eliminar módulo: {str(e)}'}), 500

# ==================== RUTAS PARA LECCIONES ====================

@content_bp.route('/modules/<int:module_id>/lessons', methods=['GET'])
@require_admin
def get_lessons(module_id):
    """Obtener lecciones de un módulo"""
    try:
        # Verificar que el módulo existe
        modulo = Modulo.query.get_or_404(module_id)
        
        # Obtener lecciones ordenadas por orden
        lecciones = Leccion.query.filter_by(modulo_id=module_id).order_by(Leccion.orden).all()
        
        return jsonify({
            'lessons': [leccion.to_dict() for leccion in lecciones],
            'module': {
                'id': modulo.id,
                'titulo': modulo.titulo,
                'curso_id': modulo.curso_id
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener lecciones: {str(e)}'}), 500

@content_bp.route('/modules/<int:module_id>/lessons', methods=['POST'])
@require_admin
def create_lesson(module_id):
    """Crear nueva lección"""
    try:
        # Verificar que el módulo existe
        modulo = Modulo.query.get_or_404(module_id)
        
        data = request.json
        
        # Validar campos obligatorios
        if not data.get('titulo'):
            return jsonify({'error': 'El título de la lección es obligatorio'}), 400
        
        # Obtener el siguiente orden
        ultima_leccion = Leccion.query.filter_by(modulo_id=module_id).order_by(Leccion.orden.desc()).first()
        siguiente_orden = (ultima_leccion.orden + 1) if ultima_leccion else 1
        
        # Crear nueva lección
        leccion = Leccion(
            titulo=data['titulo'],
            descripcion=data.get('descripcion', ''),
            contenido=data.get('contenido', ''),
            modulo_id=module_id,
            orden=siguiente_orden,
            tipo=data.get('tipo', 'texto'),
            duracion_minutos=data.get('duracion_minutos', 0),
            url_video=data.get('url_video'),
            archivo_url=data.get('archivo_url'),
            estado=data.get('estado', 'activo')
        )
        
        db.session.add(leccion)
        db.session.commit()
        
        return jsonify({
            'message': 'Lección creada exitosamente',
            'lesson': leccion.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al crear lección: {str(e)}'}), 500

@content_bp.route('/lessons/<int:lesson_id>', methods=['GET'])
@require_admin
def get_lesson(lesson_id):
    """Obtener lección específica"""
    try:
        leccion = Leccion.query.get_or_404(lesson_id)
        return jsonify(leccion.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener lección: {str(e)}'}), 500

@content_bp.route('/lessons/<int:lesson_id>', methods=['PUT'])
@require_admin
def update_lesson(lesson_id):
    """Actualizar lección"""
    try:
        leccion = Leccion.query.get_or_404(lesson_id)
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
        if 'orden' in data:
            leccion.orden = data['orden']
        
        leccion.fecha_actualizacion = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Lección actualizada exitosamente',
            'lesson': leccion.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al actualizar lección: {str(e)}'}), 500

@content_bp.route('/lessons/<int:lesson_id>', methods=['DELETE'])
@require_admin
def delete_lesson(lesson_id):
    """Eliminar lección"""
    try:
        leccion = Leccion.query.get_or_404(lesson_id)
        
        db.session.delete(leccion)
        db.session.commit()
        
        return jsonify({'message': 'Lección eliminada exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al eliminar lección: {str(e)}'}), 500

# ==================== RUTAS PARA REORDENAR ====================

@content_bp.route('/modules/reorder', methods=['PUT'])
@require_admin
def reorder_modules():
    """Reordenar módulos"""
    try:
        data = request.json
        module_orders = data.get('module_orders', [])  # Lista de {id: module_id, orden: new_order}
        
        for item in module_orders:
            modulo = Modulo.query.get(item['id'])
            if modulo:
                modulo.orden = item['orden']
        
        db.session.commit()
        
        return jsonify({'message': 'Módulos reordenados exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al reordenar módulos: {str(e)}'}), 500

@content_bp.route('/lessons/reorder', methods=['PUT'])
@require_admin
def reorder_lessons():
    """Reordenar lecciones"""
    try:
        data = request.json
        lesson_orders = data.get('lesson_orders', [])  # Lista de {id: lesson_id, orden: new_order}
        
        for item in lesson_orders:
            leccion = Leccion.query.get(item['id'])
            if leccion:
                leccion.orden = item['orden']
        
        db.session.commit()
        
        return jsonify({'message': 'Lecciones reordenadas exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al reordenar lecciones: {str(e)}'}), 500 