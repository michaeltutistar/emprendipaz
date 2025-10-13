from flask import Blueprint, jsonify, request, session
from src.models import db, Activo, UsuarioActivo, User, LogActividad
from datetime import datetime
from src.routes.admin import require_admin  # Reutilizar el decorador de admin

activos_bp = Blueprint('activos', __name__)

@activos_bp.route('/activos', methods=['POST'])
@require_admin
def create_activo():
    """Crear un nuevo activo (solo admin)"""
    try:
        data = request.json
        nombre = data.get('nombre')
        descripcion = data.get('descripcion')
        categoria = data.get('categoria')
        valor_estimado = data.get('valor_estimado')
        activo = data.get('activo', True)

        if not nombre or not categoria:
            return jsonify({'error': 'Nombre y categoría son obligatorios'}), 400

        new_activo = Activo(
            nombre=nombre,
            descripcion=descripcion,
            categoria=categoria,
            valor_estimado=valor_estimado,
            activo=activo
        )
        db.session.add(new_activo)
        db.session.commit()

        db.session.add(LogActividad(
            usuario_id=session.get('user_id'),
            accion='crear_activo',
            detalles=f"Activo '{nombre}' creado por admin."
        ))
        db.session.commit()

        return jsonify({'message': 'Activo creado exitosamente', 'activo': new_activo.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al crear activo: {str(e)}'}), 500

@activos_bp.route('/activos', methods=['GET'])
def get_activos():
    """Listar activos disponibles (activos para todos, inactivos solo para admin)"""
    try:
        user_id = session.get('user_id')
        user = User.query.get(user_id) if user_id else None
        
        if user and user.rol == 'admin':
            activos = Activo.query.all()
        else:
            activos = Activo.query.filter_by(activo=True).all()
        
        return jsonify({'activos': [activo.to_dict() for activo in activos]}), 200

    except Exception as e:
        return jsonify({'error': f'Error al obtener activos: {str(e)}'}), 500

@activos_bp.route('/activos/<int:activo_id>', methods=['GET'])
def get_activo(activo_id):
    """Obtener detalles de un activo específico"""
    try:
        activo = Activo.query.get_or_404(activo_id)
        return jsonify({'activo': activo.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': f'Error al obtener activo: {str(e)}'}), 500

@activos_bp.route('/activos/<int:activo_id>', methods=['PUT'])
@require_admin
def update_activo(activo_id):
    """Actualizar un activo existente (solo admin)"""
    try:
        activo = Activo.query.get_or_404(activo_id)
        data = request.json

        activo.nombre = data.get('nombre', activo.nombre)
        activo.descripcion = data.get('descripcion', activo.descripcion)
        activo.categoria = data.get('categoria', activo.categoria)
        activo.valor_estimado = data.get('valor_estimado', activo.valor_estimado)
        activo.activo = data.get('activo', activo.activo)
        activo.updated_at = datetime.utcnow()

        db.session.commit()

        db.session.add(LogActividad(
            usuario_id=session.get('user_id'),
            accion='actualizar_activo',
            detalles=f"Activo '{activo.nombre}' (ID: {activo.id}) actualizado por admin."
        ))
        db.session.commit()

        return jsonify({'message': 'Activo actualizado exitosamente', 'activo': activo.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al actualizar activo: {str(e)}'}), 500

@activos_bp.route('/activos/<int:activo_id>/asignar/<int:user_id>', methods=['POST'])
@require_admin
def assign_activo_to_user(activo_id, user_id):
    """Asignar un activo a un usuario (solo admin)"""
    try:
        user = User.query.get_or_404(user_id)
        activo = Activo.query.get_or_404(activo_id)

        # Verificar si ya está asignado
        existing_assignment = UsuarioActivo.query.filter_by(user_id=user_id, activo_id=activo_id).first()
        if existing_assignment:
            return jsonify({'error': 'El activo ya está asignado a este usuario'}), 409

        new_assignment = UsuarioActivo(
            user_id=user_id,
            activo_id=activo_id,
            estado='pendiente',
            fecha_asignacion=datetime.utcnow()
        )
        db.session.add(new_assignment)
        db.session.commit()

        db.session.add(LogActividad(
            usuario_id=session.get('user_id'),
            accion='asignar_activo',
            detalles=f"Activo '{activo.nombre}' (ID: {activo_id}) asignado a usuario {user.email} (ID: {user_id}) por admin."
        ))
        db.session.commit()

        return jsonify({'message': 'Activo asignado exitosamente', 'asignacion': new_assignment.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al asignar activo: {str(e)}'}), 500

@activos_bp.route('/usuarios_activos/<int:asignacion_id>', methods=['PUT'])
def update_usuario_activo_status(asignacion_id):
    """Actualizar el estado y observaciones de un activo asignado"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'No autorizado'}), 401

        # Verificar si es admin o el usuario propietario
        user = User.query.get(user_id)
        asignacion = UsuarioActivo.query.get_or_404(asignacion_id)
        
        if user.rol != 'admin' and asignacion.user_id != user_id:
            return jsonify({'error': 'No autorizado para modificar este activo'}), 403

        data = request.json
        new_estado = data.get('estado')
        observaciones = data.get('observaciones')
        fecha_entrega = data.get('fecha_entrega')

        if new_estado and new_estado not in ['pendiente', 'entregado', 'rechazado']:
            return jsonify({'error': 'Estado de activo no válido'}), 400

        old_estado = asignacion.estado

        if new_estado:
            asignacion.estado = new_estado
            if new_estado == 'entregado' and not asignacion.fecha_entrega:
                asignacion.fecha_entrega = datetime.utcnow().date()
            elif new_estado != 'entregado' and asignacion.fecha_entrega:
                asignacion.fecha_entrega = None

        if observaciones is not None:
            asignacion.observaciones = observaciones
            
        if fecha_entrega:
            try:
                asignacion.fecha_entrega = datetime.strptime(fecha_entrega, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}), 400
        
        asignacion.fecha_actualizacion = datetime.utcnow()

        db.session.commit()

        # Log de actividad
        detalles_log = f"Activo '{asignacion.activo.nombre}' (ID: {asignacion.activo_id}) de usuario {asignacion.user_id} actualizado."
        if new_estado and new_estado != old_estado:
            detalles_log += f" Estado: {old_estado} -> {new_estado}."

        db.session.add(LogActividad(
            usuario_id=user_id,
            accion='actualizar_activo_usuario',
            detalles=detalles_log
        ))
        db.session.commit()

        return jsonify({'message': 'Estado del activo asignado actualizado exitosamente', 'asignacion': asignacion.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al actualizar activo: {str(e)}'}), 500

@activos_bp.route('/usuarios/me/activos', methods=['GET'])
def get_my_activos():
    """Obtener activos del usuario actual"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'No autorizado'}), 401
        
        return get_activos_usuario_internal(user_id)
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener activos: {str(e)}'}), 500

@activos_bp.route('/usuarios/<int:user_id>/activos', methods=['GET'])
def get_activos_usuario(user_id):
    """Obtener activos de un usuario específico"""
    try:
        # Verificar autorización
        session_user_id = session.get('user_id')
        if not session_user_id:
            return jsonify({'error': 'No autorizado'}), 401
        
        # Solo el usuario puede ver sus activos, o un admin
        if session_user_id != user_id:
            user = User.query.get(session_user_id)
            if not user or user.rol != 'admin':
                return jsonify({'error': 'No autorizado para ver estos activos'}), 403
        
        return get_activos_usuario_internal(user_id)
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener activos del usuario: {str(e)}'}), 500

def get_activos_usuario_internal(user_id):
    """Función interna para obtener activos de un usuario"""
    try:
        # Obtener activos del usuario
        asignaciones = UsuarioActivo.query.filter_by(user_id=user_id).all()
        
        activos_data = []
        for asignacion in asignaciones:
            activo_data = asignacion.to_dict_with_activo()
            activos_data.append(activo_data)
        
        # Estadísticas
        total_activos = len(asignaciones)
        activos_entregados = len([a for a in asignaciones if a.estado == 'entregado'])
        activos_pendientes = len([a for a in asignaciones if a.estado == 'pendiente'])
        activos_rechazados = len([a for a in asignaciones if a.estado == 'rechazado'])
        
        return jsonify({
            'activos': activos_data,
            'estadisticas': {
                'total': total_activos,
                'entregados': activos_entregados,
                'pendientes': activos_pendientes,
                'rechazados': activos_rechazados,
                'progreso_general': round((activos_entregados / total_activos * 100) if total_activos > 0 else 0, 2)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener activos del usuario: {str(e)}'}), 500

@activos_bp.route('/activos/<int:activo_id>/usuarios', methods=['GET'])
@require_admin
def get_usuarios_activo(activo_id):
    """Obtener usuarios asignados a un activo (solo admin)"""
    try:
        asignaciones = UsuarioActivo.query.filter_by(activo_id=activo_id).all()
        usuarios_data = []
        for asignacion in asignaciones:
            user_info = asignacion.user.to_dict()
            usuarios_data.append({
                'asignacion_id': asignacion.id,
                'user_id': asignacion.user_id,
                'nombre': user_info.get('nombre'),
                'apellido': user_info.get('apellido'),
                'email': user_info.get('email'),
                'estado_asignacion': asignacion.estado,
                'fecha_entrega': asignacion.fecha_entrega.isoformat() if asignacion.fecha_entrega else None,
                'fecha_asignacion': asignacion.fecha_asignacion.isoformat()
            })
        return jsonify({'usuarios_asignados': usuarios_data}), 200
    except Exception as e:
        return jsonify({'error': f'Error al obtener usuarios asignados al activo: {str(e)}'}), 500
