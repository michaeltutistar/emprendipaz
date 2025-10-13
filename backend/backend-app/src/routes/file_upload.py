#!/usr/bin/env python3
"""
Endpoints para manejo de carga de archivos
"""
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from src.services.s3_service import s3_service
from src.services.auth_service import token_required
from src.models import db, User
import os
import logging

file_upload_bp = Blueprint('file_upload', __name__)
logger = logging.getLogger(__name__)

# Configuración de archivos permitidos
ALLOWED_EXTENSIONS = {
    'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'rtf', 'xls', 'xlsx', 'mp4', 'mov', 'avi'
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def allowed_file(filename):
    """Verificar si el archivo tiene una extensión permitida"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_size(file_obj):
    """Obtener el tamaño del archivo"""
    file_obj.seek(0, os.SEEK_END)
    size = file_obj.tell()
    file_obj.seek(0)
    return size

@file_upload_bp.route('/upload', methods=['POST'])
@token_required
def upload_file(current_user):
    """
    Endpoint para subir archivos del formulario de registro
    """
    try:
        # Verificar que se envió un archivo
        if 'file' not in request.files:
            return jsonify({'error': 'No se envió ningún archivo'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No se seleccionó ningún archivo'}), 400
        
        # Obtener parámetros adicionales
        document_type = request.form.get('document_type', 'general')
        subfolder = request.form.get('subfolder')
        description = request.form.get('description', '')
        
        # Validar archivo
        if not allowed_file(file.filename):
            return jsonify({
                'error': 'Tipo de archivo no permitido',
                'allowed_types': list(ALLOWED_EXTENSIONS)
            }), 400
        
        # Verificar tamaño
        file_size = get_file_size(file)
        if file_size > MAX_FILE_SIZE:
            return jsonify({
                'error': f'Archivo demasiado grande. Máximo permitido: {MAX_FILE_SIZE // (1024*1024)}MB'
            }), 400
        
        # Preparar metadatos
        metadata = {
            'description': description,
            'file-size': str(file_size),
            'uploaded-by': current_user.email
        }
        
        # Subir archivo a S3
        upload_result = s3_service.upload_file(
            file_obj=file,
            user_id=current_user.id,
            document_type=document_type,
            original_filename=file.filename,
            subfolder=subfolder,
            metadata=metadata
        )
        
        if upload_result['success']:
            # Generar URL firmada para acceso temporal (1 hora)
            presigned_url = s3_service.generate_presigned_url(
                upload_result['file_key'],
                expiration=3600
            )
            
            response_data = {
                'success': True,
                'message': 'Archivo subido exitosamente',
                'file_info': {
                    'file_key': upload_result['file_key'],
                    'original_filename': file.filename,
                    'content_type': upload_result['content_type'],
                    'size': file_size,
                    'document_type': document_type,
                    'subfolder': subfolder,
                    'upload_url': presigned_url  # URL temporal para verificar
                }
            }
            
            logger.info(f"Archivo subido exitosamente: {upload_result['file_key']} por usuario {current_user.id}")
            return jsonify(response_data), 200
        else:
            logger.error(f"Error subiendo archivo: {upload_result.get('error')}")
            return jsonify({
                'success': False,
                'error': upload_result.get('error', 'Error desconocido')
            }), 500
            
    except Exception as e:
        logger.error(f"Error en upload_file: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error interno del servidor: {str(e)}'
        }), 500

@file_upload_bp.route('/files', methods=['GET'])
@token_required
def list_user_files(current_user):
    """
    Listar archivos del usuario actual
    """
    try:
        document_type = request.args.get('document_type')
        
        files = s3_service.list_user_files(
            user_id=current_user.id,
            document_type=document_type
        )
        
        # Generar URLs firmadas para cada archivo
        files_with_urls = []
        for file_info in files:
            presigned_url = s3_service.generate_presigned_url(
                file_info['key'],
                expiration=3600
            )
            
            file_data = {
                'key': file_info['key'],
                'size': file_info['size'],
                'last_modified': file_info['last_modified'].isoformat(),
                'metadata': file_info['metadata'],
                'download_url': presigned_url
            }
            files_with_urls.append(file_data)
        
        return jsonify({
            'success': True,
            'files': files_with_urls,
            'total': len(files_with_urls)
        }), 200
        
    except Exception as e:
        logger.error(f"Error en list_user_files: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error interno: {str(e)}'
        }), 500

@file_upload_bp.route('/files/<path:file_key>', methods=['DELETE'])
@token_required
def delete_file(current_user, file_key):
    """
    Eliminar un archivo del usuario
    """
    try:
        # Verificar que el archivo pertenece al usuario
        if not file_key.startswith(f"usuarios/{current_user.id}/"):
            return jsonify({
                'success': False,
                'error': 'No tienes permisos para eliminar este archivo'
            }), 403
        
        # Eliminar archivo
        success = s3_service.delete_file(file_key)
        
        if success:
            logger.info(f"Archivo eliminado: {file_key} por usuario {current_user.id}")
            return jsonify({
                'success': True,
                'message': 'Archivo eliminado exitosamente'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'No se pudo eliminar el archivo'
            }), 500
            
    except Exception as e:
        logger.error(f"Error en delete_file: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error interno: {str(e)}'
        }), 500

@file_upload_bp.route('/files/<path:file_key>/info', methods=['GET'])
@token_required
def get_file_info(current_user, file_key):
    """
    Obtener información de un archivo
    """
    try:
        # Verificar que el archivo pertenece al usuario
        if not file_key.startswith(f"usuarios/{current_user.id}/"):
            return jsonify({
                'success': False,
                'error': 'No tienes permisos para acceder a este archivo'
            }), 403
        
        file_info = s3_service.get_file_info(file_key)
        
        if file_info.get('exists'):
            # Generar URL firmada
            download_url = s3_service.generate_presigned_url(file_key, expiration=3600)
            
            return jsonify({
                'success': True,
                'file_info': {
                    'key': file_info['key'],
                    'size': file_info['size'],
                    'content_type': file_info['content_type'],
                    'last_modified': file_info['last_modified'].isoformat(),
                    'metadata': file_info['metadata'],
                    'download_url': download_url
                }
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': 'Archivo no encontrado'
            }), 404
            
    except Exception as e:
        logger.error(f"Error en get_file_info: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error interno: {str(e)}'
        }), 500

@file_upload_bp.route('/upload/config', methods=['GET'])
def get_upload_config():
    """
    Obtener configuración de carga de archivos
    """
    return jsonify({
        'max_file_size': MAX_FILE_SIZE,
        'max_file_size_mb': MAX_FILE_SIZE // (1024 * 1024),
        'allowed_extensions': list(ALLOWED_EXTENSIONS),
        'document_types': [
            # Documentos obligatorios
            'obligatorios/tdr',
            'obligatorios/uso-imagen',
            'obligatorios/plan-negocio',
            'obligatorios/vecindad',
            
            # Por tipo de persona
            'por-tipo/persona-natural/cedula',
            'por-tipo/persona-natural/rut',
            'por-tipo/persona-juridica/camara-comercio',
            'por-tipo/persona-juridica/rut-empresa',
            'por-tipo/persona-juridica/cedula-representante',
            'por-tipo/persona-juridica/certificado-existencia',
            
            # Población diferencial
            'diferenciales/ruv',
            'diferenciales/sisben',
            'diferenciales/grupo-etnico',
            'diferenciales/arn',
            'diferenciales/discapacidad',
            
            # Control y antecedentes
            'control/antecedentes-fiscales',
            'control/antecedentes-disciplinarios',
            'control/antecedentes-judiciales',
            'control/antecedentes-contraloria',
            'control/antecedentes-procuraduria',
            'control/redam',
            'control/inhabilidades-sexuales',
            'control/declaracion-capacidad',
            
            # Funcionamiento del emprendimiento
            'funcionamiento/matricula-mercantil',
            'funcionamiento/facturas-6meses',
            'funcionamiento/facturas-venta',
            'funcionamiento/publicaciones-redes',
            'funcionamiento/redes-sociales',
            'funcionamiento/registro-ventas',
            'funcionamiento/comprobantes-ventas',
            'funcionamiento/certificado',
            
            # Financiación
            'financiacion/otras-fuentes',
            
            # Videos
            'videos/presentacion'
        ]
    }), 200
