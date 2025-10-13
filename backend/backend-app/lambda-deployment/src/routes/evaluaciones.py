from flask import Blueprint, request, jsonify
from datetime import datetime
from src.models import db, Evaluacion, CriterioEvaluacion, User, Sorteo
import logging
import pandas as pd
from io import BytesIO
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils.dataframe import dataframe_to_rows

logger = logging.getLogger(__name__)

evaluaciones_bp = Blueprint('evaluaciones', __name__)

@evaluaciones_bp.route('/admin/evaluaciones/usuarios', methods=['GET'])
def get_usuarios_para_evaluar():
    """Obtener lista de usuarios para evaluar"""
    try:
        # Obtener usuarios que no son admin
        usuarios = User.query.filter(User.rol != 'admin').all()
        
        usuarios_data = []
        for usuario in usuarios:
            # Obtener evaluaciones existentes
            evaluaciones = Evaluacion.query.filter_by(usuario_id=usuario.id).all()
            evaluaciones_dict = {eval.criterio_id: eval.to_dict() for eval in evaluaciones}
            
            # Calcular puntaje total
            puntaje_total = Evaluacion.obtener_puntaje_total_usuario(usuario.id)
            
            usuarios_data.append({
                'id': usuario.id,
                'nombre': usuario.nombre,
                'apellido': usuario.apellido,
                'email': usuario.email,
                'municipio': usuario.municipio,
                'emprendimiento_nombre': usuario.emprendimiento_nombre,
                'puntaje_total': puntaje_total,
                'evaluaciones': evaluaciones_dict,
                'evaluacion_completa': Evaluacion.verificar_evaluacion_completa(usuario.id)
            })
        
        return jsonify({
            'usuarios': usuarios_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting usuarios para evaluar: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@evaluaciones_bp.route('/admin/evaluaciones/criterios', methods=['GET'])
def get_criterios_evaluacion():
    """Obtener criterios de evaluación activos"""
    try:
        criterios = CriterioEvaluacion.query.filter_by(activo=True).order_by(CriterioEvaluacion.orden).all()
        
        return jsonify({
            'criterios': [criterio.to_dict() for criterio in criterios]
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting criterios: {str(e)}")
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@evaluaciones_bp.route('/admin/evaluaciones', methods=['POST'])
def crear_evaluacion():
    """Crear o actualizar una evaluación"""
    try:
        data = request.get_json()
        
        # Validaciones
        if not data.get('usuario_id') or not data.get('criterio_id'):
            return jsonify({'error': 'Usuario y criterio son obligatorios'}), 400
        
        if data.get('puntaje') is None:
            return jsonify({'error': 'Puntaje es obligatorio'}), 400
        
        # Obtener criterio para validar puntaje máximo
        criterio = CriterioEvaluacion.query.get(data['criterio_id'])
        if not criterio:
            return jsonify({'error': 'Criterio no encontrado'}), 404
        
        puntaje = int(data['puntaje'])
        if puntaje < 0 or puntaje > criterio.max_puntaje:
            return jsonify({'error': f'Puntaje debe estar entre 0 y {criterio.max_puntaje}'}), 400
        
        # Buscar evaluación existente
        evaluacion = Evaluacion.query.filter_by(
            usuario_id=data['usuario_id'],
            criterio_id=data['criterio_id']
        ).first()
        
        if evaluacion:
            # Actualizar evaluación existente
            evaluacion.puntaje = puntaje
            evaluacion.observaciones = data.get('observaciones', '')
            evaluacion.fecha_evaluacion = datetime.utcnow()
        else:
            # Crear nueva evaluación
            evaluacion = Evaluacion(
                evaluador_id=1,  # Temporal: usar ID del admin logueado
                usuario_id=data['usuario_id'],
                criterio_id=data['criterio_id'],
                puntaje=puntaje,
                observaciones=data.get('observaciones', '')
            )
            db.session.add(evaluacion)
        
        db.session.commit()
        
        # Calcular nuevo puntaje total
        puntaje_total = Evaluacion.obtener_puntaje_total_usuario(data['usuario_id'])
        
        return jsonify({
            'message': 'Evaluación guardada exitosamente',
            'evaluacion': evaluacion.to_dict(),
            'puntaje_total': puntaje_total
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating evaluacion: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@evaluaciones_bp.route('/admin/evaluaciones/<int:usuario_id>', methods=['GET'])
def get_evaluaciones_usuario(usuario_id):
    """Obtener evaluaciones de un usuario específico"""
    try:
        evaluaciones = Evaluacion.query.filter_by(usuario_id=usuario_id).all()
        puntaje_total = Evaluacion.obtener_puntaje_total_usuario(usuario_id)
        
        return jsonify({
            'evaluaciones': [eval.to_dict() for eval in evaluaciones],
            'puntaje_total': puntaje_total,
            'evaluacion_completa': Evaluacion.verificar_evaluacion_completa(usuario_id)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting evaluaciones usuario: {str(e)}")
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@evaluaciones_bp.route('/admin/evaluaciones/<int:evaluacion_id>', methods=['DELETE'])
def eliminar_evaluacion(evaluacion_id):
    """Eliminar una evaluación"""
    try:
        evaluacion = Evaluacion.query.get_or_404(evaluacion_id)
        usuario_id = evaluacion.usuario_id
        
        db.session.delete(evaluacion)
        db.session.commit()
        
        # Recalcular puntaje total
        puntaje_total = Evaluacion.obtener_puntaje_total_usuario(usuario_id)
        
        return jsonify({
            'message': 'Evaluación eliminada exitosamente',
            'puntaje_total': puntaje_total
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting evaluacion: {str(e)}")
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@evaluaciones_bp.route('/admin/evaluaciones/rankings', methods=['GET'])
def get_rankings():
    """Obtener rankings de usuarios ordenados por puntaje total"""
    try:
        # Obtener usuarios que no son admin
        usuarios = User.query.filter(User.rol != 'admin').all()
        
        rankings_data = []
        for usuario in usuarios:
            puntaje_total = Evaluacion.obtener_puntaje_total_usuario(usuario.id)
            evaluacion_completa = Evaluacion.verificar_evaluacion_completa(usuario.id)
            
            rankings_data.append({
                'id': usuario.id,
                'nombre': usuario.nombre,
                'apellido': usuario.apellido,
                'email': usuario.email,
                'municipio': usuario.municipio,
                'emprendimiento_nombre': usuario.emprendimiento_nombre,
                'puntaje_total': puntaje_total,
                'evaluacion_completa': evaluacion_completa,
                'fecha_inscripcion': usuario.fecha_creacion.isoformat() if usuario.fecha_creacion else None
            })
        
        # Ordenar por puntaje total (descendente) y luego por fecha de inscripción (ascendente)
        rankings_data.sort(key=lambda x: (-x['puntaje_total'], x['fecha_inscripcion'] or ''))
        
        return jsonify({
            'rankings': rankings_data
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting rankings: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@evaluaciones_bp.route('/admin/evaluaciones/exportar', methods=['GET'])
def exportar_rankings():
    """Exportar rankings a Excel"""
    try:
        # Obtener rankings
        usuarios = User.query.filter(User.rol != 'admin').all()
        
        rankings_data = []
        for usuario in usuarios:
            puntaje_total = Evaluacion.obtener_puntaje_total_usuario(usuario.id)
            evaluacion_completa = Evaluacion.verificar_evaluacion_completa(usuario.id)
            
            # Obtener evaluaciones detalladas
            evaluaciones = Evaluacion.query.filter_by(usuario_id=usuario.id).all()
            evaluaciones_dict = {}
            for eval in evaluaciones:
                evaluaciones_dict[eval.criterio.codigo] = {
                    'puntaje': eval.puntaje,
                    'max_puntaje': eval.criterio.max_puntaje,
                    'peso': float(eval.criterio.peso),
                    'observaciones': eval.observaciones or ''
                }
            
            rankings_data.append({
                'posicion': 0,  # Se calculará después
                'nombre_completo': f"{usuario.nombre} {usuario.apellido}",
                'email': usuario.email,
                'municipio': usuario.municipio,
                'emprendimiento_nombre': usuario.emprendimiento_nombre or 'Sin nombre',
                'puntaje_total': puntaje_total,
                'evaluacion_completa': 'Completa' if evaluacion_completa else 'Pendiente',
                'fecha_inscripcion': usuario.fecha_creacion.strftime('%Y-%m-%d') if usuario.fecha_creacion else '',
                **evaluaciones_dict
            })
        
        # Ordenar por puntaje total y asignar posiciones
        rankings_data.sort(key=lambda x: x['puntaje_total'], reverse=True)
        for i, ranking in enumerate(rankings_data, 1):
            ranking['posicion'] = i
        
        # Crear DataFrame
        df = pd.DataFrame(rankings_data)
        
        # Crear archivo Excel
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            # Hoja principal con rankings
            df_main = df[['posicion', 'nombre_completo', 'email', 'municipio', 'emprendimiento_nombre', 
                         'puntaje_total', 'evaluacion_completa', 'fecha_inscripcion']].copy()
            df_main.to_excel(writer, sheet_name='Rankings', index=False)
            
            # Hoja detallada con evaluaciones por criterio
            criterios = CriterioEvaluacion.query.filter_by(activo=True).order_by(CriterioEvaluacion.orden).all()
            criterios_columns = ['posicion', 'nombre_completo', 'email', 'municipio']
            
            # Crear columnas dinámicamente solo si existen en el DataFrame
            for criterio in criterios:
                col_puntaje = f'{criterio.codigo}_puntaje'
                col_max = f'{criterio.codigo}_max'
                col_peso = f'{criterio.codigo}_peso'
                col_obs = f'{criterio.codigo}_observaciones'
                
                if col_puntaje in df.columns:
                    criterios_columns.extend([col_puntaje, col_max, col_peso, col_obs])
            
            # Filtrar solo las columnas que existen
            criterios_columns = [col for col in criterios_columns if col in df.columns]
            
            if criterios_columns:
                df_detallado = df[criterios_columns].copy()
                df_detallado.to_excel(writer, sheet_name='Evaluaciones Detalladas', index=False)
        
        output.seek(0)
        
        return output.getvalue(), 200, {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': f'attachment; filename=rankings_evaluaciones_{datetime.now().strftime("%Y%m%d")}.xlsx'
        }
        
    except Exception as e:
        logger.error(f"Error exporting rankings: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@evaluaciones_bp.route('/admin/evaluaciones/empates', methods=['GET'])
def get_empates():
    """Obtener usuarios con empates en puntaje para sorteo"""
    try:
        # Obtener rankings con desempate automático
        usuarios = User.query.filter(User.rol != 'admin').all()
        
        rankings_data = []
        for usuario in usuarios:
            puntaje_total = Evaluacion.obtener_puntaje_total_usuario(usuario.id)
            evaluacion_completa = Evaluacion.verificar_evaluacion_completa(usuario.id)
            
            rankings_data.append({
                'id': usuario.id,
                'nombre': usuario.nombre,
                'apellido': usuario.apellido,
                'email': usuario.email,
                'municipio': usuario.municipio,
                'emprendimiento_nombre': usuario.emprendimiento_nombre,
                'puntaje_total': puntaje_total,
                'evaluacion_completa': evaluacion_completa,
                'fecha_inscripcion': usuario.fecha_creacion.isoformat() if usuario.fecha_creacion else None
            })
        
        # Ordenar por puntaje total (descendente) y luego por fecha de inscripción (ascendente)
        rankings_data.sort(key=lambda x: (-x['puntaje_total'], x['fecha_inscripcion'] or ''))
        
        # Identificar empates
        empates = {}
        for i, usuario in enumerate(rankings_data):
            puntaje = usuario['puntaje_total']
            if puntaje not in empates:
                empates[puntaje] = []
            empates[puntaje].append({**usuario, 'posicion': i + 1})
        
        # Filtrar solo empates con más de un participante
        empates_filtrados = {puntaje: participantes for puntaje, participantes in empates.items() 
                           if len(participantes) > 1 and puntaje > 0}
        
        return jsonify({
            'empates': empates_filtrados,
            'total_empates': len(empates_filtrados)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting empates: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@evaluaciones_bp.route('/admin/evaluaciones/sorteo', methods=['POST'])
def ejecutar_sorteo():
    """Ejecutar sorteo público para desempate"""
    try:
        data = request.get_json()
        
        if not data.get('participantes'):
            return jsonify({'error': 'Lista de participantes es obligatoria'}), 400
        
        if not data.get('descripcion'):
            return jsonify({'error': 'Descripción del sorteo es obligatoria'}), 400
        
        participantes = data['participantes']
        descripcion = data['descripcion']
        observaciones = data.get('observaciones', '')
        
        # Validar que hay al menos 2 participantes
        if len(participantes) < 2:
            return jsonify({'error': 'Se requieren al menos 2 participantes para el sorteo'}), 400
        
        # Ejecutar sorteo
        sorteo = Sorteo.ejecutar_sorteo(
            participantes=participantes,
            administrador_id=1,  # Temporal: usar ID del admin logueado
            descripcion=descripcion,
            observaciones=observaciones
        )
        
        return jsonify({
            'message': 'Sorteo ejecutado exitosamente',
            'sorteo': sorteo.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error executing sorteo: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@evaluaciones_bp.route('/admin/evaluaciones/sorteos', methods=['GET'])
def get_sorteos():
    """Obtener historial de sorteos"""
    try:
        sorteos = Sorteo.obtener_sorteos_recientes(limit=50)
        
        return jsonify({
            'sorteos': [sorteo.to_dict() for sorteo in sorteos]
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting sorteos: {str(e)}")
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500

@evaluaciones_bp.route('/admin/evaluaciones/sorteos/<int:sorteo_id>/acta', methods=['GET'])
def descargar_acta_sorteo(sorteo_id):
    """Descargar acta de sorteo en PDF"""
    try:
        sorteo = Sorteo.query.get_or_404(sorteo_id)
        
        if not sorteo.archivo_acta:
            return jsonify({'error': 'Acta de sorteo no disponible'}), 404
        
        return sorteo.archivo_acta, 200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': f'attachment; filename={sorteo.archivo_acta_nombre or f"acta_sorteo_{sorteo_id}.pdf"}'
        }
        
    except Exception as e:
        logger.error(f"Error downloading acta: {str(e)}")
        return jsonify({'error': f'Error interno del servidor: {str(e)}'}), 500
