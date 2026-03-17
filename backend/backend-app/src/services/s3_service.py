#!/usr/bin/env python3
"""
Servicio para manejar la carga y gestión de archivos en S3
"""
import boto3
import os
import uuid
import unicodedata
import re
from datetime import datetime, timedelta
from botocore.exceptions import ClientError, NoCredentialsError
from werkzeug.utils import secure_filename
import mimetypes
import json

class S3Service:
    def __init__(self):
        self.bucket_name = os.getenv('S3_BUCKET', 'elearning-archivos')
        self.region = os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
        
        try:
            # Especificar región explícitamente para evitar inconsistencias en Lambda.
            self.s3_client = boto3.client('s3', region_name=self.region)
            self.s3_resource = boto3.resource('s3', region_name=self.region)
            self.bucket = self.s3_resource.Bucket(self.bucket_name)
            print(f"DEBUG - S3 Client configurado para region: {self.region}")
        except NoCredentialsError:
            print("ERROR: Credenciales de AWS no configuradas")
            raise
        except Exception as e:
            print(f"ERROR inicializando S3Service: {e}")
            raise
    
    def sanitize_filename_for_metadata(self, filename):
        """
        Sanitizar nombre de archivo para usar en metadata de S3 (solo ASCII)
        
        Args:
            filename: Nombre original del archivo
            
        Returns:
            str: Nombre sanitizado solo con caracteres ASCII
        """
        try:
            # Normalizar caracteres unicode (á -> a, ñ -> n, etc.)
            normalized = unicodedata.normalize('NFD', filename)
            
            # Remover acentos y caracteres especiales, mantener solo ASCII
            ascii_filename = ''.join(
                char for char in normalized 
                if unicodedata.category(char) != 'Mn' and ord(char) < 128
            )
            
            # Limpiar caracteres no permitidos en metadata
            ascii_filename = re.sub(r'[^\w\-_\.\(\)\[\] ]', '', ascii_filename)
            
            # Limitar longitud (S3 metadata tiene límite de 2KB total)
            if len(ascii_filename) > 200:
                name, ext = os.path.splitext(ascii_filename)
                ascii_filename = name[:200-len(ext)] + ext
            
            return ascii_filename
            
        except Exception as e:
            print(f"ERROR sanitizando filename: {e}")
            # Fallback: usar solo caracteres alfanuméricos básicos
            return re.sub(r'[^\w\-_\.]', '_', filename)[:200]
    
    def generate_file_key(self, user_id, document_type, filename, subfolder=None):
        """
        Generar una clave única para el archivo en S3
        
        Args:
            user_id: ID del usuario
            document_type: Tipo de documento (obligatorio, por-tipo, etc.)
            filename: Nombre original del archivo
            subfolder: Subcarpeta específica (opcional)
        
        Returns:
            str: Clave del archivo en S3
        """
        # Limpiar y asegurar el nombre del archivo
        safe_filename = secure_filename(filename)
        
        # Generar timestamp y UUID para evitar colisiones
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        
        # Construir la ruta
        if subfolder:
            key = f"usuarios/{user_id}/documentos/{document_type}/{subfolder}/{timestamp}_{unique_id}_{safe_filename}"
        else:
            key = f"usuarios/{user_id}/documentos/{document_type}/{timestamp}_{unique_id}_{safe_filename}"
        
        return key
    
    def upload_file(self, file_obj, user_id, document_type, original_filename, subfolder=None, metadata=None):
        """
        Subir archivo a S3
        
        Args:
            file_obj: Objeto archivo (file-like object)
            user_id: ID del usuario
            document_type: Tipo de documento
            original_filename: Nombre original del archivo
            subfolder: Subcarpeta específica (opcional)
            metadata: Metadatos adicionales (opcional)
        
        Returns:
            dict: Información del archivo subido
        """
        try:
            # Generar clave del archivo
            file_key = self.generate_file_key(user_id, document_type, original_filename, subfolder)
            
            # Detectar tipo MIME
            content_type, _ = mimetypes.guess_type(original_filename)
            if not content_type:
                content_type = 'application/octet-stream'
            
            # Preparar metadatos (sanitizar filename para metadata)
            sanitized_filename = self.sanitize_filename_for_metadata(original_filename)
            s3_metadata = {
                'user-id': str(user_id),
                'document-type': document_type,
                'original-filename': sanitized_filename,
                'upload-timestamp': datetime.utcnow().isoformat()
            }
            
            if subfolder:
                s3_metadata['subfolder'] = subfolder
            
            if metadata:
                s3_metadata.update(metadata)
            
            # Subir archivo
            self.s3_client.upload_fileobj(
                file_obj,
                self.bucket_name,
                file_key,
                ExtraArgs={
                    'ContentType': content_type,
                    'Metadata': s3_metadata,
                    'ServerSideEncryption': 'AES256'
                }
            )
            
            # Generar URL del archivo (privada)
            file_url = f"s3://{self.bucket_name}/{file_key}"
            
            return {
                'success': True,
                'file_key': file_key,
                'file_url': file_url,
                'bucket': self.bucket_name,
                'content_type': content_type,
                'metadata': s3_metadata
            }
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            print(f"ERROR de AWS S3 ({error_code}): {error_message}")
            
            return {
                'success': False,
                'error': f"Error de AWS: {error_message}",
                'error_code': error_code
            }
        except Exception as e:
            print(f"ERROR subiendo archivo: {e}")
            return {
                'success': False,
                'error': f"Error interno: {str(e)}"
            }
    
    def upload_file_data(self, file_data, user_id, document_type, filename, subfolder=None, metadata=None):
        """
        Subir datos de archivo (bytes) a S3
        
        Args:
            file_data: Datos del archivo en bytes
            user_id: ID del usuario
            document_type: Tipo de documento
            filename: Nombre del archivo
            subfolder: Subcarpeta específica (opcional)
            metadata: Metadatos adicionales (opcional)
        
        Returns:
            str: Clave del archivo en S3 o None si falla
        """
        try:
            print(f"upload_file_data iniciado: user_id={user_id}, document_type={document_type}, filename={filename}")
            print(f"bucket_name: {self.bucket_name}")
            print(f"s3_client configurado: {self.s3_client is not None}")
            
            # Generar clave del archivo
            file_key = self.generate_file_key(user_id, document_type, filename, subfolder)
            
            # Detectar tipo MIME
            content_type, _ = mimetypes.guess_type(filename)
            if not content_type:
                content_type = 'application/octet-stream'
            
            # Preparar metadatos (sanitizar filename para metadata)
            sanitized_filename = self.sanitize_filename_for_metadata(filename)
            s3_metadata = {
                'user-id': str(user_id),
                'document-type': document_type,
                'original-filename': sanitized_filename,
                'upload-timestamp': datetime.utcnow().isoformat()
            }
            
            if subfolder:
                s3_metadata['subfolder'] = subfolder
            
            if metadata:
                s3_metadata.update(metadata)
            
            # Subir archivo usando put_object para datos en bytes
            print(f"Intentando subir a S3: bucket={self.bucket_name}, key={file_key}")
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=file_key,
                Body=file_data,
                ContentType=content_type,
                Metadata=s3_metadata,
                ServerSideEncryption='AES256'
            )
            print(f"put_object completado exitosamente")
            
            print(f"SUCCESS: Archivo subido exitosamente: {file_key}")
            return file_key
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            print(f"ERROR de AWS S3 ({error_code}): {error_message}")
            return None
        except Exception as e:
            print(f"ERROR subiendo archivo: {e}")
            return None
    
    def create_user_folders(self, user_id):
        """
        Crear estructura completa de carpetas para un usuario
        
        Args:
            user_id: ID del usuario
            
        Returns:
            dict: Resultado de la operación
        """
        try:
            print(f"Creando estructura de carpetas para usuario: {user_id}")
            
            # Lista completa de tipos de documentos
            document_types = [
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
            
            folders_created = []
            folders_failed = []
            
            # Crear archivo placeholder para cada carpeta
            placeholder_content = b"Folder created for user " + str(user_id).encode()
            
            for doc_type in document_types:
                folder_key = f"usuarios/{user_id}/documentos/{doc_type}/.keep"
                
                try:
                    self.s3_client.put_object(
                        Bucket=self.bucket_name,
                        Key=folder_key,
                        Body=placeholder_content,
                        ContentType='text/plain',
                        Metadata={
                            'user-id': str(user_id),
                            'folder-type': doc_type,
                            'created-timestamp': datetime.utcnow().isoformat()
                        },
                        ServerSideEncryption='AES256'
                    )
                    folders_created.append(doc_type)
                    print(f"SUCCESS: Carpeta creada: {folder_key}")
                    
                except Exception as e:
                    folders_failed.append(f"{doc_type}: {str(e)}")
                    print(f"ERROR: No se pudo crear carpeta {folder_key}: {str(e)}")
            
            return {
                'success': True,
                'user_id': user_id,
                'folders_created': len(folders_created),
                'folders_failed': len(folders_failed),
                'created_types': folders_created,
                'failed_types': folders_failed
            }
            
        except Exception as e:
            print(f"ERROR creando carpetas para usuario {user_id}: {str(e)}")
            return {
                'success': False,
                'user_id': user_id,
                'error': str(e)
            }

    def generate_presigned_url(self, file_key, expiration=3600, method='get_object'):
        """
        Generar URL firmada para acceso temporal al archivo
        
        Args:
            file_key: Clave del archivo en S3
            expiration: Tiempo de expiración en segundos (default: 1 hora)
            method: Método HTTP (get_object, put_object)
        
        Returns:
            str: URL firmada
        """
        try:
            url = self.s3_client.generate_presigned_url(
                method,
                Params={'Bucket': self.bucket_name, 'Key': file_key},
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            print(f"ERROR generando URL firmada: {e}")
            return None
    
    def delete_file(self, file_key):
        """
        Eliminar archivo de S3
        
        Args:
            file_key: Clave del archivo en S3
        
        Returns:
            bool: True si se eliminó exitosamente
        """
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=file_key)
            return True
        except ClientError as e:
            print(f"ERROR eliminando archivo: {e}")
            return False
    
    def list_user_files(self, user_id, document_type=None):
        """
        Listar archivos de un usuario
        
        Args:
            user_id: ID del usuario
            document_type: Tipo de documento (opcional, para filtrar)
        
        Returns:
            list: Lista de archivos del usuario
        """
        try:
            prefix = f"usuarios/{user_id}/"
            if document_type:
                prefix += f"documentos/{document_type}/"
            
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix
            )
            
            files = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    # Obtener metadatos
                    try:
                        metadata_response = self.s3_client.head_object(
                            Bucket=self.bucket_name,
                            Key=obj['Key']
                        )
                        metadata = metadata_response.get('Metadata', {})
                    except:
                        metadata = {}
                    
                    files.append({
                        'key': obj['Key'],
                        'size': obj['Size'],
                        'last_modified': obj['LastModified'],
                        'metadata': metadata
                    })
            
            return files
            
        except ClientError as e:
            print(f"ERROR listando archivos: {e}")
            return []
    
    def get_file_info(self, file_key):
        """
        Obtener información de un archivo
        
        Args:
            file_key: Clave del archivo en S3
        
        Returns:
            dict: Información del archivo
        """
        try:
            response = self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=file_key
            )
            
            return {
                'key': file_key,
                'size': response['ContentLength'],
                'content_type': response['ContentType'],
                'last_modified': response['LastModified'],
                'metadata': response.get('Metadata', {}),
                'exists': True
            }
            
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return {'exists': False}
            else:
                print(f"ERROR obteniendo info del archivo: {e}")
                return {'exists': False, 'error': str(e)}

    def generate_presigned_upload_url(self, user_id, document_type, filename, content_type=None, expiration=3600):
        """
        Generar una URL firmada para subir archivos directamente a S3
        
        Args:
            user_id: ID del usuario
            document_type: Tipo de documento
            filename: Nombre del archivo
            content_type: Tipo de contenido (opcional)
            expiration: Tiempo de expiración en segundos (default: 1 hora)
        
        Returns:
            dict: URL firmada y metadatos
        """
        try:
            # Generar clave única para el archivo
            file_key = self.generate_file_key(user_id, document_type, filename)
            
            # Determinar content type si no se proporciona
            if not content_type:
                content_type, _ = mimetypes.guess_type(filename)
                if not content_type:
                    content_type = 'application/octet-stream'
            
            # Generar URL firmada para PUT
            # IMPORTANTE: No incluir Metadata ni ContentType aquí porque el frontend
            # debe enviar exactamente los mismos headers que están en la firma
            presigned_url = self.s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': file_key
                },
                ExpiresIn=expiration
            )
            
            return {
                'success': True,
                'presigned_url': presigned_url,
                'file_key': file_key,
                'bucket': self.bucket_name,
                'content_type': content_type,
                'expires_in': expiration
            }
            
        except Exception as e:
            print(f"ERROR generando presigned URL: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def verify_file_upload(self, file_key):
        """
        Verificar que un archivo fue subido correctamente a S3
        
        Args:
            file_key: Clave del archivo en S3
        
        Returns:
            dict: Información del archivo subido
        """
        try:
            response = self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=file_key
            )
            
            return {
                'success': True,
                'file_key': file_key,
                'size': response['ContentLength'],
                'content_type': response['ContentType'],
                'last_modified': response['LastModified'].isoformat(),
                'metadata': response.get('Metadata', {})
            }
            
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return {
                    'success': False,
                    'error': 'Archivo no encontrado en S3'
                }
            else:
                return {
                    'success': False,
                    'error': str(e)
                }
    
    def generate_presigned_upload_url(self, user_id, filename, content_type, max_size_mb=100):
        """
        Generar una URL pre-firmada para que el cliente suba un video directamente a S3
        
        Args:
            user_id: ID del usuario
            filename: Nombre original del archivo
            content_type: Tipo de contenido (video/mp4, video/quicktime, etc.)
            max_size_mb: Tamaño máximo permitido en MB (default: 100)
        
        Returns:
            dict: {
                'success': bool,
                'upload_url': str,
                'file_key': str,
                'expires_in': int
            }
        """
        try:
            # Validar tipo de contenido
            allowed_types = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/avi']
            if content_type not in allowed_types:
                return {
                    'success': False,
                    'error': f'Tipo de archivo no permitido. Tipos aceptados: {", ".join(allowed_types)}'
                }
            
            # Generar key único para el video
            file_key = self.generate_file_key(user_id, 'videos/presentacion', filename)
            
            # Configurar condiciones para la subida
            expires_in = 900  # 15 minutos
            max_size_bytes = max_size_mb * 1024 * 1024
            
            # Generar URL pre-firmada - MÍNIMO de parámetros
            # Solo Bucket, Key y ContentType - sin ACL ni metadata
            params = {
                'Bucket': self.bucket_name,
                'Key': file_key,
                'ContentType': content_type
            }
            
            print(f"🔍 DEBUG - Parámetros para firmar: {params}")
            print(f"🔍 DEBUG - ContentType recibido: '{content_type}'")
            
            presigned_url = self.s3_client.generate_presigned_url(
                'put_object',
                Params=params,
                ExpiresIn=expires_in,
                HttpMethod='PUT'
            )
            
            print(f"✅ URL pre-firmada generada para usuario {user_id}: {file_key}")
            print(f"   Expira en: {expires_in} segundos")
            print(f"   Tamaño máximo: {max_size_mb} MB")
            print(f"🔍 DEBUG - URL generada: {presigned_url}")
            
            # 🔍 DEBUG: Verificar componentes de la URL
            from urllib.parse import urlparse, parse_qs
            parsed_url = urlparse(presigned_url)
            query_params = parse_qs(parsed_url.query)
            print(f"🔍 DEBUG - Host: {parsed_url.hostname}")
            print(f"🔍 DEBUG - Path: {parsed_url.path}")
            print(f"🔍 DEBUG - Query params: {list(query_params.keys())}")
            if 'content-type' in query_params:
                print(f"🔍 DEBUG - Content-Type en URL: {query_params['content-type'][0]}")
            if 'x-amz-algorithm' in query_params:
                print(f"🔍 DEBUG - Algorithm: {query_params['x-amz-algorithm'][0]}")
            if 'x-amz-credential' in query_params:
                print(f"🔍 DEBUG - Credential: {query_params['x-amz-credential'][0]}")
            
            return {
                'success': True,
                'upload_url': presigned_url,
                'file_key': file_key,
                'expires_in': expires_in,
                'max_size_mb': max_size_mb
            }
            
        except Exception as e:
            print(f"❌ Error generando URL pre-firmada: {str(e)}")
            return {
                'success': False,
                'error': f'Error generando URL de subida: {str(e)}'
            }
    
    def verify_file_exists(self, file_key):
        """
        Verificar si un archivo existe en S3 y obtener sus metadatos
        
        Args:
            file_key: Clave del archivo en S3
        
        Returns:
            dict: {
                'success': bool,
                'exists': bool,
                'size': int (opcional),
                'content_type': str (opcional)
            }
        """
        try:
            response = self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=file_key
            )
            
            return {
                'success': True,
                'exists': True,
                'size': response['ContentLength'],
                'content_type': response.get('ContentType', 'unknown')
            }
            
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return {
                    'success': True,
                    'exists': False
                }
            else:
                return {
                    'success': False,
                    'error': str(e)
                }

# Instancia global del servicio
s3_service = S3Service()