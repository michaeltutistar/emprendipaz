from flask import Blueprint, jsonify, request
from src.services.auth_service import token_required, admin_required
from src.models import db
from sqlalchemy import text

migration_bp = Blueprint('migration', __name__)

@migration_bp.route('/execute-sql-migration', methods=['POST'])
def execute_sql_migration():
    """Endpoint temporal sin autenticación para ejecutar migración SQL
    Requiere una clave secreta en el body"""
    try:
        # Validar clave secreta
        data = request.get_json()
        secret_key = data.get('secret_key')
        
        # Clave secreta temporal para la migración
        MIGRATION_SECRET = 'asdf#FGSgvasgf$5$WGT_migration_2025'
        
        if secret_key != MIGRATION_SECRET:
            return jsonify({
                'success': False,
                'error': 'Clave secreta inválida'
            }), 403
        
        # Población Diferencial (Paso 2) + Emprendimiento (Paso 3) + Financiación (Paso 10)
        migrations = [
            # Paso 2: Población Diferencial
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS mujer_cabeza_familia BOOLEAN DEFAULT FALSE',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS victima_conflicto BOOLEAN DEFAULT FALSE',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS persona_discapacidad BOOLEAN DEFAULT FALSE',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS pertenencia_etnica BOOLEAN DEFAULT FALSE',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS sisben_grupo VARCHAR(10)',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS persona_reincorporacion BOOLEAN DEFAULT FALSE',
            # Paso 3: Emprendimiento
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS tiempo_funcionamiento VARCHAR(50)',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS empleos_generados VARCHAR(50)',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS acceso_mercados VARCHAR(100)',
            # Paso 10: Financiación de Otras Fuentes
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS financiado_estado BOOLEAN',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS financiado_regalias BOOLEAN DEFAULT FALSE',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS financiado_camara_comercio BOOLEAN DEFAULT FALSE',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS financiado_incubadoras BOOLEAN DEFAULT FALSE',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS financiado_otro BOOLEAN DEFAULT FALSE',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS financiado_otro_texto VARCHAR(500)',
        ]
        
        results = []
        for sql in migrations:
            db.session.execute(text(sql))
            results.append(f"Ejecutado: {sql[:60]}...")
        
        db.session.commit()
        
        # Verificar columnas creadas
        verify_sql = text("""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'user' 
            AND column_name IN (
                'mujer_cabeza_familia',
                'victima_conflicto',
                'persona_discapacidad',
                'pertenencia_etnica',
                'sisben_grupo',
                'persona_reincorporacion',
                'tiempo_funcionamiento',
                'empleos_generados',
                'acceso_mercados',
                'financiado_estado',
                'financiado_regalias',
                'financiado_camara_comercio',
                'financiado_incubadoras',
                'financiado_otro',
                'financiado_otro_texto'
            )
            ORDER BY column_name
        """)
        
        result = db.session.execute(verify_sql)
        columns = result.fetchall()
        
        columns_info = [
            {
                'column_name': col[0],
                'data_type': col[1],
                'is_nullable': col[2]
            }
            for col in columns
        ]
        
        return jsonify({
            'success': True,
            'message': 'Migración completada exitosamente',
            'migrations_executed': len(migrations),
            'results': results,
            'columns_created': columns_info
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Error durante la migración: {str(e)}'
        }), 500

@migration_bp.route('/add-missing-columns', methods=['POST'])
@token_required
@admin_required
def add_missing_columns(current_user):
    """Endpoint original con autenticación (para uso futuro)"""
    try:
        # Población Diferencial (Paso 2)
        migrations = [
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS mujer_cabeza_familia BOOLEAN DEFAULT FALSE',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS victima_conflicto BOOLEAN DEFAULT FALSE',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS persona_discapacidad BOOLEAN DEFAULT FALSE',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS pertenencia_etnica BOOLEAN DEFAULT FALSE',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS sisben_grupo VARCHAR(10)',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS persona_reincorporacion BOOLEAN DEFAULT FALSE',
            # Información del Emprendimiento (Paso 3)
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS tiempo_funcionamiento VARCHAR(50)',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS empleos_generados VARCHAR(50)',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS acceso_mercados VARCHAR(100)',
        ]
        
        results = []
        for sql in migrations:
            db.session.execute(text(sql))
            results.append(f"Ejecutado: {sql[:80]}...")
        
        db.session.commit()
        
        # Verificar columnas creadas
        verify_sql = text("""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'user' 
            AND column_name IN (
                'mujer_cabeza_familia',
                'victima_conflicto',
                'persona_discapacidad',
                'pertenencia_etnica',
                'sisben_grupo',
                'persona_reincorporacion',
                'tiempo_funcionamiento',
                'empleos_generados',
                'acceso_mercados'
            )
            ORDER BY column_name
        """)
        
        result = db.session.execute(verify_sql)
        columns = result.fetchall()
        
        columns_info = [
            {
                'column_name': col[0],
                'data_type': col[1],
                'is_nullable': col[2]
            }
            for col in columns
        ]
        
        return jsonify({
            'success': True,
            'message': 'Migración completada exitosamente',
            'migrations_executed': len(migrations),
            'results': results,
            'columns_created': columns_info
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': f'Error durante la migración: {str(e)}'
        }), 500

