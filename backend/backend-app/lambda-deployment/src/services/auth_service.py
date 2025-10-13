from functools import wraps
from flask import request, jsonify, current_app
import jwt
from datetime import datetime, timedelta
from ..models import User, db
import logging

logger = logging.getLogger(__name__)

def token_required(f):
    """Decorador para verificar token JWT"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Obtener token del header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({
                    'success': False,
                    'error': 'Token inválido'
                }), 401
        
        if not token:
            return jsonify({
                'success': False,
                'error': 'Token requerido'
            }), 401
        
        try:
            # Decodificar token
            secret_key = current_app.config.get('SECRET_KEY')
            if not secret_key:
                raise ValueError("SECRET_KEY no configurada")
            
            data = jwt.decode(token, secret_key, algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            
            if not current_user:
                return jsonify({
                    'success': False,
                    'error': 'Usuario no encontrado'
                }), 401
            
            if current_user.estado_cuenta != 'activa':
                return jsonify({
                    'success': False,
                    'error': 'Cuenta inactiva'
                }), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({
                'success': False,
                'error': 'Token expirado'
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                'success': False,
                'error': 'Token inválido'
            }), 401
        except Exception as e:
            logger.error(f"Error verifying token: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'Error al verificar token'
            }), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

def instructor_required(f):
    """Decorador para verificar que el usuario es instructor"""
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.rol != 'instructor':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de instructor'
            }), 403
        
        return f(current_user, *args, **kwargs)
    
    return decorated

def admin_required(f):
    """Decorador para verificar que el usuario es administrador"""
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.rol != 'admin':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de administrador'
            }), 403
        
        return f(current_user, *args, **kwargs)
    
    return decorated

def student_required(f):
    """Decorador para verificar que el usuario es estudiante"""
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.rol != 'estudiante':
            return jsonify({
                'success': False,
                'error': 'Acceso denegado. Se requiere rol de estudiante'
            }), 403
        
        return f(current_user, *args, **kwargs)
    
    return decorated

def generate_token(user_id, expires_in=24*60*60):  # 24 horas por defecto
    """Generar token JWT"""
    try:
        secret_key = current_app.config.get('SECRET_KEY')
        if not secret_key:
            raise ValueError("SECRET_KEY no configurada")
        
        payload = {
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(seconds=expires_in),
            'iat': datetime.utcnow()
        }
        
        token = jwt.encode(payload, secret_key, algorithm="HS256")
        return token
    except Exception as e:
        logger.error(f"Error generating token: {str(e)}")
        return None

def verify_token(token):
    """Verificar token JWT y retornar datos del usuario"""
    try:
        secret_key = current_app.config.get('SECRET_KEY')
        if not secret_key:
            raise ValueError("SECRET_KEY no configurada")
        
        data = jwt.decode(token, secret_key, algorithms=["HS256"])
        user = User.query.get(data['user_id'])
        
        if not user or user.estado_cuenta != 'activa':
            return None
        
        return user
    except jwt.ExpiredSignatureError:
        logger.warning("Token expirado")
        return None
    except jwt.InvalidTokenError:
        logger.warning("Token inválido")
        return None
    except Exception as e:
        logger.error(f"Error verifying token: {str(e)}")
        return None

def get_user_from_token(token):
    """Obtener usuario desde token sin verificar expiración"""
    try:
        secret_key = current_app.config.get('SECRET_KEY')
        if not secret_key:
            raise ValueError("SECRET_KEY no configurada")
        
        # Decodificar sin verificar expiración
        data = jwt.decode(token, secret_key, algorithms=["HS256"], options={"verify_exp": False})
        user = User.query.get(data['user_id'])
        
        return user
    except Exception as e:
        logger.error(f"Error getting user from token: {str(e)}")
        return None

def refresh_token(current_user):
    """Renovar token del usuario"""
    try:
        new_token = generate_token(current_user.id)
        if new_token:
            return {
                'success': True,
                'token': new_token,
                'expires_in': 24*60*60  # 24 horas
            }
        else:
            return {
                'success': False,
                'error': 'Error al generar nuevo token'
            }
    except Exception as e:
        logger.error(f"Error refreshing token: {str(e)}")
        return {
            'success': False,
            'error': 'Error al renovar token'
        }

def log_user_activity(user_id, activity_type, description, ip_address=None):
    """Registrar actividad del usuario"""
    try:
        from ..models import LogActividad
        
        log_entry = LogActividad(
            usuario_id=user_id,
            accion=activity_type,
            detalles=description,
            fecha=datetime.utcnow()
        )
        
        db.session.add(log_entry)
        db.session.commit()
        
        return True
    except Exception as e:
        logger.error(f"Error logging user activity: {str(e)}")
        return False

def check_permission(user, resource_type, resource_id=None, action='read'):
    """Verificar permisos del usuario sobre un recurso"""
    try:
        # Administradores tienen todos los permisos
        if user.rol == 'admin':
            return True
        
        # Instructores pueden gestionar sus propios recursos
        if user.rol == 'instructor':
            if resource_type == 'curso':
                from ..models import Curso
                curso = Curso.query.get(resource_id)
                return curso and curso.instructor_id == user.id
            
            elif resource_type == 'modulo':
                from ..models import Modulo, Curso
                modulo = Modulo.query.get(resource_id)
                if modulo:
                    curso = Curso.query.get(modulo.curso_id)
                    return curso and curso.instructor_id == user.id
                return False
            
            elif resource_type == 'recurso':
                from ..models import Recurso
                recurso = Recurso.query.get(resource_id)
                return recurso and recurso.subido_por == user.id
            
            elif resource_type == 'leccion':
                from ..models import Leccion, Modulo, Curso
                leccion = Leccion.query.get(resource_id)
                if leccion:
                    modulo = Modulo.query.get(leccion.modulo_id)
                    if modulo:
                        curso = Curso.query.get(modulo.curso_id)
                        return curso and curso.instructor_id == user.id
                return False
        
        # Estudiantes tienen permisos limitados
        elif user.rol == 'estudiante':
            if action == 'read':
                # Pueden leer contenido público o contenido de cursos en los que estén inscritos
                if resource_type == 'curso':
                    from ..models import Inscripcion
                    inscripcion = Inscripcion.query.filter_by(
                        curso_id=resource_id,
                        estudiante_id=user.id
                    ).first()
                    return inscripcion is not None
                
                elif resource_type == 'recurso':
                    from ..models import Recurso
                    recurso = Recurso.query.get(resource_id)
                    if recurso and recurso.acceso_publico:
                        return True
                    
                    # Verificar si el recurso pertenece a un curso en el que esté inscrito
                    if recurso and recurso.curso_id:
                        from ..models import Inscripcion
                        inscripcion = Inscripcion.query.filter_by(
                            curso_id=recurso.curso_id,
                            estudiante_id=user.id
                        ).first()
                        return inscripcion is not None
                    
                    return False
        
        return False
        
    except Exception as e:
        logger.error(f"Error checking permission: {str(e)}")
        return False

def require_permission(resource_type, action='read'):
    """Decorador para verificar permisos específicos"""
    def decorator(f):
        @wraps(f)
        def decorated(current_user, *args, **kwargs):
            # Obtener resource_id de los argumentos o parámetros de la URL
            resource_id = None
            
            # Buscar en kwargs
            if 'resource_id' in kwargs:
                resource_id = kwargs['resource_id']
            elif 'curso_id' in kwargs:
                resource_id = kwargs['curso_id']
            elif 'modulo_id' in kwargs:
                resource_id = kwargs['modulo_id']
            elif 'leccion_id' in kwargs:
                resource_id = kwargs['leccion_id']
            elif 'recurso_id' in kwargs:
                resource_id = kwargs['recurso_id']
            
            # Si no se encontró en kwargs, buscar en la URL
            if not resource_id:
                # Extraer de la URL (ej: /curso/123 -> 123)
                path_parts = request.path.split('/')
                for i, part in enumerate(path_parts):
                    if part in ['curso', 'modulo', 'leccion', 'recurso'] and i + 1 < len(path_parts):
                        try:
                            resource_id = int(path_parts[i + 1])
                            break
                        except ValueError:
                            continue
            
            if not check_permission(current_user, resource_type, resource_id, action):
                return jsonify({
                    'success': False,
                    'error': 'No tienes permisos para realizar esta acción'
                }), 403
            
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator 