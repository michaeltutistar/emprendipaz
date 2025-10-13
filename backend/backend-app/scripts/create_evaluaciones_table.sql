-- Script para crear la tabla evaluaciones
-- Proyecto: Emprendimiento Jóvenes — Nariño

-- Crear tabla evaluaciones
CREATE TABLE IF NOT EXISTS evaluaciones (
    id SERIAL PRIMARY KEY,
    evaluador_id INTEGER NOT NULL REFERENCES "user"(id),
    usuario_id INTEGER NOT NULL REFERENCES "user"(id),
    criterio_id INTEGER NOT NULL REFERENCES criterios_evaluacion(id),
    puntaje INTEGER NOT NULL,
    observaciones TEXT,
    fecha_evaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_evaluaciones_evaluador ON evaluaciones(evaluador_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_usuario ON evaluaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_criterio ON evaluaciones(criterio_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_fecha ON evaluaciones(fecha_evaluacion);

-- Crear índice único para evitar evaluaciones duplicadas
CREATE UNIQUE INDEX IF NOT EXISTS idx_evaluaciones_unique ON evaluaciones(usuario_id, criterio_id);

-- Comentarios en la tabla
COMMENT ON TABLE evaluaciones IS 'Evaluaciones individuales de usuarios por criterios';
COMMENT ON COLUMN evaluaciones.evaluador_id IS 'ID del administrador que realiza la evaluación';
COMMENT ON COLUMN evaluaciones.usuario_id IS 'ID del usuario evaluado';
COMMENT ON COLUMN evaluaciones.criterio_id IS 'ID del criterio de evaluación';
COMMENT ON COLUMN evaluaciones.puntaje IS 'Puntaje asignado (0 a max_puntaje del criterio)';
COMMENT ON COLUMN evaluaciones.observaciones IS 'Observaciones del evaluador';
COMMENT ON COLUMN evaluaciones.fecha_evaluacion IS 'Fecha y hora de la evaluación';

-- Verificar que la tabla se creó correctamente
SELECT 
    COUNT(*) as total_evaluaciones,
    COUNT(DISTINCT usuario_id) as usuarios_evaluados,
    COUNT(DISTINCT criterio_id) as criterios_utilizados,
    AVG(puntaje) as puntaje_promedio
FROM evaluaciones;
