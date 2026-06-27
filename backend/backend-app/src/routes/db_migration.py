from flask import Blueprint, jsonify, request
from sqlalchemy import text
from ..models import db

migration_bp = Blueprint('migration', __name__)
MIGRATION_SECRET = 'asdf#FGSgvasgf$5$WGT_migration_2025'


def _validate_migration_secret(data):
    secret_key = (data or {}).get('secret_key')
    if secret_key != MIGRATION_SECRET:
        return jsonify({
            'success': False,
            'error': 'Clave secreta inválida'
        }), 403
    return None

@migration_bp.route('/execute-sql-migration', methods=['POST'])
def execute_sql_migration():
    """Endpoint temporal sin autenticación para ejecutar migración SQL
    Requiere una clave secreta en el body"""
    try:
        data = request.get_json()
        secret_error = _validate_migration_secret(data)
        if secret_error:
            return secret_error
        
        # Migraciones para crear tabla de intentos_evaluacion
        migrations = [
            """CREATE TABLE IF NOT EXISTS intentos_evaluacion (
                id SERIAL PRIMARY KEY,
                usuario_id INTEGER NOT NULL,
                modulo_nombre VARCHAR(200) NOT NULL,
                unidad_nombre VARCHAR(200) NOT NULL,
                paso_nombre VARCHAR(200) NOT NULL,
                todas_correctas BOOLEAN DEFAULT FALSE,
                fecha_intento TIMESTAMP DEFAULT NOW()
            )""",
            'CREATE INDEX IF NOT EXISTS idx_intentos_usuario_modulo ON intentos_evaluacion(usuario_id, modulo_nombre)',
            'CREATE INDEX IF NOT EXISTS idx_intentos_paso ON intentos_evaluacion(paso_nombre)',
        ]
        
        results = []
        for sql in migrations:
            db.session.execute(text(sql))
            results.append(f"Ejecutado: {sql[:60]}...")
        
        db.session.commit()
        
        # Verificar que la tabla se creó
        verify_sql = text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'intentos_evaluacion'
            )
        """)
        
        result = db.session.execute(verify_sql)
        table_exists = result.scalar()
        
        return jsonify({
            'success': True,
            'message': 'Migración completada exitosamente',
            'migrations_executed': len(migrations),
            'results': results,
            'table_created': table_exists
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Error durante la migración: {str(e)}'
        }), 500

@migration_bp.route('/add-instructor-id', methods=['POST'])
def add_instructor_id_column():
    """Agregar columna instructor_id a la tabla cursos"""
    try:
        # Verificar si la columna ya existe
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'cursos' AND column_name = 'instructor_id'
        """)
        
        result = db.session.execute(check_query).fetchone()
        
        if result:
            return jsonify({
                'success': True,
                'message': 'La columna instructor_id ya existe'
            }), 200
        
        # Agregar la columna
        db.session.execute(text("""
            ALTER TABLE cursos 
            ADD COLUMN instructor_id INTEGER NULL
        """))
        
        # Agregar foreign key
        db.session.execute(text("""
            ALTER TABLE cursos 
            ADD CONSTRAINT fk_cursos_instructor 
            FOREIGN KEY (instructor_id) REFERENCES "user"(id) 
            ON DELETE SET NULL
        """))
        
        # Crear índice
        db.session.execute(text("""
            CREATE INDEX idx_cursos_instructor_id ON cursos(instructor_id)
        """))
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Columna instructor_id agregada exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@migration_bp.route('/create-support-tables', methods=['POST'])
def create_support_tables():
    """Crear las tablas del centro de ayuda temporal."""
    try:
        data = request.get_json()
        secret_error = _validate_migration_secret(data)
        if secret_error:
            return secret_error

        migrations = [
            """CREATE TABLE IF NOT EXISTS support_tickets (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
                status VARCHAR(30) NOT NULL DEFAULT 'open',
                topic VARCHAR(120),
                summary TEXT,
                resolved BOOLEAN NOT NULL DEFAULT FALSE,
                channel_final VARCHAR(30),
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            )""",
            'CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status)',
            """CREATE TABLE IF NOT EXISTS support_ticket_messages (
                id SERIAL PRIMARY KEY,
                ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
                sender VARCHAR(20) NOT NULL,
                message TEXT NOT NULL,
                confidence DOUBLE PRECISION,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            )""",
            'CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket_id ON support_ticket_messages(ticket_id)',
            """CREATE TABLE IF NOT EXISTS support_ticket_satisfaction (
                id SERIAL PRIMARY KEY,
                ticket_id INTEGER NOT NULL UNIQUE REFERENCES support_tickets(id) ON DELETE CASCADE,
                resolved BOOLEAN NOT NULL DEFAULT FALSE,
                rating INTEGER,
                comment TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            )""",
            'CREATE INDEX IF NOT EXISTS idx_support_ticket_satisfaction_ticket_id ON support_ticket_satisfaction(ticket_id)',
        ]

        results = []
        for sql in migrations:
            db.session.execute(text(sql))
            results.append(f"Ejecutado: {sql[:60]}...")

        db.session.commit()

        verify_sql = text("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_name IN (
                'support_tickets',
                'support_ticket_messages',
                'support_ticket_satisfaction'
            )
        """)
        created_tables = [row[0] for row in db.session.execute(verify_sql).fetchall()]

        return jsonify({
            'success': True,
            'message': 'Tablas de soporte creadas exitosamente',
            'migrations_executed': len(migrations),
            'results': results,
            'tables': created_tables
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Error durante la migración de soporte: {str(e)}'
        }), 500


@migration_bp.route('/create-node-forum-tables', methods=['POST'])
def create_node_forum_tables():
    """Crear las tablas del foro por nodo."""
    try:
        data = request.get_json()
        secret_error = _validate_migration_secret(data)
        if secret_error:
            return secret_error

        migrations = [
            """CREATE TABLE IF NOT EXISTS node_forum_threads (
                id SERIAL PRIMARY KEY,
                node_slug VARCHAR(80) NOT NULL,
                author_user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
                question TEXT NOT NULL,
                status VARCHAR(30) NOT NULL DEFAULT 'open',
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            )""",
            'CREATE INDEX IF NOT EXISTS idx_node_forum_threads_node_slug ON node_forum_threads(node_slug)',
            'CREATE INDEX IF NOT EXISTS idx_node_forum_threads_author_user_id ON node_forum_threads(author_user_id)',
            """CREATE TABLE IF NOT EXISTS node_forum_replies (
                id SERIAL PRIMARY KEY,
                thread_id INTEGER NOT NULL REFERENCES node_forum_threads(id) ON DELETE CASCADE,
                author_user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
                body TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            )""",
            'CREATE INDEX IF NOT EXISTS idx_node_forum_replies_thread_id ON node_forum_replies(thread_id)',
            'CREATE INDEX IF NOT EXISTS idx_node_forum_replies_author_user_id ON node_forum_replies(author_user_id)',
        ]

        results = []
        for sql in migrations:
            db.session.execute(text(sql))
            results.append(f"Ejecutado: {sql[:60]}...")

        db.session.commit()

        verify_sql = text("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_name IN (
                'node_forum_threads',
                'node_forum_replies'
            )
        """)
        created_tables = [row[0] for row in db.session.execute(verify_sql).fetchall()]

        return jsonify({
            'success': True,
            'message': 'Tablas del foro por nodo creadas exitosamente',
            'migrations_executed': len(migrations),
            'results': results,
            'tables': created_tables
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Error durante la migración del foro por nodo: {str(e)}'
        }), 500


def run_forum_reply_parent_column_migration(db_module):
    """
    Idempotente: añade parent_reply_id e índice en node_forum_replies si faltan.
    Debe ejecutarse dentro de application context. Seguro con arranques concurrentes en Lambda.
    """
    try:
        col_check = text("""
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'node_forum_replies'
              AND column_name = 'parent_reply_id'
            LIMIT 1
        """)
        if not db_module.session.execute(col_check).fetchone():
            tbl_check = text("""
                SELECT 1 FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = 'node_forum_replies'
                LIMIT 1
            """)
            if not db_module.session.execute(tbl_check).fetchone():
                print('Migración foro: tabla node_forum_replies no existe; se omite parent_reply_id.')
                return
            db_module.session.execute(text("""
                ALTER TABLE node_forum_replies
                ADD COLUMN parent_reply_id INTEGER NULL
                REFERENCES node_forum_replies(id) ON DELETE SET NULL
            """))
            db_module.session.commit()
            print('Migración foro: columna parent_reply_id creada.')

        db_module.session.execute(text("""
            CREATE INDEX IF NOT EXISTS ix_node_forum_replies_parent_reply_id
            ON node_forum_replies(parent_reply_id)
        """))
        db_module.session.commit()
    except Exception as e:
        db_module.session.rollback()
        print(f'Migración foro parent_reply_id (no fatal): {e}')


def ensure_forum_reply_parent_column(app, db_module):
    """Ejecuta la migración del foro bajo application context (p. ej. arranque Lambda)."""
    with app.app_context():
        run_forum_reply_parent_column_migration(db_module)


@migration_bp.route('/add-forum-reply-parent-column', methods=['POST'])
def add_forum_reply_parent_column():
    """Añade parent_reply_id a node_forum_replies (respuestas anidadas en el foro)."""
    try:
        data = request.get_json()
        secret_error = _validate_migration_secret(data)
        if secret_error:
            return secret_error

        run_forum_reply_parent_column_migration(db)
        return jsonify({
            'success': True,
            'message': 'Columna parent_reply_id verificada o creada en node_forum_replies.',
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
        }), 500


# === Export de métricas por nodo (solo lectura, protegido por secret) ===
# Reutiliza EXACTAMENTE la lógica del export del dashboard del instructor para
# garantizar paridad de números con los informes previos. Es 100% aditivo: no
# modifica ningún flujo existente.
_METRICS_MODULES_ORDER = [
    'Atención al Cliente',
    'Descubrimiento de Oportunidades',
    'Finanzas',
    'Liderazgo',
    'Marketing Digital',
    'Marketing y Comercialización',
    'Modelo de Negocios',
    'Plan de Inversión',
    'Proyecto de vida',
    'Trabajo en Equipo',
]

_METRICS_MODULE_ALIAS = {
    'Finanzas y Gestión Empresarial': 'Finanzas',
    'Atención al Cliente y Resolución de Conflictos': 'Atención al Cliente',
}


@migration_bp.route('/export-node-metrics', methods=['POST'])
def export_node_metrics():
    """Devuelve resumen por municipio + intentos por módulo (paridad con el
    export 'estadisticas_municipios' del dashboard). Solo lectura."""
    try:
        data = request.get_json()
        secret_error = _validate_migration_secret(data)
        if secret_error:
            return secret_error

        from src.models import User
        from src.routes.instructor import get_progreso_estudiantes
        from src.routes.admin import _build_municipios_summary, _extract_json_payload
        from src.services.student_municipio_service import get_preferred_municipio

        admin_user = (
            User.query.filter_by(rol='admin').first()
            or User.query.filter_by(rol='instructor').first()
        )

        payload = _extract_json_payload(
            get_progreso_estudiantes.__wrapped__.__wrapped__(admin_user)
        )
        progreso = payload.get('progreso_estudiantes') or []

        resumen = _build_municipios_summary(progreso)

        modulos_por_municipio = {}
        for est in progreso:
            municipio = get_preferred_municipio(
                est.get('estudiante_id'), est.get('estudiante'), est.get('municipio')
            ) or 'Sin municipio'
            if municipio == 'Sin municipio':
                continue
            acc = modulos_por_municipio.setdefault(
                municipio, {m: 0 for m in _METRICS_MODULES_ORDER}
            )
            modulos = est.get('modulos') or [est]
            for mod in modulos:
                nombre = (mod.get('modulo') or est.get('modulo') or '').strip()
                nombre = _METRICS_MODULE_ALIAS.get(nombre, nombre)
                pasos = mod.get('progreso_pasos') or est.get('progreso_pasos') or []
                intentos = sum((p.get('intentos') or 0) for p in pasos)
                if nombre in acc:
                    acc[nombre] += intentos

        intentos_por_modulo = []
        for municipio in sorted(modulos_por_municipio.keys()):
            fila = {'municipio': municipio}
            fila.update(modulos_por_municipio[municipio])
            intentos_por_modulo.append(fila)

        return jsonify({
            'success': True,
            'modules_order': _METRICS_MODULES_ORDER,
            'resumen_por_municipio': resumen,
            'intentos_por_modulo': intentos_por_modulo,
            'total_municipios': len(resumen),
            'total_estudiantes': sum(r.get('total_estudiantes', 0) for r in resumen),
        }), 200
    except Exception as e:
        import traceback
        return jsonify({
            'success': False,
            'error': str(e),
            'trace': traceback.format_exc()[-1500:],
        }), 500


@migration_bp.route('/export-forum-node', methods=['POST'])
def export_forum_node():
    """Devuelve hilos + respuestas de un nodo del foro (mismo payload que el
    export del dashboard del instructor). Solo lectura, protegido por secret."""
    try:
        from datetime import datetime as _dt
        data = request.get_json()
        secret_error = _validate_migration_secret(data)
        if secret_error:
            return secret_error

        node_slug = (data or {}).get('node_slug')
        if not node_slug:
            return jsonify({'success': False, 'error': 'node_slug requerido'}), 400

        from src.routes.forum import _thread_query_with_replies, _serialize_thread
        from src.services.forum_node_service import get_forum_node_by_slug
        from src.models import NodeForumThread

        node = get_forum_node_by_slug(node_slug)
        if not node:
            return jsonify({'success': False, 'error': 'Nodo no encontrado.'}), 404

        threads = (
            _thread_query_with_replies()
            .filter_by(node_slug=node['slug'])
            .order_by(NodeForumThread.created_at.asc(), NodeForumThread.updated_at.asc())
            .all()
        )
        replies_count = sum(len(t.replies) for t in threads)

        return jsonify({
            'success': True,
            'data': {
                'node': {**node, 'threads_count': len(threads), 'replies_count': replies_count},
                'exported_at': _dt.utcnow().isoformat(),
                'threads': [_serialize_thread(t, include_replies=True) for t in threads],
            },
        }), 200
    except Exception as e:
        import traceback
        return jsonify({
            'success': False,
            'error': str(e),
            'trace': traceback.format_exc()[-1500:],
        }), 500
