from flask import Blueprint, jsonify, request
from src.models import db
from sqlalchemy import text
import json

db_query_bp = Blueprint('db_query', __name__)

@db_query_bp.route('/db-query', methods=['POST'])
def execute_db_query():
    """
    Endpoint temporal para ejecutar consultas SQL de forma segura
    """
    try:
        data = request.json
        query = data.get('query')
        
        if not query:
            return jsonify({'error': 'Query requerida'}), 400
        
        # Lista de consultas permitidas (SELECT y ALTER TABLE)
        allowed_queries = [
            'SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = \'user\' ORDER BY ordinal_position',
            'SELECT id, nombre, apellido, email, rol, estado_cuenta FROM "user" ORDER BY id DESC LIMIT 10',
            'SELECT id, nombre, apellido, doc_terminos_pdf_nombre, doc_uso_imagen_pdf_nombre, doc_vecindad_pdf_nombre FROM "user" WHERE doc_terminos_pdf_nombre IS NOT NULL LIMIT 5',
            'SELECT estado_cuenta, COUNT(*) as total FROM "user" GROUP BY estado_cuenta',
            'SELECT COUNT(*) as total_users FROM "user"',
            'SELECT rol, COUNT(*) as total FROM "user" GROUP BY rol',
            'SELECT id, nombre, apellido, email, estado_cuenta FROM "user" WHERE rol = \'evaluador\'',
            'SELECT id, nombre, apellido, email, rol FROM "user" WHERE estado_cuenta = \'pendiente\' LIMIT 10',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS declaracion_juramentada_pdf BYTEA, ADD COLUMN IF NOT EXISTS declaracion_juramentada_pdf_nombre VARCHAR(255)',
            'SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = \'user\' AND column_name LIKE \'%declaracion_juramentada%\' ORDER BY ordinal_position',
            'SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = \'user\' AND column_name LIKE \'%declaracion_capacidad_legal%\' ORDER BY ordinal_position',
            'SELECT id, nombre, apellido, email, declaracion_capacidad_legal_pdf_nombre FROM "user" WHERE declaracion_capacidad_legal_pdf_nombre IS NOT NULL LIMIT 5',
            # Nuevas consultas para los campos de documentos del paso 7
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS mujer_cabeza_familia_pdf TEXT',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS persona_discapacidad_pdf TEXT',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS mujer_cabeza_familia_pdf_nombre VARCHAR(255)',
            'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS persona_discapacidad_pdf_nombre VARCHAR(255)',
            'SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = \'user\' AND column_name LIKE \'%mujer_cabeza_familia%\' ORDER BY ordinal_position',
            'SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = \'user\' AND column_name LIKE \'%persona_discapacidad%\' ORDER BY ordinal_position',
            'SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'user\' AND (column_name = \'mujer_cabeza_familia_pdf\' OR column_name = \'persona_discapacidad_pdf\')',
            'SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'user\' AND (column_name LIKE \'%mujer_cabeza_familia%\' OR column_name LIKE \'%persona_discapacidad%\')',
            # Consultas para diagnosticar y corregir el problema de Gabriela Sotelo
            'SELECT id, nombre, apellido, numero_documento, email, paso_actual, formulario_enviado, estado_inscripcion FROM "user" WHERE CAST(numero_documento AS TEXT) = \'1193049699\'',
            'SELECT id, nombre, apellido, numero_documento, email FROM "user" WHERE nombre = \'Gabriela\' AND apellido = \'Sotelo\'',
            'SELECT id, nombre, apellido, numero_documento, email, rol FROM "user" WHERE rol = \'estudiante\' ORDER BY id DESC LIMIT 30',
            'SELECT id, nombre, apellido, numero_documento, email, fecha_creacion FROM "user" WHERE fecha_creacion >= \'2025-10-02\' AND fecha_creacion < \'2025-10-03\' ORDER BY fecha_creacion DESC',
            # Consultas adicionales para encontrar a Gabriela
            'SELECT id, nombre, apellido, numero_documento, email, rol FROM "user" WHERE nombre ILIKE \'%gabriela%\' OR apellido ILIKE \'%sotelo%\'',
            'SELECT id, nombre, apellido, numero_documento, email, rol FROM "user" WHERE numero_documento = 1193049699',
            'SELECT id, nombre, apellido, numero_documento, email, rol, estado_inscripcion, paso_actual FROM "user" WHERE numero_documento::text = \'1193049699\'',
            'SELECT id, nombre, apellido, numero_documento, email, rol FROM "user" ORDER BY id DESC LIMIT 50',
            'SELECT DISTINCT rol FROM "user"',
            'SELECT id, nombre, apellido, numero_documento, email, rol, estado_inscripcion FROM "user" WHERE estado_inscripcion = \'in_progreso\'',
            # Consulta específica para Gabriela Sotelo
            'SELECT id, nombre, apellido, numero_documento, email, rol, estado_inscripcion, paso_actual, formulario_enviado, estado_cuenta FROM "user" WHERE id = 628',
            # Consulta para actualizar el estado de Gabriela
            'UPDATE "user" SET estado_inscripcion = \'in_progreso\' WHERE id = 628',
            # Consultas para limpiar espacios en numero_documento de Gabriela
            'SELECT id, nombre, apellido, numero_documento, email, rol, estado_inscripcion, paso_actual FROM "user" WHERE id = 628',
            'UPDATE "user" SET numero_documento = TRIM(numero_documento) WHERE id = 628'
        ]
        
        # Verificar que la consulta esté en la lista permitida
        if query not in allowed_queries:
            return jsonify({
                'error': 'Consulta no permitida',
                'allowed_queries': allowed_queries
            }), 400
        
        # Ejecutar la consulta
        result = db.session.execute(text(query))
        
        if result.returns_rows:
            # Para consultas SELECT
            columns = result.keys()
            rows = result.fetchall()
            
            # Convertir a lista de diccionarios
            data = []
            for row in rows:
                row_dict = {}
                for i, column in enumerate(columns):
                    row_dict[column] = row[i]
                data.append(row_dict)
            
            return jsonify({
                'success': True,
                'data': data,
                'row_count': len(data)
            })
        else:
            # Para consultas que no retornan filas (ALTER TABLE, etc.)
            db.session.commit()  # IMPORTANTE: Confirmar los cambios en la base de datos
            return jsonify({
                'success': True,
                'message': 'Consulta ejecutada exitosamente',
                'row_count': 0
            })
            
    except Exception as e:
        return jsonify({
            'error': f'Error ejecutando consulta: {str(e)}'
        }), 500
