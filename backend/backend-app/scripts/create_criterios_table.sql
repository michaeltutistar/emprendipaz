-- Script para crear la tabla criterios_evaluacion
-- Proyecto: Emprendimiento Jóvenes — Nariño

-- Crear tabla criterios_evaluacion
CREATE TABLE IF NOT EXISTS criterios_evaluacion (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    descripcion TEXT NOT NULL,
    peso DECIMAL(5,2) NOT NULL,
    max_puntaje INTEGER NOT NULL,
    orden INTEGER NOT NULL UNIQUE,
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_criterios_codigo ON criterios_evaluacion(codigo);
CREATE INDEX IF NOT EXISTS idx_criterios_orden ON criterios_evaluacion(orden);
CREATE INDEX IF NOT EXISTS idx_criterios_activo ON criterios_evaluacion(activo);

-- Comentarios en la tabla
COMMENT ON TABLE criterios_evaluacion IS 'Criterios de evaluación para el proyecto Emprendimiento Jóvenes — Nariño';
COMMENT ON COLUMN criterios_evaluacion.codigo IS 'Código único del criterio (ej: CRIT001)';
COMMENT ON COLUMN criterios_evaluacion.descripcion IS 'Descripción detallada del criterio';
COMMENT ON COLUMN criterios_evaluacion.peso IS 'Peso del criterio en porcentaje (ej: 25.50)';
COMMENT ON COLUMN criterios_evaluacion.max_puntaje IS 'Puntaje máximo que se puede asignar al criterio';
COMMENT ON COLUMN criterios_evaluacion.orden IS 'Orden de presentación del criterio';
COMMENT ON COLUMN criterios_evaluacion.activo IS 'Indica si el criterio está activo';
COMMENT ON COLUMN criterios_evaluacion.observaciones IS 'Observaciones adicionales del criterio';

-- Insertar criterios de ejemplo (según TDR)
INSERT INTO criterios_evaluacion (codigo, descripcion, peso, max_puntaje, orden, observaciones) VALUES
('CRIT001', 'Viabilidad del proyecto de emprendimiento', 25.00, 100, 1, 'Evaluación de la factibilidad técnica y comercial'),
('CRIT002', 'Innovación y diferenciación', 20.00, 100, 2, 'Grado de innovación y diferenciación del producto/servicio'),
('CRIT003', 'Impacto social y comunitario', 20.00, 100, 3, 'Contribución al desarrollo social y comunitario'),
('CRIT004', 'Sostenibilidad financiera', 15.00, 100, 4, 'Viabilidad financiera y sostenibilidad del proyecto'),
('CRIT005', 'Capacidad de ejecución del emprendedor', 20.00, 100, 5, 'Competencias y habilidades del emprendedor')
ON CONFLICT (codigo) DO NOTHING;

-- Verificar que la suma de pesos sea 100%
SELECT 
    COUNT(*) as total_criterios,
    SUM(peso) as total_peso,
    CASE 
        WHEN SUM(peso) = 100.00 THEN 'PESOS VÁLIDOS' 
        ELSE 'PESOS INVÁLIDOS - Total: ' || SUM(peso) || '%'
    END as validacion_pesos
FROM criterios_evaluacion 
WHERE activo = true;
