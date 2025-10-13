-- Script para crear la tabla de sorteos y auditoría
-- Proyecto: Emprendimiento Jóvenes — Nariño

-- Crear tabla sorteos
CREATE TABLE IF NOT EXISTS sorteos (
    id SERIAL PRIMARY KEY,
    fecha_sorteo TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    administrador_id INTEGER NOT NULL REFERENCES "user"(id),
    descripcion TEXT NOT NULL,
    participantes JSONB NOT NULL,
    resultado JSONB NOT NULL,
    ganador_id INTEGER REFERENCES "user"(id),
    observaciones TEXT,
    archivo_acta BYTEA,
    archivo_acta_nombre VARCHAR(255)
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_sorteos_fecha ON sorteos(fecha_sorteo);
CREATE INDEX IF NOT EXISTS idx_sorteos_admin ON sorteos(administrador_id);
CREATE INDEX IF NOT EXISTS idx_sorteos_ganador ON sorteos(ganador_id);

-- Comentarios en la tabla
COMMENT ON TABLE sorteos IS 'Registro de sorteos públicos para desempate';
COMMENT ON COLUMN sorteos.administrador_id IS 'ID del administrador que ejecutó el sorteo';
COMMENT ON COLUMN sorteos.participantes IS 'JSON con lista de participantes del sorteo';
COMMENT ON COLUMN sorteos.resultado IS 'JSON con resultado del sorteo y proceso';
COMMENT ON COLUMN sorteos.ganador_id IS 'ID del usuario ganador del sorteo';
COMMENT ON COLUMN sorteos.archivo_acta IS 'Archivo PDF del acta de sorteo';
COMMENT ON COLUMN sorteos.archivo_acta_nombre IS 'Nombre del archivo del acta';

-- Verificar que la tabla se creó correctamente
SELECT 
    COUNT(*) as total_sorteos,
    COUNT(DISTINCT administrador_id) as administradores_activos,
    COUNT(DISTINCT ganador_id) as ganadores_unicos
FROM sorteos;
