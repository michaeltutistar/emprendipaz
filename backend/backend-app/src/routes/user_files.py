"""
Endpoint para gestionar archivos de usuarios
"""

from flask import Blueprint, jsonify, request
from src.models import db, User
from src.services.auth_service import token_required, admin_required, admin_or_evaluador_required
from src.services.s3_service import S3Service
import logging
import os

logger = logging.getLogger(__name__)

user_files_bp = Blueprint('user_files', __name__)

@user_files_bp.route('/user/<int:user_id>/files', methods=['GET'])
@token_required
@admin_or_evaluador_required
def get_user_files(current_user, user_id):
    """
    Obtener URLs pre-firmadas de todos los archivos de un usuario
    Consulta directamente S3 para obtener los archivos reales
    """
    try:
        # Buscar usuario
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        # Inicializar S3 service
        s3_service = S3Service()
        
        # Listar todos los archivos del usuario en S3
        prefix = f"usuarios/{user.id}/documentos/"
        
        try:
            response = s3_service.s3_client.list_objects_v2(
                Bucket=s3_service.bucket_name,
                Prefix=prefix
            )
        except Exception as e:
            logger.error(f"Error listando archivos de S3: {str(e)}")
            return jsonify({'error': 'Error al acceder a S3'}), 500
        
        # Mapeo de carpetas a nombres legibles
        folder_to_display_name = {
            'obligatorios/tdr': 'Términos y Condiciones (TDR)',
            'obligatorios/uso-imagen': 'Autorización de Uso de Imagen',
            'obligatorios/plan-negocio': 'Plan de Negocio',
            'obligatorios/vecindad': 'Carta de Vecindad',
            'obligatorios/declaracion-capacidad': 'Declaración Juramentada',
            'por-tipo/persona-natural/rut': 'RUT',
            'por-tipo/persona-natural/cedula': 'Cédula de Ciudadanía',
            'por-tipo/persona-juridica/rut-empresa': 'RUT Empresa',
            'por-tipo/persona-juridica/cedula-representante': 'Cédula Representante Legal',
            'por-tipo/persona-juridica/certificado-existencia': 'Certificado de Existencia',
            'por-tipo/persona-juridica/camara-comercio': 'Cámara de Comercio',
            'diferenciales/ruv': 'Registro Único de Víctimas (RUV)',
            'diferenciales/sisben': 'Certificado SISBEN',
            'diferenciales/grupo-etnico': 'Certificado de Grupo Étnico',
            'diferenciales/arn': 'Certificado ARN',
            'diferenciales/discapacidad': 'Certificado de Discapacidad',
            'diferenciales/mujer-cabeza-familia': 'Mujer Cabeza de Familia',
            'control/antecedentes-fiscales': 'Antecedentes Fiscales',
            'control/antecedentes-disciplinarios': 'Antecedentes Disciplinarios',
            'control/antecedentes-judiciales': 'Antecedentes Judiciales',
            'control/antecedentes-contraloria': 'Antecedentes Contraloría',
            'control/antecedentes-procuraduria': 'Antecedentes Procuraduría',
            'control/rnmc': 'Certificado RNMC',
            'control/redam': 'Certificado REDAM',
            'control/inhabilidades-sexuales': 'Inhabilidades Sexuales',
            'control/declaracion-capacidad': 'Declaración de Capacidad Legal',
            'funcionamiento/matricula-mercantil': 'Matrícula Mercantil',
            'funcionamiento/facturas-6meses': 'Facturas Últimos 6 Meses',
            'funcionamiento/facturas-venta': 'Facturas de Venta',
            'funcionamiento/comprobantes-ventas': 'Comprobantes de Ventas',
            'funcionamiento/redes-sociales': 'Publicaciones en Redes Sociales',
            'funcionamiento/publicaciones-redes': 'Publicaciones en Redes Sociales',
            'funcionamiento/registro-ventas': 'Registro de Ventas',
            'funcionamiento/certificado': 'Certificado de Funcionamiento',
            'videos/presentacion': 'Video de Presentación',
        }
        
        files = []
        
        if 'Contents' in response:
            for obj in response['Contents']:
                file_key = obj['Key']
                
                # Ignorar carpetas (archivos .keep)
                if file_key.endswith('/.keep') or file_key.endswith('/'):
                    continue
                
                # Extraer nombre del archivo
                filename = file_key.split('/')[-1]
                
                # Ignorar archivos .keep
                if filename == '.keep':
                    continue
                
                # Determinar el tipo de documento basándose en la ruta
                # Extraer la parte de la ruta después de "documentos/"
                path_parts = file_key.replace(prefix, '').split('/')
                
                # Crear display_name basado en la carpeta
                display_name = filename
                folder_path = '/'.join(path_parts[:-1])
                
                if folder_path in folder_to_display_name:
                    display_name = f"{folder_to_display_name[folder_path]}"
                
                try:
                    # Generar URL pre-firmada (válida por 1 hora)
                    presigned_url = s3_service.s3_client.generate_presigned_url(
                        'get_object',
                        Params={
                            'Bucket': s3_service.bucket_name,
                            'Key': file_key
                        },
                        ExpiresIn=3600  # 1 hora
                    )
                    
                    files.append({
                        'field_name': folder_path.replace('/', '_'),
                        'display_name': display_name,
                        'filename': filename,
                        'url': presigned_url,
                        'file_key': file_key,
                        'size': obj['Size'],
                        'last_modified': obj['LastModified'].isoformat()
                    })
                except Exception as e:
                    logger.warning(f"No se pudo generar URL para {file_key}: {str(e)}")
        
        return jsonify({
            'success': True,
            'user': {
                'id': user.id,
                'nombre': user.nombre,
                'apellido': user.apellido,
                'numero_documento': user.numero_documento
            },
            'files': files,
            'total_files': len(files),
            'expires_in': 3600  # Segundos
        }), 200
        
    except Exception as e:
        logger.error(f"Error obteniendo archivos del usuario: {str(e)}")
        return jsonify({'error': f'Error interno: {str(e)}'}), 500
