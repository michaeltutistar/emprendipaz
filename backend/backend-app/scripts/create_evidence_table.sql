-- Script SQL para crear la tabla de evidencias de funcionamiento
-- Crear tabla evidencias_funcionamiento
CREATE TABLE IF NOT EXISTS evidencias_funcionamiento (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('formal', 'informal')),
    archivo1 BYTEA,
    archivo1_nombre VARCHAR(255),
    archivo2 BYTEA,
    archivo2_nombre VARCHAR(255),
    observaciones TEXT,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    estado_revision VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado_revision IN ('pendiente', 'aprobado', 'rechazado')),
    fecha_revision TIMESTAMP NULL,
    revisado_por INTEGER REFERENCES "user"(id) NULL
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_evidencias_user_id ON evidencias_funcionamiento(user_id);
CREATE INDEX IF NOT EXISTS idx_evidencias_tipo ON evidencias_funcionamiento(tipo);
CREATE INDEX IF NOT EXISTS idx_evidencias_estado ON evidencias_funcionamiento(estado_revision);
CREATE INDEX IF NOT EXISTS idx_evidencias_fecha_subida ON evidencias_funcionamiento(fecha_subida);

-- Comentarios para documentar la tabla
COMMENT ON TABLE evidencias_funcionamiento IS 'Evidencias de funcionamiento de emprendimientos (6 meses)';
COMMENT ON COLUMN evidencias_funcionamiento.tipo IS 'Tipo de emprendimiento: formal (con matrícula) o informal (sin matrícula)';
COMMENT ON COLUMN evidencias_funcionamiento.archivo1 IS 'Primer archivo: matrícula mercantil (formal) o publicaciones redes (informal)';
COMMENT ON COLUMN evidencias_funcionamiento.archivo2 IS 'Segundo archivo: facturas (formal) o registro ventas (informal)';
COMMENT ON COLUMN evidencias_funcionamiento.estado_revision IS 'Estado de revisión: pendiente, aprobado, rechazado';
