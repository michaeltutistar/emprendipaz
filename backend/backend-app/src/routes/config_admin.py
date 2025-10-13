from flask import Blueprint, request, jsonify, session
from src.models import db
from src.models.formulario_campo import FormularioCampo
from src.models.criterio_evaluacion_config import CriterioEvaluacionConfig
from src.models.cupos_municipio_config import CuposMunicipioConfig
from src.models.documento_config import DocumentoConfig
from src.services.auth_service import token_required
import json

config_admin_bp = Blueprint('config_admin', __name__)

# ========== ENDPOINT TEMPORAL PARA CREAR TABLAS ==========

@config_admin_bp.route('/create-tables', methods=['GET', 'POST'])
def create_config_tables_public():
    """Endpoint público temporal para crear tablas"""
    try:
        # Crear todas las tablas
        db.create_all()
        
        # Verificar que las tablas existen
        inspector = db.inspect(db.engine)
        existing_tables = inspector.get_table_names()
        
        config_tables = [
            'formulario_campos',
            'criterios_evaluacion_config', 
            'cupos_municipio_config',
            'documentos_config'
        ]
        
        created_tables = []
        for table in config_tables:
            if table in existing_tables:
                created_tables.append(table)
        
        return jsonify({
            'message': 'Tablas de configuración creadas exitosamente',
            'created_tables': created_tables,
            'total_tables_in_db': len(existing_tables),
            'all_tables': existing_tables
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Error creando tablas: {str(e)}'}), 500

@config_admin_bp.route('/test', methods=['GET'])
def test_endpoint():
    """Endpoint de prueba simple"""
    return jsonify({'message': 'Config admin endpoint funcionando', 'status': 'OK'}), 200

# ========== GESTIÓN DE CAMPOS DEL FORMULARIO ==========

@config_admin_bp.route('/formulario-campos', methods=['GET'])
@token_required
def get_formulario_campos(current_user):
    if current_user.rol != 'admin':
        return jsonify({'error': 'Acceso no autorizado'}), 403
    
    campos = FormularioCampo.query.filter_by(es_activo=True).order_by(FormularioCampo.orden).all()
    return jsonify([campo.to_dict() for campo in campos])

@config_admin_bp.route('/formulario-campos', methods=['POST'])
@token_required
def create_formulario_campo(current_user):
    if current_user.rol != 'admin':
        return jsonify({'error': 'Acceso no autorizado'}), 403
    
    data = request.json
    try:
        campo = FormularioCampo(
            nombre_campo=data['nombre_campo'],
            etiqueta=data['etiqueta'],
            tipo_campo=data['tipo_campo'],
            es_obligatorio=data.get('es_obligatorio', False),
            es_subsanable=data.get('es_subsanable', True),
            orden=data.get('orden', 0),
            seccion=data.get('seccion', 'general'),
            opciones=json.dumps(data.get('opciones', [])) if data.get('opciones') else None,
            validaciones=json.dumps(data.get('validaciones', {})) if data.get('validaciones') else None,
            descripcion=data.get('descripcion')
        )
        db.session.add(campo)
        db.session.commit()
        return jsonify({'message': 'Campo creado exitosamente', 'campo': campo.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@config_admin_bp.route('/formulario-campos/<int:campo_id>', methods=['PUT'])
@token_required
def update_formulario_campo(current_user, campo_id):
    if current_user.rol != 'admin':
        return jsonify({'error': 'Acceso no autorizado'}), 403
    
    campo = FormularioCampo.query.get_or_404(campo_id)
    data = request.json
    
    try:
        campo.nombre_campo = data.get('nombre_campo', campo.nombre_campo)
        campo.etiqueta = data.get('etiqueta', campo.etiqueta)
        campo.tipo_campo = data.get('tipo_campo', campo.tipo_campo)
        campo.es_obligatorio = data.get('es_obligatorio', campo.es_obligatorio)
        campo.es_subsanable = data.get('es_subsanable', campo.es_subsanable)
        campo.orden = data.get('orden', campo.orden)
        campo.seccion = data.get('seccion', campo.seccion)
        campo.opciones = json.dumps(data['opciones']) if 'opciones' in data else campo.opciones
        campo.validaciones = json.dumps(data['validaciones']) if 'validaciones' in data else campo.validaciones
        campo.descripcion = data.get('descripcion', campo.descripcion)
        
        db.session.commit()
        return jsonify({'message': 'Campo actualizado exitosamente', 'campo': campo.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@config_admin_bp.route('/formulario-campos/<int:campo_id>', methods=['DELETE'])
@token_required
def delete_formulario_campo(current_user, campo_id):
    if current_user.rol != 'admin':
        return jsonify({'error': 'Acceso no autorizado'}), 403
    
    campo = FormularioCampo.query.get_or_404(campo_id)
    try:
        campo.es_activo = False
        db.session.commit()
        return jsonify({'message': 'Campo eliminado exitosamente'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# ========== GESTIÓN DE CRITERIOS DE EVALUACIÓN ==========

@config_admin_bp.route('/criterios-evaluacion', methods=['GET'])
@token_required
def get_criterios_evaluacion(current_user):
    if current_user.rol != 'admin':
        return jsonify({'error': 'Acceso no autorizado'}), 403
    
    criterios = CriterioEvaluacionConfig.query.filter_by(es_activo=True).order_by(CriterioEvaluacionConfig.orden).all()
    return jsonify([criterio.to_dict() for criterio in criterios])

@config_admin_bp.route('/criterios-evaluacion', methods=['POST'])
@token_required
def create_criterio_evaluacion(current_user):
    if current_user.rol != 'admin':
        return jsonify({'error': 'Acceso no autorizado'}), 403
    
    data = request.json
    try:
        criterio = CriterioEvaluacionConfig(
            codigo=data['codigo'],
            nombre=data['nombre'],
            descripcion=data.get('descripcion'),
            categoria=data['categoria'],
            puntaje_maximo=data['puntaje_maximo'],
            campo_formulario=data.get('campo_formulario'),
            criterios_puntuacion=json.dumps(data.get('criterios_puntuacion', {})),
            orden=data.get('orden', 0)
        )
        db.session.add(criterio)
        db.session.commit()
        return jsonify({'message': 'Criterio creado exitosamente', 'criterio': criterio.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@config_admin_bp.route('/criterios-evaluacion/<int:criterio_id>', methods=['PUT'])
@token_required
def update_criterio_evaluacion(current_user, criterio_id):
    if current_user.rol != 'admin':
        return jsonify({'error': 'Acceso no autorizado'}), 403
    
    criterio = CriterioEvaluacionConfig.query.get_or_404(criterio_id)
    data = request.json
    
    try:
        criterio.codigo = data.get('codigo', criterio.codigo)
        criterio.nombre = data.get('nombre', criterio.nombre)
        criterio.descripcion = data.get('descripcion', criterio.descripcion)
        criterio.categoria = data.get('categoria', criterio.categoria)
        criterio.puntaje_maximo = data.get('puntaje_maximo', criterio.puntaje_maximo)
        criterio.campo_formulario = data.get('campo_formulario', criterio.campo_formulario)
        criterio.criterios_puntuacion = json.dumps(data['criterios_puntuacion']) if 'criterios_puntuacion' in data else criterio.criterios_puntuacion
        criterio.orden = data.get('orden', criterio.orden)
        
        db.session.commit()
        return jsonify({'message': 'Criterio actualizado exitosamente', 'criterio': criterio.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# ========== GESTIÓN DE CUPOS POR MUNICIPIO ==========

@config_admin_bp.route('/cupos-municipio', methods=['GET'])
@token_required
def get_cupos_municipio(current_user):
    if current_user.rol != 'admin':
        return jsonify({'error': 'Acceso no autorizado'}), 403
    
    cupos = CuposMunicipioConfig.query.filter_by(es_activo=True).all()
    return jsonify([cupo.to_dict() for cupo in cupos])

@config_admin_bp.route('/cupos-municipio', methods=['POST'])
@token_required
def create_cupo_municipio(current_user):
    if current_user.rol != 'admin':
        return jsonify({'error': 'Acceso no autorizado'}), 403
    
    data = request.json
    try:
        cupo = CuposMunicipioConfig(
            municipio=data['municipio'],
            subregion=data['subregion'],
            cupo_total=data['cupo_total'],
            cupo_disponible=data['cupo_total']
        )
        db.session.add(cupo)
        db.session.commit()
        return jsonify({'message': 'Cupo creado exitosamente', 'cupo': cupo.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@config_admin_bp.route('/cupos-municipio/<int:cupo_id>', methods=['PUT'])
@token_required
def update_cupo_municipio(current_user, cupo_id):
    if current_user.rol != 'admin':
        return jsonify({'error': 'Acceso no autorizado'}), 403
    
    cupo = CuposMunicipioConfig.query.get_or_404(cupo_id)
    data = request.json
    
    try:
        cupo.municipio = data.get('municipio', cupo.municipio)
        cupo.subregion = data.get('subregion', cupo.subregion)
        cupo.cupo_total = data.get('cupo_total', cupo.cupo_total)
        cupo.cupo_disponible = cupo.cupo_total - cupo.cupo_utilizado
        
        db.session.commit()
        return jsonify({'message': 'Cupo actualizado exitosamente', 'cupo': cupo.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# ========== GESTIÓN DE DOCUMENTOS ==========

@config_admin_bp.route('/documentos-config', methods=['GET'])
@token_required
def get_documentos_config(current_user):
    if current_user.rol != 'admin':
        return jsonify({'error': 'Acceso no autorizado'}), 403
    
    documentos = DocumentoConfig.query.filter_by(es_activo=True).order_by(DocumentoConfig.orden).all()
    return jsonify([doc.to_dict() for doc in documentos])

@config_admin_bp.route('/documentos-config', methods=['POST'])
@token_required
def create_documento_config(current_user):
    if current_user.rol != 'admin':
        return jsonify({'error': 'Acceso no autorizado'}), 403
    
    data = request.json
    try:
        documento = DocumentoConfig(
            nombre_campo=data['nombre_campo'],
            nombre_documento=data['nombre_documento'],
            descripcion=data.get('descripcion'),
            es_obligatorio=data.get('es_obligatorio', False),
            es_subsanable=data.get('es_subsanable', True),
            formatos_permitidos=json.dumps(data.get('formatos_permitidos', [])),
            tamano_maximo_mb=data.get('tamano_maximo_mb', 10),
            orden=data.get('orden', 0)
        )
        db.session.add(documento)
        db.session.commit()
        return jsonify({'message': 'Documento creado exitosamente', 'documento': documento.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
