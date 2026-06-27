import os
import sys
import json
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models import db
from src.routes.user import user_bp
from src.routes.admin import admin_bp
from src.routes.content import content_bp
from src.routes.resources import resources_bp
from src.routes.instructor import instructor_bp
from src.routes.student import student_bp
from src.routes.config_admin import config_admin_bp
from src.routes.notificaciones import notificaciones_bp
from src.routes.cursos import cursos_bp
from src.routes.activos import activos_bp
from src.routes.evidencias import evidencias_bp
from src.routes.criterios import criterios_bp
from src.routes.evaluaciones import evaluaciones_bp
from src.routes.file_upload import file_upload_bp
from src.routes.db_query import db_query_bp
from src.routes.db_migration import migration_bp
from src.routes.user_files import user_files_bp
from src.routes.support import support_bp
from src.routes.forum import forum_bp
# from src.routes.migration import migration_bp  # ELIMINADO
# from src.routes.admin_fix import admin_fix_bp  # ELIMINADO POR SEGURIDAD
from src.config import config

# Determinar el entorno - Detectar si estamos en Lambda
if os.getenv('AWS_LAMBDA_FUNCTION_NAME'):
    # Estamos en AWS Lambda - usar configuración de producción
    env = 'production'
    print(f"Detectado entorno AWS Lambda - usando configuración de producción")
else:
    # Desarrollo local
    env = os.getenv('FLASK_ENV', 'development').strip()
    print(f"FLASK_ENV detectado: '{env}'")

print(f"DATABASE_URL disponible: {os.getenv('DATABASE_URL', 'NO DEFINIDA')}")
if env not in config:
    print(f"ERROR: Entorno '{env}' no válido. Entornos disponibles: {list(config.keys())}")
    print(f"   Usando entorno por defecto: 'development'")
    env = 'development'
app_config = config[env]
print(f"Configuración seleccionada: {env}")
print(f"URI de base de datos: {app_config.SQLALCHEMY_DATABASE_URI}")

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))

# Aplicar configuración
app.config.from_object(app_config)

# Configurar CORS para permitir comunicación con el frontend
# Usar variable de entorno FRONTEND_URL si está disponible, sino usar dominio de producción
frontend_url = os.getenv('FRONTEND_URL')
if frontend_url:
    print(f"Configurando CORS para frontend dinamico: {frontend_url}")
    allowed_origins = [frontend_url]
else:
    print("Configurando CORS para produccion")
    allowed_origins = [
        'https://emprendimiento-narino.com',
        'https://www.emprendimiento-narino.com',
        'http://localhost:5173',  # Para desarrollo local
        'http://localhost:3000'
    ]

print(f"Origenes permitidos: {allowed_origins}")
CORS(app, 
     supports_credentials=True,
     origins=allowed_origins,
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'])

# Middleware para forzar headers CORS en todas las respuestas
@app.after_request
def after_request(response):
    from flask import request
    origin = request.headers.get('Origin')
    
    # Solo permitir orígenes de la lista permitida
    if origin in allowed_origins:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
    
    return response

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(content_bp, url_prefix='/api/content')
app.register_blueprint(resources_bp, url_prefix='/api/resources')
app.register_blueprint(instructor_bp, url_prefix='/api/instructor')
app.register_blueprint(student_bp, url_prefix='/api/student')
app.register_blueprint(notificaciones_bp, url_prefix='/api')
app.register_blueprint(cursos_bp, url_prefix='/api')
app.register_blueprint(activos_bp, url_prefix='/api')
app.register_blueprint(evidencias_bp, url_prefix='/api')
app.register_blueprint(criterios_bp, url_prefix='/api')
app.register_blueprint(evaluaciones_bp, url_prefix='/api')
app.register_blueprint(config_admin_bp, url_prefix='/api/config')
app.register_blueprint(file_upload_bp, url_prefix='/api/files')
app.register_blueprint(db_query_bp, url_prefix='/api/db')
app.register_blueprint(migration_bp, url_prefix='/api/migration')
app.register_blueprint(user_files_bp, url_prefix='/api/admin')
app.register_blueprint(support_bp, url_prefix='/api/student/support')
app.register_blueprint(forum_bp, url_prefix='/api')
# app.register_blueprint(admin_fix_bp, url_prefix='/api')  # ELIMINADO POR SEGURIDAD

# Inicializar base de datos
db.init_app(app)

# Foro: columna parent_reply_id (respuestas anidadas). Idempotente; no tumba el arranque si falla RDS.
try:
    from src.routes.db_migration import ensure_forum_reply_parent_column

    ensure_forum_reply_parent_column(app, db)
except Exception as e:
    print(f'Arranque: migración foro parent_reply_id no aplicada (no fatal): {e}')

# ELIMINADO: El siguiente bloque intentaba crear las tablas automáticamente y
# causaba un error 502 si la base de datos no estaba accesible al iniciar.
# with app.app_context():
#     try:
#         db.create_all()
#         print("✅ Esquema de base de datos inicializado correctamente")
#     except Exception as e:
#         print(f"⚠️  Error al crear esquema: {e}")
#         # En Lambda, no fallar si hay problemas de esquema
#         if os.getenv('AWS_LAMBDA_FUNCTION_NAME'):
#             print("🔄 Continuando sin crear esquema en Lambda...")

@app.route('/api/health')
def health_check():
    return {"status": "ok", "message": "API is healthy"}, 200

# Handler para AWS Lambda
def lambda_handler(event, context):
    """
    Handler principal para AWS Lambda
    """
    try:
        # Usar el handler de WSGI
        from serverless_wsgi import handle_request
        return handle_request(app, event, context)
    except Exception as e:
        print(f"Error en lambda_handler: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e)
            })
        }

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
