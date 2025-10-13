import boto3
import os
import uuid
from datetime import datetime, timedelta
from botocore.exceptions import ClientError, NoCredentialsError
import mimetypes

class S3Service:
    def __init__(self):
        """Inicializar el servicio S3"""
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
        self.bucket_name = os.getenv('S3_BUCKET_NAME', 'elearning-narino-resources')
        self.base_url = f"https://{self.bucket_name}.s3.amazonaws.com"
    
    def generate_s3_key(self, filename, folder="uploads"):
        """Generar una clave única para S3"""
        timestamp = datetime.now().strftime('%Y/%m/%d')
        unique_id = str(uuid.uuid4())
        extension = os.path.splitext(filename)[1]
        return f"{folder}/{timestamp}/{unique_id}{extension}"
    
    def upload_file(self, file_data, filename, content_type=None):
        """
        Subir archivo a S3
        
        Args:
            file_data: Datos del archivo (bytes o file-like object)
            filename: Nombre original del archivo
            content_type: Tipo de contenido (opcional)
        
        Returns:
            dict: Información del archivo subido
        """
        try:
            # Generar clave única para S3
            s3_key = self.generate_s3_key(filename)
            
            # Determinar tipo de contenido si no se proporciona
            if not content_type:
                content_type, _ = mimetypes.guess_type(filename)
                if not content_type:
                    content_type = 'application/octet-stream'
            
            # Subir archivo a S3
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=file_data,
                ContentType=content_type,
                ACL='public-read'  # Hacer el archivo público
            )
            
            # Generar URL pública
            s3_url = f"{self.base_url}/{s3_key}"
            
            return {
                's3_key': s3_key,
                's3_url': s3_url,
                's3_bucket': self.bucket_name,
                'content_type': content_type,
                'success': True
            }
            
        except NoCredentialsError:
            return {
                'error': 'Credenciales de AWS no configuradas',
                'success': False
            }
        except ClientError as e:
            return {
                'error': f'Error de S3: {str(e)}',
                'success': False
            }
        except Exception as e:
            return {
                'error': f'Error inesperado: {str(e)}',
                'success': False
            }
    
    def delete_file(self, s3_key):
        """
        Eliminar archivo de S3
        
        Args:
            s3_key: Clave del archivo en S3
        
        Returns:
            bool: True si se eliminó correctamente
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return True
        except Exception as e:
            print(f"Error eliminando archivo de S3: {e}")
            return False
    
    def get_file_url(self, s3_key, expires_in=3600):
        """
        Obtener URL firmada para acceso temporal
        
        Args:
            s3_key: Clave del archivo en S3
            expires_in: Tiempo de expiración en segundos
        
        Returns:
            str: URL firmada
        """
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': s3_key},
                ExpiresIn=expires_in
            )
            return url
        except Exception as e:
            print(f"Error generando URL firmada: {e}")
            return None
    
    def file_exists(self, s3_key):
        """
        Verificar si un archivo existe en S3
        
        Args:
            s3_key: Clave del archivo en S3
        
        Returns:
            bool: True si el archivo existe
        """
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=s3_key)
            return True
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return False
            raise
        except Exception:
            return False
    
    def get_file_info(self, s3_key):
        """
        Obtener información de un archivo en S3
        
        Args:
            s3_key: Clave del archivo en S3
        
        Returns:
            dict: Información del archivo
        """
        try:
            response = self.s3_client.head_object(Bucket=self.bucket_name, Key=s3_key)
            return {
                'size': response['ContentLength'],
                'content_type': response['ContentType'],
                'last_modified': response['LastModified'],
                'etag': response['ETag']
            }
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return None
            raise
        except Exception:
            return None
    
    def list_files(self, prefix="", max_keys=1000):
        """
        Listar archivos en S3
        
        Args:
            prefix: Prefijo para filtrar archivos
            max_keys: Número máximo de archivos a listar
        
        Returns:
            list: Lista de archivos
        """
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix,
                MaxKeys=max_keys
            )
            
            files = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    files.append({
                        'key': obj['Key'],
                        'size': obj['Size'],
                        'last_modified': obj['LastModified'],
                        'url': f"{self.base_url}/{obj['Key']}"
                    })
            
            return files
        except Exception as e:
            print(f"Error listando archivos: {e}")
            return []
    
    def copy_file(self, source_key, destination_key):
        """
        Copiar archivo dentro del mismo bucket
        
        Args:
            source_key: Clave del archivo origen
            destination_key: Clave del archivo destino
        
        Returns:
            bool: True si se copió correctamente
        """
        try:
            copy_source = {'Bucket': self.bucket_name, 'Key': source_key}
            self.s3_client.copy_object(
                CopySource=copy_source,
                Bucket=self.bucket_name,
                Key=destination_key
            )
            return True
        except Exception as e:
            print(f"Error copiando archivo: {e}")
            return False
    
    def get_bucket_size(self):
        """
        Obtener el tamaño total del bucket
        
        Returns:
            int: Tamaño total en bytes
        """
        try:
            response = self.s3_client.list_objects_v2(Bucket=self.bucket_name)
            total_size = 0
            
            if 'Contents' in response:
                for obj in response['Contents']:
                    total_size += obj['Size']
            
            return total_size
        except Exception as e:
            print(f"Error obteniendo tamaño del bucket: {e}")
            return 0
    
    def format_file_size(self, total_size):
        """
        Formatear el tamaño del archivo en formato legible
        
        Args:
            total_size: Tamaño en bytes
            
        Returns:
            str: Tamaño formateado (B, KB, MB, GB)
        """
        if total_size < 1024:
            return f"{total_size} B"
        elif total_size < 1024 * 1024:
            return f"{total_size / 1024:.1f} KB"
        elif total_size < 1024 * 1024 * 1024:
            return f"{total_size / (1024 * 1024):.1f} MB"
        else:
            return f"{total_size / (1024 * 1024 * 1024):.1f} GB"

# Instancia global del servicio S3
s3_service = S3Service() 