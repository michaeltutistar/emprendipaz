import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask  # pyright: ignore[reportMissingImports]
from flask_cors import CORS  # pyright: ignore[reportMissingModuleSource]
from src.models import db
from src.routes.user import user_bp
from src.routes.admin import admin_bp
from src.routes.content import content_bp
from src.routes.resources import resources_bp
from src.routes.instructor import instructor_bp
from src.routes.student import student_bp
from src.routes.notificaciones import notificaciones_bp
from src.routes.cursos import cursos_bp
from src.routes.activos import activos_bp
from src.routes.evidencias import evidencias_bp
from src.routes.migration import migration_bp
# NOTE: criterios/evaluaciones requieren dependencias pesadas (pandas) que no están empaquetadas en Lambda
# y bloquean el arranque de la API (ImportModuleError). Se re-habilitan cuando se empaqueten correctamente.
# from src.routes.criterios import criterios_bp
# from src.routes.evaluaciones import evaluaciones_bp
from src.config import config

# Determinar el entorno - Detectar si estamos en Lambda
if os.getenv('AWS_LAMBDA_FUNCTION_NAME'):
    # Estamos en AWS Lambda - usar configuración de producción
    env = 'production'
    print(f"🔍 Detectado entorno AWS Lambda - usando configuración de producción")
else:
    # Desarrollo local
    env = os.getenv('FLASK_ENV', 'development').strip()
    print(f"🔍 FLASK_ENV detectado: '{env}'")

print(f"🔍 DATABASE_URL disponible: {os.getenv('DATABASE_URL', 'NO DEFINIDA')}")
if env not in config:
    print(f"❌ Entorno '{env}' no válido. Entornos disponibles: {list(config.keys())}")
    print(f"   Usando entorno por defecto: 'development'")
    env = 'development'
app_config = config[env]
print(f"🔍 Configuración seleccionada: {env}")
print(f"🔍 URI de base de datos: {app_config.SQLALCHEMY_DATABASE_URI}")

app = Flask(__name__)

# Aplicar configuración
app.config.from_object(app_config)

# Configurar CORS para permitir comunicación con el frontend
CORS(app, 
     supports_credentials=True,
     origins=[
         'https://emprendimiento-narino.com',
         'https://www.emprendimiento-narino.com',
         'http://localhost:5173',
         'http://localhost:3000'
     ],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'])

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
app.register_blueprint(migration_bp, url_prefix='/api/migration')
# app.register_blueprint(criterios_bp, url_prefix='/api')
# app.register_blueprint(evaluaciones_bp, url_prefix='/api')

# La configuración de base de datos se maneja en config.py

# Inicializar base de datos
db.init_app(app)

# IMPORTANTE:
# En AWS Lambda NO debemos ejecutar db.create_all() en cold-start: fuerza conexión a RDS y provoca timeouts (502).
# La migración/esquema debe manejarse fuera del runtime (scripts/migraciones).
if not os.getenv('AWS_LAMBDA_FUNCTION_NAME'):
    with app.app_context():
        try:
            db.create_all()
            print("✅ Esquema de base de datos inicializado correctamente")
        except Exception as e:
            print(f"⚠️  Error al crear esquema: {e}")

@app.route('/api/health')
def health_check():
    return {"status": "ok", "message": "API is healthy"}, 200


# AWS Lambda handler
# La configuración actual de Lambda apunta a `src.main.lambda_handler`.
# `lambda_function.py` también expone un handler, pero para evitar errores 502 por "HandlerNotFound"
# definimos el entrypoint aquí.
def lambda_handler(event, context):
    import serverless_wsgi
    return serverless_wsgi.handle_request(app, event, context)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
