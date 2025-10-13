from flask import Blueprint, jsonify, request, session, send_file
from src.models import db, EvidenciaFuncionamiento, User, LogActividad
from datetime import datetime
from src.routes.admin import require_admin
import io

evidencias_bp = Blueprint('evidencias', __name__)

@evidencias_bp.route('/evidencias', methods=['POST'])
def upload_evidencias():
    """Subir evidencias de funcionamiento (2 archivos según tipo)"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'No autorizado'}), 401

        # Verificar que el usuario esté en fase seguimiento
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Verificar fase actual
        fase_actual = getattr(user, 'fase_actual', None)
        if fase_actual != 'seguimiento':
            return jsonify({'error': 'Solo disponible en fase de seguimiento'}), 403

        # Obtener datos del formulario
        tipo = request.form.get('tipo')
        observaciones = request.form.get('observaciones', '')
        
        if not tipo or tipo not in ['formal', 'informal']:
            return jsonify({'error': 'Tipo de emprendimiento es obligatorio (formal/informal)'}), 400

        # Verificar archivos
        archivo1 = request.files.get('archivo1')
        archivo2 = request.files.get('archivo2')
        
        if not archivo1 or not archivo2:
            return jsonify({'error': 'Se requieren ambos archivos'}), 400

        # Verificar que no exista una evidencia previa
        evidencia_existente = EvidenciaFuncionamiento.query.filter_by(user_id=user_id).first()
        if evidencia_existente:
            return jsonify({'error': 'Ya tienes evidencias subidas. Contacta al administrador para actualizar.'}), 409

        # Crear nueva evidencia
        nueva_evidencia = EvidenciaFuncionamiento(
            user_id=user_id,
            tipo=tipo,
            archivo1=archivo1.read(),
            archivo1_nombre=archivo1.filename,
            archivo2=archivo2.read(),
            archivo2_nombre=archivo2.filename,
            observaciones=observaciones,
            estado_revision='pendiente'
        )

        db.session.add(nueva_evidencia)
        db.session.commit()

        # Log de actividad
        db.session.add(LogActividad(
            usuario_id=user_id,
            accion='subir_evidencias',
            detalles=f"Evidencias de funcionamiento subidas. Tipo: {tipo}. Archivos: {archivo1.filename}, {archivo2.filename}"
        ))
        db.session.commit()

        return jsonify({
            'message': 'Evidencias subidas exitosamente',
            'evidencia': nueva_evidencia.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al subir evidencias: {str(e)}'}), 500

@evidencias_bp.route('/evidencias/me', methods=['GET'])
def get_my_evidencias():
    """Obtener evidencias del usuario actual"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'No autorizado'}), 401
        
        # Verificar si la tabla existe
        try:
            evidencias = EvidenciaFuncionamiento.query.filter_by(user_id=user_id).all()
            return jsonify({
                'evidencias': [evidencia.to_dict() for evidencia in evidencias]
            }), 200
        except Exception as db_error:
            # Si la tabla no existe, retornar lista vacía
            return jsonify({
                'evidencias': []
            }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error al obtener evidencias: {str(e)}'}), 500

@evidencias_bp.route('/evidencias/<int:user_id>', methods=['GET'])
def get_evidencias_usuario(user_id):
    """Obtener evidencias de un usuario específico"""
    try:
        # Verificar autorización
        session_user_id = session.get('user_id')
        if not session_user_id:
            return jsonify({'error': 'No autorizado'}), 401
        
        # Solo el usuario puede ver sus evidencias, o un admin
        if session_user_id != user_id:
            user = User.query.get(session_user_id)
            if not user or user.rol != 'admin':
                return jsonify({'error': 'No autorizado para ver estas evidencias'}), 403

        evidencias = EvidenciaFuncionamiento.query.filter_by(user_id=user_id).all()
        
        return jsonify({
            'evidencias': [evidencia.to_dict() for evidencia in evidencias]
        }), 200

    except Exception as e:
        return jsonify({'error': f'Error al obtener evidencias: {str(e)}'}), 500

def get_evidencias_usuario_internal(user_id):
    """Función interna para obtener evidencias de un usuario"""
    try:
        evidencias = EvidenciaFuncionamiento.query.filter_by(user_id=user_id).all()
        
        return jsonify({
            'evidencias': [evidencia.to_dict() for evidencia in evidencias]
        }), 200

    except Exception as e:
        return jsonify({'error': f'Error al obtener evidencias: {str(e)}'}), 500

@evidencias_bp.route('/evidencias', methods=['GET'])
@require_admin
def get_all_evidencias():
    """Obtener todas las evidencias (solo admin)"""
    try:
        # Parámetros de filtro
        tipo = request.args.get('tipo')
        estado = request.args.get('estado')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        query = EvidenciaFuncionamiento.query

        # Aplicar filtros
        if tipo:
            query = query.filter_by(tipo=tipo)
        if estado:
            query = query.filter_by(estado_revision=estado)

        # Ordenar por fecha de subida (más recientes primero)
        query = query.order_by(EvidenciaFuncionamiento.fecha_subida.desc())

        # Paginación
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        evidencias = pagination.items

        return jsonify({
            'evidencias': [evidencia.to_dict() for evidencia in evidencias],
            'pagination': {
                'page': pagination.page,
                'pages': pagination.pages,
                'per_page': pagination.per_page,
                'total': pagination.total,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200

    except Exception as e:
        return jsonify({'error': f'Error al obtener evidencias: {str(e)}'}), 500

@evidencias_bp.route('/evidencias/<int:evidencia_id>', methods=['PUT'])
@require_admin
def update_evidencia(evidencia_id):
    """Actualizar estado y observaciones de una evidencia (solo admin)"""
    try:
        evidencia = EvidenciaFuncionamiento.query.get_or_404(evidencia_id)
        data = request.json

        estado_anterior = evidencia.estado_revision
        nueva_estado = data.get('estado_revision')
        observaciones = data.get('observaciones')

        if nueva_estado and nueva_estado not in ['pendiente', 'aprobado', 'rechazado']:
            return jsonify({'error': 'Estado de revisión no válido'}), 400

        # Actualizar estado
        if nueva_estado:
            evidencia.estado_revision = nueva_estado
            evidencia.fecha_revision = datetime.utcnow()
            evidencia.revisado_por = session.get('user_id')

        # Actualizar observaciones
        if observaciones is not None:
            evidencia.observaciones = observaciones

        db.session.commit()

        # Si se aprueba, marcar fase como completada
        if nueva_estado == 'aprobado':
            user = evidencia.user
            if hasattr(user, 'fase_actual') and user.fase_actual == 'seguimiento':
                user.fase_actual = 'seguimiento_completado'
                db.session.commit()

                # Log de cambio de fase
                db.session.add(LogActividad(
                    usuario_id=user.id,
                    accion='completar_fase_seguimiento',
                    detalles=f"Fase de seguimiento completada tras aprobación de evidencias de funcionamiento"
                ))
                db.session.commit()

        # Log de actividad
        detalles_log = f"Evidencia de funcionamiento (ID: {evidencia_id}) actualizada por admin."
        if nueva_estado and nueva_estado != estado_anterior:
            detalles_log += f" Estado: {estado_anterior} -> {nueva_estado}."

        db.session.add(LogActividad(
            usuario_id=session.get('user_id'),
            accion='revisar_evidencias',
            detalles=detalles_log
        ))
        db.session.commit()

        return jsonify({
            'message': 'Evidencia actualizada exitosamente',
            'evidencia': evidencia.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error al actualizar evidencia: {str(e)}'}), 500

@evidencias_bp.route('/evidencias/<int:evidencia_id>/archivo/<int:numero>', methods=['GET'])
@require_admin
def download_archivo(evidencia_id, numero):
    """Descargar un archivo específico de una evidencia (solo admin)"""
    try:
        evidencia = EvidenciaFuncionamiento.query.get_or_404(evidencia_id)
        
        archivo_info = evidencia.get_archivo_info(numero)
        if not archivo_info or not archivo_info['contenido']:
            return jsonify({'error': 'Archivo no encontrado'}), 404

        # Crear archivo en memoria
        archivo_io = io.BytesIO(archivo_info['contenido'])
        
        return send_file(
            archivo_io,
            as_attachment=True,
            download_name=archivo_info['nombre'],
            mimetype='application/pdf'
        )

    except Exception as e:
        return jsonify({'error': f'Error al descargar archivo: {str(e)}'}), 500

@evidencias_bp.route('/evidencias/estadisticas', methods=['GET'])
@require_admin
def get_evidencias_estadisticas():
    """Obtener estadísticas de evidencias (solo admin)"""
    try:
        total_evidencias = EvidenciaFuncionamiento.query.count()
        evidencias_pendientes = EvidenciaFuncionamiento.query.filter_by(estado_revision='pendiente').count()
        evidencias_aprobadas = EvidenciaFuncionamiento.query.filter_by(estado_revision='aprobado').count()
        evidencias_rechazadas = EvidenciaFuncionamiento.query.filter_by(estado_revision='rechazado').count()
        
        evidencias_formales = EvidenciaFuncionamiento.query.filter_by(tipo='formal').count()
        evidencias_informales = EvidenciaFuncionamiento.query.filter_by(tipo='informal').count()

        return jsonify({
            'total': total_evidencias,
            'pendientes': evidencias_pendientes,
            'aprobadas': evidencias_aprobadas,
            'rechazadas': evidencias_rechazadas,
            'formales': evidencias_formales,
            'informales': evidencias_informales
        }), 200

    except Exception as e:
        return jsonify({'error': f'Error al obtener estadísticas: {str(e)}'}), 500
