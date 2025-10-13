from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import pandas as pd
import os
from datetime import datetime
from src.models import db, CriterioEvaluacion, LogActividad
# from src.decorators import require_admin  # Comentado temporalmente
import logging

logger = logging.getLogger(__name__)

criterios_bp = Blueprint('criterios', __name__)

@criterios_bp.route('/admin/criterios', methods=['GET'])
# @require_admin  # Comentado temporalmente
def get_criterios():
    """Obtener todos los criterios de evaluación"""
    try:
        # Verificar si la tabla existe
        criterios = CriterioEvaluacion.query.all()
        print(f"DEBUG: Encontrados {len(criterios)} criterios")
        
        return jsonify({
            'criterios': [criterio.to_dict() for criterio in criterios],
            'estadisticas': {
                'total_criterios': len(criterios),
                'total_peso': sum(float(c.peso) for c in criterios),
                'peso_valido': sum(float(c.peso) for c in criterios) == 100.0
            }
        }), 200
    except Exception as e:
        logger.error(f"Error getting criterios: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@criterios_bp.route('/admin/criterios', methods=['POST'])
# @require_admin  # Comentado temporalmente
def create_criterio():
    """Crear un nuevo criterio de evaluación"""
    try:
        data = request.get_json()
        print(f"DEBUG: Datos recibidos: {data}")
        
        # Validaciones
        if not data.get('codigo') or not data.get('descripcion'):
            return jsonify({'error': 'Código y descripción son obligatorios'}), 400
        
        # Verificar código único
        if CriterioEvaluacion.query.filter_by(codigo=data['codigo']).first():
            return jsonify({'error': 'El código ya existe'}), 400
        
        # Verificar orden único
        orden_value = int(data.get('orden', 0))
        if CriterioEvaluacion.query.filter_by(orden=orden_value).first():
            return jsonify({'error': 'El orden ya existe'}), 400
        
        # Crear criterio
        criterio = CriterioEvaluacion(
            codigo=data['codigo'],
            descripcion=data['descripcion'],
            peso=float(data.get('peso', 0)),
            max_puntaje=int(data.get('max_puntaje', 0)),
            orden=orden_value,
            observaciones=data.get('observaciones', '')
        )
        
        db.session.add(criterio)
        db.session.commit()
        
        # Log de auditoría (comentado temporalmente hasta implementar autenticación)
        # admin_id = request.user.id if hasattr(request, 'user') else None
        # if admin_id:
        #     log = LogActividad(
        #         usuario_id=admin_id,
        #         accion='CREAR_CRITERIO',
        #         detalles=f"Criterio creado: {criterio.codigo} - {criterio.descripcion[:50]}",
        #         fecha=datetime.utcnow()
        #     )
        #     db.session.add(log)
        #     db.session.commit()
        
        return jsonify({
            'message': 'Criterio creado exitosamente',
            'criterio': criterio.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating criterio: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@criterios_bp.route('/admin/criterios/<int:criterio_id>', methods=['PUT'])
# @require_admin  # Comentado temporalmente
def update_criterio(criterio_id):
    """Actualizar un criterio de evaluación"""
    try:
        criterio = CriterioEvaluacion.query.get_or_404(criterio_id)
        data = request.get_json()
        
        # Validaciones
        if 'codigo' in data and data['codigo'] != criterio.codigo:
            if CriterioEvaluacion.query.filter_by(codigo=data['codigo']).first():
                return jsonify({'error': 'El código ya existe'}), 400
        
        if 'orden' in data and data['orden'] != criterio.orden:
            orden_value = int(data['orden'])
            if CriterioEvaluacion.query.filter_by(orden=orden_value).first():
                return jsonify({'error': 'El orden ya existe'}), 400
        
        # Actualizar campos
        criterio.codigo = data.get('codigo', criterio.codigo)
        criterio.descripcion = data.get('descripcion', criterio.descripcion)
        criterio.peso = float(data.get('peso', criterio.peso))
        criterio.max_puntaje = int(data.get('max_puntaje', criterio.max_puntaje))
        if 'orden' in data:
            criterio.orden = int(data['orden'])
        criterio.activo = data.get('activo', criterio.activo)
        criterio.observaciones = data.get('observaciones', criterio.observaciones)
        criterio.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        # Log de auditoría (comentado temporalmente hasta implementar autenticación)
        # admin_id = request.user.id if hasattr(request, 'user') else None
        # if admin_id:
        #     log = LogActividad(
        #         usuario_id=admin_id,
        #         accion='ACTUALIZAR_CRITERIO',
        #         detalles=f"Criterio actualizado: {criterio.codigo} - {criterio.descripcion[:50]}",
        #         fecha=datetime.utcnow()
        #     )
        #     db.session.add(log)
        #     db.session.commit()
        
        return jsonify({
            'message': 'Criterio actualizado exitosamente',
            'criterio': criterio.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating criterio: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@criterios_bp.route('/admin/criterios/<int:criterio_id>', methods=['DELETE'])
# @require_admin  # Comentado temporalmente
def delete_criterio(criterio_id):
    """Eliminar un criterio de evaluación"""
    try:
        criterio = CriterioEvaluacion.query.get_or_404(criterio_id)
        
        # Log de auditoría (comentado temporalmente hasta implementar autenticación)
        # admin_id = request.user.id if hasattr(request, 'user') else None
        # if admin_id:
        #     log = LogActividad(
        #         usuario_id=admin_id,
        #         accion='ELIMINAR_CRITERIO',
        #         detalles=f"Criterio eliminado: {criterio.codigo} - {criterio.descripcion[:50]}",
        #         fecha=datetime.utcnow()
        #     )
        #     db.session.add(log)
        
        db.session.delete(criterio)
        db.session.commit()
        
        return jsonify({'message': 'Criterio eliminado exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting criterio: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@criterios_bp.route('/admin/criterios/validar-pesos', methods=['GET'])
# @require_admin  # Comentado temporalmente
def validar_pesos():
    """Validar que la suma de pesos sea 100"""
    try:
        es_valido = CriterioEvaluacion.validar_pesos()
        total_peso = CriterioEvaluacion.obtener_total_peso()
        
        return jsonify({
            'es_valido': es_valido,
            'total_peso': float(total_peso),
            'mensaje': 'Pesos válidos' if es_valido else f'Pesos inválidos. Total: {total_peso}% (debe ser 100%)'
        }), 200
        
    except Exception as e:
        logger.error(f"Error validating pesos: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@criterios_bp.route('/admin/criterios/importar', methods=['POST'])
# @require_admin  # Comentado temporalmente
def importar_criterios():
    """Importar criterios desde archivo Excel"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No se encontró archivo'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No se seleccionó archivo'}), 400
        
        if not file.filename.endswith(('.xlsx', '.xls')):
            return jsonify({'error': 'Formato de archivo no válido. Use Excel (.xlsx o .xls)'}), 400
        
        # Leer archivo Excel
        df = pd.read_excel(file)
        
        # Validar columnas requeridas
        columnas_requeridas = ['codigo', 'descripcion', 'peso', 'max_puntaje', 'orden']
        if not all(col in df.columns for col in columnas_requeridas):
            return jsonify({
                'error': f'Columnas requeridas: {", ".join(columnas_requeridas)}'
            }), 400
        
        criterios_creados = 0
        errores = []
        
        for index, row in df.iterrows():
            try:
                # Verificar código único
                if CriterioEvaluacion.query.filter_by(codigo=row['codigo']).first():
                    errores.append(f"Fila {index + 1}: Código '{row['codigo']}' ya existe")
                    continue
                
                # Verificar orden único
                if CriterioEvaluacion.query.filter_by(orden=int(row['orden'])).first():
                    errores.append(f"Fila {index + 1}: Orden '{row['orden']}' ya existe")
                    continue
                
                # Crear criterio
                criterio = CriterioEvaluacion(
                    codigo=str(row['codigo']),
                    descripcion=str(row['descripcion']),
                    peso=float(row['peso']),
                    max_puntaje=int(row['max_puntaje']),
                    orden=int(row['orden'])
                )
                
                db.session.add(criterio)
                criterios_creados += 1
                
            except Exception as e:
                errores.append(f"Fila {index + 1}: {str(e)}")
        
        db.session.commit()
        
        # Log de auditoría (comentado temporalmente hasta implementar autenticación)
        # admin_id = request.user.id if hasattr(request, 'user') else None
        # if admin_id:
        #     log = LogActividad(
        #         usuario_id=admin_id,
        #         accion='IMPORTAR_CRITERIOS',
        #         detalles=f"Importados {criterios_creados} criterios desde Excel",
        #         fecha=datetime.utcnow()
        #     )
        #     db.session.add(log)
        #     db.session.commit()
        
        return jsonify({
            'message': f'Importación completada. {criterios_creados} criterios creados',
            'criterios_creados': criterios_creados,
            'errores': errores
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error importing criterios: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@criterios_bp.route('/admin/criterios/estadisticas', methods=['GET'])
# @require_admin  # Comentado temporalmente
def get_estadisticas():
    """Obtener estadísticas de criterios"""
    try:
        estadisticas = CriterioEvaluacion.obtener_estadisticas()
        return jsonify(estadisticas), 200
        
    except Exception as e:
        logger.error(f"Error getting estadisticas: {str(e)}")
        return jsonify({'error': 'Error interno del servidor'}), 500
