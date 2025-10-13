-- Script para actualizar la tabla curso con nuevos campos
-- Ejecutar en pgAdmin o directamente en PostgreSQL

-- Agregar nuevas columnas a la tabla curso
ALTER TABLE curso 
ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS fecha_apertura TIMESTAMP,
ADD COLUMN IF NOT EXISTS fecha_cierre TIMESTAMP,
ADD COLUMN IF NOT EXISTS duracion_horas INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS nivel VARCHAR(50) DEFAULT 'básico',
ADD COLUMN IF NOT EXISTS categoria VARCHAR(100),
ADD COLUMN IF NOT EXISTS imagen_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS max_estudiantes INTEGER DEFAULT 0;

-- Crear trigger para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger si no existe
DROP TRIGGER IF EXISTS trigger_update_fecha_actualizacion ON curso;
CREATE TRIGGER trigger_update_fecha_actualizacion
    BEFORE UPDATE ON curso
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion();

-- Insertar algunos cursos de ejemplo
INSERT INTO curso (titulo, descripcion, instructor_id, estado, fecha_creacion, fecha_apertura, duracion_horas, nivel, categoria) 
VALUES 
    ('Introducción a la Programación', 'Curso básico de programación para principiantes', 1, 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '7 days', 40, 'básico', 'Programación'),
    ('Desarrollo Web Avanzado', 'Curso avanzado de desarrollo web con React y Node.js', 1, 'activo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '14 days', 60, 'avanzado', 'Desarrollo Web'),
    ('Gestión de Proyectos', 'Fundamentos de gestión de proyectos ágiles', 1, 'borrador', CURRENT_TIMESTAMP, NULL, 30, 'intermedio', 'Gestión')
ON CONFLICT (id) DO NOTHING;

-- Verificar los cambios
SELECT 
    id, 
    titulo, 
    instructor_id, 
    estado, 
    fecha_creacion, 
    fecha_actualizacion,
    fecha_apertura,
    duracion_horas,
    nivel,
    categoria
FROM curso 
ORDER BY fecha_creacion DESC; 