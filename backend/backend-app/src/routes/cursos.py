from flask import Blueprint, jsonify, request, session
from src.models import db, Curso, UsuarioCurso, User, LogActividad
from datetime import datetime

cursos_bp = Blueprint('cursos', __name__)

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

@cursos_bp.route('/cursos', methods=['GET'])
def get_cursos():
    """Obtener todos los cursos disponibles"""
    try:
        # Filtrar solo cursos activos para usuarios normales
        user_id = session.get('user_id')
        if user_id:
            user = User.query.get(user_id)
            if user and user.rol == 'admin':
                # Admin ve todos los cursos
                cursos = Curso.query.order_by(Curso.created_at.desc()).all()
            else:
                # Usuario normal ve solo cursos activos
                cursos = Curso.query.filter_by(activo=True).order_by(Curso.created_at.desc()).all()
        else:
            # Sin autenticación, solo cursos activos
            cursos = Curso.query.filter_by(activo=True).order_by(Curso.created_at.desc()).all()
        
        return jsonify({
            'cursos': [curso.to_dict() for curso in cursos],
            'total': len(cursos)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener cursos: {str(e)}'}), 500

@cursos_bp.route('/cursos', methods=['POST'])
@require_admin
def create_curso():
    """Crear un nuevo curso (solo admin)"""
    try:
        data = request.json
        
        # Validar campos obligatorios
        if not data.get('titulo'):
            return jsonify({'error': 'El título es obligatorio'}), 400
        
        if not data.get('tipo'):
            return jsonify({'error': 'El tipo es obligatorio'}), 400
        
        # Validar tipo
        tipos_validos = ['video', 'pdf', 'quiz', 'otro']
        if data['tipo'] not in tipos_validos:
            return jsonify({'error': f'Tipo no válido. Tipos permitidos: {tipos_validos}'}), 400
        
        # Crear curso
        curso = Curso(
            titulo=data['titulo'],
            descripcion=data.get('descripcion', ''),
            tipo=data['tipo'],
            url=data.get('url', ''),
            activo=data.get('activo', True)
        )
        
        db.session.add(curso)
        db.session.commit()
        
        # Log de actividad
        db.session.add(LogActividad(
            usuario_id=session['user_id'],
            accion='curso_creado',
            detalles=f"Curso creado: {curso.titulo}"
        ))
        db.session.commit()
        
        return jsonify({
            'message': 'Curso creado exitosamente',
            'curso': curso.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al crear curso: {str(e)}'}), 500

@cursos_bp.route('/cursos/<int:curso_id>', methods=['PUT'])
@require_admin
def update_curso(curso_id):
    """Actualizar un curso (solo admin)"""
    try:
        curso = Curso.query.get_or_404(curso_id)
        data = request.json
        
        # Actualizar campos
        if 'titulo' in data:
            curso.titulo = data['titulo']
        if 'descripcion' in data:
            curso.descripcion = data['descripcion']
        if 'tipo' in data:
            tipos_validos = ['video', 'pdf', 'quiz', 'otro']
            if data['tipo'] not in tipos_validos:
                return jsonify({'error': f'Tipo no válido. Tipos permitidos: {tipos_validos}'}), 400
            curso.tipo = data['tipo']
        if 'url' in data:
            curso.url = data['url']
        if 'activo' in data:
            curso.activo = data['activo']
        
        curso.updated_at = datetime.utcnow()
        db.session.commit()
        
        # Log de actividad
        db.session.add(LogActividad(
            usuario_id=session['user_id'],
            accion='curso_actualizado',
            detalles=f"Curso actualizado: {curso.titulo}"
        ))
        db.session.commit()
        
        return jsonify({
            'message': 'Curso actualizado exitosamente',
            'curso': curso.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al actualizar curso: {str(e)}'}), 500

@cursos_bp.route('/cursos/<int:curso_id>/asignar/<int:user_id>', methods=['POST'])
@require_admin
def asignar_curso(curso_id, user_id):
    """Asignar un curso a un usuario (solo admin)"""
    try:
        curso = Curso.query.get_or_404(curso_id)
        user = User.query.get_or_404(user_id)
        
        # Verificar si ya está asignado
        asignacion_existente = UsuarioCurso.query.filter_by(
            user_id=user_id, 
            curso_id=curso_id
        ).first()
        
        if asignacion_existente:
            return jsonify({'error': 'El curso ya está asignado a este usuario'}), 400
        
        # Crear asignación
        asignacion = UsuarioCurso(
            user_id=user_id,
            curso_id=curso_id,
            estado='pendiente'
        )
        
        db.session.add(asignacion)
        db.session.commit()
        
        # Log de actividad
        db.session.add(LogActividad(
            usuario_id=session['user_id'],
            accion='curso_asignado',
            detalles=f"Curso '{curso.titulo}' asignado a {user.nombre} {user.apellido}"
        ))
        db.session.commit()
        
        return jsonify({
            'message': f'Curso asignado exitosamente a {user.nombre} {user.apellido}',
            'asignacion': asignacion.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al asignar curso: {str(e)}'}), 500

@cursos_bp.route('/usuarios_cursos/<int:asignacion_id>', methods=['PUT'])
def update_curso_usuario(asignacion_id):
    """Actualizar el estado de un curso asignado"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'No autorizado'}), 401
        
        asignacion = UsuarioCurso.query.get_or_404(asignacion_id)
        
        # Verificar que el usuario puede modificar esta asignación
        if asignacion.user_id != user_id:
            # Solo admin puede modificar asignaciones de otros usuarios
            user = User.query.get(user_id)
            if not user or user.rol != 'admin':
                return jsonify({'error': 'No autorizado para modificar esta asignación'}), 403
        
        data = request.json
        estado_anterior = asignacion.estado
        
        # Actualizar estado
        if 'estado' in data:
            estados_validos = ['pendiente', 'en_progreso', 'completado']
            if data['estado'] not in estados_validos:
                return jsonify({'error': f'Estado no válido. Estados permitidos: {estados_validos}'}), 400
            asignacion.estado = data['estado']
            
            # Actualizar fechas según el estado
            if data['estado'] == 'en_progreso' and not asignacion.fecha_inicio:
                asignacion.fecha_inicio = datetime.utcnow()
            elif data['estado'] == 'completado' and not asignacion.fecha_completado:
                asignacion.fecha_completado = datetime.utcnow()
                asignacion.progreso = 100
        
        if 'progreso' in data:
            progreso = int(data['progreso'])
            if 0 <= progreso <= 100:
                asignacion.progreso = progreso
                # Si progreso es 100, marcar como completado
                if progreso == 100 and asignacion.estado != 'completado':
                    asignacion.estado = 'completado'
                    asignacion.fecha_completado = datetime.utcnow()
            else:
                return jsonify({'error': 'El progreso debe estar entre 0 y 100'}), 400
        
        asignacion.fecha_ultima_actividad = datetime.utcnow()
        db.session.commit()
        
        # Log de actividad
        db.session.add(LogActividad(
            usuario_id=asignacion.user_id,
            accion='curso_actualizado',
            detalles=f"Curso '{asignacion.curso.titulo}' cambió de {estado_anterior} a {asignacion.estado}"
        ))
        db.session.commit()
        
        return jsonify({
            'message': 'Estado del curso actualizado exitosamente',
            'asignacion': asignacion.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al actualizar curso: {str(e)}'}), 500

@cursos_bp.route('/usuarios/me/cursos', methods=['GET'])
def get_my_cursos():
    """Obtener cursos del usuario actual"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'No autorizado'}), 401
        
        return get_cursos_usuario_internal(user_id)
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener cursos: {str(e)}'}), 500

@cursos_bp.route('/usuarios/<int:user_id>/cursos', methods=['GET'])
def get_cursos_usuario(user_id):
    """Obtener cursos de un usuario específico"""
    try:
        # Verificar autorización
        session_user_id = session.get('user_id')
        if not session_user_id:
            return jsonify({'error': 'No autorizado'}), 401
        
        # Solo el usuario puede ver sus cursos, o un admin
        if session_user_id != user_id:
            user = User.query.get(session_user_id)
            if not user or user.rol != 'admin':
                return jsonify({'error': 'No autorizado para ver estos cursos'}), 403
        
        return get_cursos_usuario_internal(user_id)
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener cursos del usuario: {str(e)}'}), 500

def get_cursos_usuario_internal(user_id):
    """Función interna para obtener cursos de un usuario"""
    try:
        # Obtener cursos del usuario
        asignaciones = UsuarioCurso.query.filter_by(user_id=user_id).all()
        
        cursos_data = []
        for asignacion in asignaciones:
            curso_data = asignacion.to_dict_with_curso()
            cursos_data.append(curso_data)
        
        # Estadísticas
        total_cursos = len(asignaciones)
        cursos_completados = len([a for a in asignaciones if a.estado == 'completado'])
        cursos_en_progreso = len([a for a in asignaciones if a.estado == 'en_progreso'])
        cursos_pendientes = len([a for a in asignaciones if a.estado == 'pendiente'])
        
        return jsonify({
            'cursos': cursos_data,
            'estadisticas': {
                'total': total_cursos,
                'completados': cursos_completados,
                'en_progreso': cursos_en_progreso,
                'pendientes': cursos_pendientes,
                'progreso_general': round((cursos_completados / total_cursos * 100) if total_cursos > 0 else 0, 2)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener cursos del usuario: {str(e)}'}), 500

@cursos_bp.route('/cursos/<int:curso_id>/usuarios', methods=['GET'])
@require_admin
def get_usuarios_curso(curso_id):
    """Obtener usuarios asignados a un curso (solo admin)"""
    try:
        curso = Curso.query.get_or_404(curso_id)
        asignaciones = UsuarioCurso.query.filter_by(curso_id=curso_id).all()
        
        return jsonify({
            'curso': curso.to_dict_simple(),
            'usuarios': [asignacion.to_dict() for asignacion in asignaciones],
            'total_usuarios': len(asignaciones),
            'usuarios_completados': len([a for a in asignaciones if a.estado == 'completado'])
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener usuarios del curso: {str(e)}'}), 500
