from flask import Blueprint, jsonify, request, session
from src.models import db, Notificacion, User
from datetime import datetime

notificaciones_bp = Blueprint('notificaciones', __name__)

@notificaciones_bp.route('/notificaciones', methods=['GET'])
def get_notificaciones():
    """Obtener notificaciones del usuario actual"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'No autorizado'}), 401
        
        # Obtener notificaciones del usuario, ordenadas por fecha descendente
        notificaciones = Notificacion.query.filter_by(user_id=user_id).order_by(Notificacion.fecha.desc()).all()
        
        return jsonify({
            'notificaciones': [notif.to_dict() for notif in notificaciones],
            'total': len(notificaciones),
            'no_leidas': len([n for n in notificaciones if not n.leida])
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener notificaciones: {str(e)}'}), 500

@notificaciones_bp.route('/notificaciones/<int:notificacion_id>/marcar-leida', methods=['POST'])
def marcar_como_leida(notificacion_id):
    """Marcar una notificación como leída"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'No autorizado'}), 401
        
        notificacion = Notificacion.query.filter_by(id=notificacion_id, user_id=user_id).first()
        if not notificacion:
            return jsonify({'error': 'Notificación no encontrada'}), 404
        
        notificacion.leida = True
        db.session.commit()
        
        return jsonify({'message': 'Notificación marcada como leída'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al marcar notificación: {str(e)}'}), 500

@notificaciones_bp.route('/notificaciones/marcar-todas-leidas', methods=['POST'])
def marcar_todas_como_leidas():
    """Marcar todas las notificaciones del usuario como leídas"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'No autorizado'}), 401
        
        notificaciones = Notificacion.query.filter_by(user_id=user_id, leida=False).all()
        for notif in notificaciones:
            notif.leida = True
        
        db.session.commit()
        
        return jsonify({
            'message': f'{len(notificaciones)} notificaciones marcadas como leídas'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al marcar notificaciones: {str(e)}'}), 500

def crear_notificacion_fase(user_id, fase_anterior, fase_nueva):
    """Función auxiliar para crear notificación de cambio de fase"""
    try:
        # Mensajes según la fase
        mensajes = {
            'inscripcion': 'Tu emprendimiento ha pasado a la fase de Inscripción y Selección',
            'formacion': 'Tu emprendimiento ha pasado a la fase de Formación',
            'entrega_activos': 'Tu emprendimiento ha pasado a la fase de Entrega de Activos Productivos'
        }
        
        mensaje = mensajes.get(fase_nueva, f'Tu emprendimiento ha pasado a la fase: {fase_nueva}')
        
        notificacion = Notificacion(
            user_id=user_id,
            mensaje=mensaje,
            fase_nueva=fase_nueva
        )
        
        db.session.add(notificacion)
        db.session.commit()
        
        return notificacion
        
    except Exception as e:
        db.session.rollback()
        print(f"Error al crear notificación: {str(e)}")
        return None
