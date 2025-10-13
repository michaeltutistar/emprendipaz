import os
import sys

# Asegurar que podamos importar src.*
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_APP_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_APP_DIR not in sys.path:
    sys.path.insert(0, BACKEND_APP_DIR)

# Variables de entorno para producción si no están definidas
os.environ.setdefault('FLASK_ENV', 'production')
os.environ.setdefault(
    'DATABASE_URL',
    'postgresql+psycopg://elearning_user:password_seguro@localhost:5433/elearning_narino'
)

from src.main import app  # noqa: E402
from src.models import db  # noqa: E402
from src.constants.municipios import MUNICIPIOS_POR_SUBREGION, MUNICIPIO_A_CUPO  # noqa: E402

SQL_ALTERS = [
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS telefono VARCHAR(20)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS sexo VARCHAR(20)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS estado_civil VARCHAR(30)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS direccion VARCHAR(255)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS municipio VARCHAR(120)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS pais VARCHAR(100)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS ciudad VARCHAR(100)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS bio TEXT',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS convocatoria VARCHAR(20)',
    # Emprendimiento
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS emprendimiento_nombre VARCHAR(200)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS emprendimiento_sector VARCHAR(80)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS tipo_persona VARCHAR(20)',
    # Documentos específicos
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS doc_terminos_pdf BYTEA',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS doc_terminos_pdf_nombre VARCHAR(255)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS doc_uso_imagen_pdf BYTEA',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS doc_uso_imagen_pdf_nombre VARCHAR(255)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS doc_plan_negocio_xls BYTEA',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS doc_plan_negocio_nombre VARCHAR(255)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS doc_vecindad_pdf BYTEA',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS doc_vecindad_pdf_nombre VARCHAR(255)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS video_url VARCHAR(500)',
    # Documentos condicionales según tipo de persona
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS rut_pdf BYTEA',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS rut_pdf_nombre VARCHAR(255)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS cedula_pdf BYTEA',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS cedula_pdf_nombre VARCHAR(255)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS cedula_representante_pdf BYTEA',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS cedula_representante_pdf_nombre VARCHAR(255)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS cert_existencia_pdf BYTEA',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS cert_existencia_pdf_nombre VARCHAR(255)',
    # Documentación diferencial (subsanable/opcional)
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS ruv_pdf BYTEA',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS ruv_pdf_nombre VARCHAR(255)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS sisben_pdf BYTEA',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS sisben_pdf_nombre VARCHAR(255)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS grupo_etnico_pdf BYTEA',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS grupo_etnico_pdf_nombre VARCHAR(255)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS arn_pdf BYTEA',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS arn_pdf_nombre VARCHAR(255)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS discapacidad_pdf BYTEA',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS discapacidad_pdf_nombre VARCHAR(255)',
    # Documentación de control (obligatoria)
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS antecedentes_fiscales_pdf BYTEA',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS antecedentes_fiscales_pdf_nombre VARCHAR(255)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS antecedentes_disciplinarios_pdf BYTEA',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS antecedentes_disciplinarios_pdf_nombre VARCHAR(255)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS antecedentes_judiciales_pdf BYTEA',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS antecedentes_judiciales_pdf_nombre VARCHAR(255)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS redam_pdf BYTEA',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS redam_pdf_nombre VARCHAR(255)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS inhabilidades_sexuales_pdf BYTEA',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS inhabilidades_sexuales_pdf_nombre VARCHAR(255)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS declaracion_capacidad_legal_pdf BYTEA',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS declaracion_capacidad_legal_pdf_nombre VARCHAR(255)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS estado_control VARCHAR(20) DEFAULT \'pendiente\'',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS resultado_certificados VARCHAR(30) DEFAULT \'pendiente\'',
    # Certificación de Funcionamiento del Emprendimiento
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS emprendimiento_formalizado BOOLEAN',
    # Documentos para emprendimientos formalizados
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS matricula_mercantil_pdf BYTEA',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS matricula_mercantil_pdf_nombre VARCHAR(255)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS facturas_6meses_pdf BYTEA',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS facturas_6meses_pdf_nombre VARCHAR(255)',
    # Documentos para emprendimientos informales
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS publicaciones_redes_pdf BYTEA',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS publicaciones_redes_pdf_nombre VARCHAR(255)',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS registro_ventas_pdf BYTEA',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS registro_ventas_pdf_nombre VARCHAR(255)',
    # Financiación de Otras Fuentes
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS financiado_estado BOOLEAN',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS financiado_regalias BOOLEAN DEFAULT FALSE',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS financiado_camara_comercio BOOLEAN DEFAULT FALSE',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS financiado_incubadoras BOOLEAN DEFAULT FALSE',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS financiado_otro BOOLEAN DEFAULT FALSE',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS financiado_otro_texto VARCHAR(500)',
    # Declaraciones y Aceptaciones (obligatorias para cumplimiento legal)
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS declara_veraz BOOLEAN NOT NULL DEFAULT FALSE',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS declara_no_beneficiario BOOLEAN NOT NULL DEFAULT FALSE',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS acepta_terminos BOOLEAN NOT NULL DEFAULT FALSE',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS fecha_aceptacion_terminos TIMESTAMP NULL',
    # Estado de inscripción y progreso (para guardado parcial)
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS estado_inscripcion VARCHAR(20) DEFAULT \'en_progreso\'',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS paso_actual INTEGER DEFAULT 1',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS fecha_ultimo_guardado TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS formulario_enviado BOOLEAN DEFAULT FALSE',
    # Tabla curso
    'ALTER TABLE "curso" ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP NULL',
    'ALTER TABLE "curso" ADD COLUMN IF NOT EXISTS fecha_apertura TIMESTAMP NULL',
    'ALTER TABLE "curso" ADD COLUMN IF NOT EXISTS fecha_cierre TIMESTAMP NULL',
    'ALTER TABLE "curso" ADD COLUMN IF NOT EXISTS duracion_horas INTEGER DEFAULT 0',
    'ALTER TABLE "curso" ADD COLUMN IF NOT EXISTS nivel VARCHAR(50)',
    'ALTER TABLE "curso" ADD COLUMN IF NOT EXISTS categoria VARCHAR(100)',
    'ALTER TABLE "curso" ADD COLUMN IF NOT EXISTS imagen_url VARCHAR(500)',
    'ALTER TABLE "curso" ADD COLUMN IF NOT EXISTS max_estudiantes INTEGER DEFAULT 0',
    'ALTER TABLE "curso" ADD COLUMN IF NOT EXISTS convocatoria VARCHAR(20)',
    # Cupos
    """CREATE TABLE IF NOT EXISTS cupos_config (
      id SERIAL PRIMARY KEY,
      convocatoria VARCHAR(50) NOT NULL DEFAULT '2025',
      modo VARCHAR(20) NOT NULL DEFAULT 'abierto',
      cupo_global_max INTEGER NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )""",
    """CREATE TABLE IF NOT EXISTS municipio_cupo (
      id SERIAL PRIMARY KEY,
      municipio_slug VARCHAR(120) UNIQUE NOT NULL,
      subregion VARCHAR(80) NOT NULL,
      cupo_max INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )"""
]

if __name__ == '__main__':
    with app.app_context():
        engine = db.engine
        with engine.begin() as conn:
            for stmt in SQL_ALTERS:
                conn.exec_driver_sql(stmt)
            # Poblar municipio_cupo si está vacío
            res = conn.exec_driver_sql('SELECT COUNT(*) FROM municipio_cupo')
            count = res.scalar() if res else 0
            if count == 0:
                for subregion, items in MUNICIPIOS_POR_SUBREGION.items():
                    for m in items:
                        cupo = MUNICIPIO_A_CUPO.get(m, 0)
                        conn.exec_driver_sql(
                            'INSERT INTO municipio_cupo (municipio_slug, subregion, cupo_max) VALUES (%s, %s, %s) ON CONFLICT (municipio_slug) DO NOTHING',
                            (m, subregion, cupo)
                        )
            # Crear config por defecto si no existe
            res2 = conn.exec_driver_sql('SELECT COUNT(*) FROM cupos_config')
            count2 = res2.scalar() if res2 else 0
            if count2 == 0:
                conn.exec_driver_sql("INSERT INTO cupos_config (convocatoria, modo, cupo_global_max) VALUES ('2025', 'abierto', NULL)")
            # Asegurar tabla de log_actividad
            conn.exec_driver_sql(
                """CREATE TABLE IF NOT EXISTS log_actividad (
                    id SERIAL PRIMARY KEY,
                    usuario_id INTEGER NULL,
                    accion VARCHAR(100) NOT NULL,
                    detalles TEXT NULL,
                    fecha TIMESTAMP DEFAULT NOW()
                )"""
            )
        print('OK: schema user aligned')
