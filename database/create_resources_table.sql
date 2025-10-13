-- Script para crear la tabla de recursos
-- Ejecutar en pgAdmin o directamente en PostgreSQL

-- Crear tabla de recursos
CREATE TABLE IF NOT EXISTS recurso (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50) NOT NULL,
    categoria VARCHAR(100),
    
    -- URLs de S3
    s3_key VARCHAR(500) NOT NULL,
    s3_url VARCHAR(500) NOT NULL,
    s3_bucket VARCHAR(100) NOT NULL,
    
    -- Metadatos del archivo
    nombre_original VARCHAR(255) NOT NULL,
    extension VARCHAR(20) NOT NULL,
    tamano_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    
    -- Relaciones
    curso_id INTEGER REFERENCES curso(id) ON DELETE SET NULL,
    modulo_id INTEGER REFERENCES modulo(id) ON DELETE SET NULL,
    leccion_id INTEGER REFERENCES leccion(id) ON DELETE SET NULL,
    subido_por INTEGER REFERENCES "user"(id) NOT NULL,
    
    -- Estados y fechas
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Configuración de acceso
    acceso_publico BOOLEAN DEFAULT TRUE,
    requiere_autenticacion BOOLEAN DEFAULT FALSE
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_recurso_tipo ON recurso(tipo);
CREATE INDEX IF NOT EXISTS idx_recurso_categoria ON recurso(categoria);
CREATE INDEX IF NOT EXISTS idx_recurso_curso ON recurso(curso_id);
CREATE INDEX IF NOT EXISTS idx_recurso_modulo ON recurso(modulo_id);
CREATE INDEX IF NOT EXISTS idx_recurso_leccion ON recurso(leccion_id);
CREATE INDEX IF NOT EXISTS idx_recurso_subido_por ON recurso(subido_por);
CREATE INDEX IF NOT EXISTS idx_recurso_estado ON recurso(estado);
CREATE INDEX IF NOT EXISTS idx_recurso_fecha_creacion ON recurso(fecha_creacion);

-- Crear trigger para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_recurso_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para recursos si no existe
DROP TRIGGER IF EXISTS trigger_update_recurso_fecha_actualizacion ON recurso;
CREATE TRIGGER trigger_update_recurso_fecha_actualizacion
    BEFORE UPDATE ON recurso
    FOR EACH ROW
    EXECUTE FUNCTION update_recurso_fecha_actualizacion();

-- Insertar algunos recursos de ejemplo (sin archivos reales)
INSERT INTO recurso (
    titulo, 
    descripcion, 
    tipo, 
    categoria, 
    s3_key, 
    s3_url, 
    s3_bucket, 
    nombre_original, 
    extension, 
    tamano_bytes, 
    mime_type, 
    subido_por, 
    estado
) VALUES 
    (
        'Manual de Usuario - Plataforma E-Learning',
        'Guía completa para el uso de la plataforma de aprendizaje virtual',
        'pdf',
        'documentacion',
        'uploads/2024/01/01/manual-usuario.pdf',
        'https://elearning-narino-resources.s3.amazonaws.com/uploads/2024/01/01/manual-usuario.pdf',
        'elearning-narino-resources',
        'manual-usuario.pdf',
        '.pdf',
        2048576,
        'application/pdf',
        1,
        'activo'
    ),
    (
        'Video Tutorial - Introducción a la Programación',
        'Video explicativo sobre los conceptos básicos de programación',
        'video',
        'tutorial',
        'uploads/2024/01/01/tutorial-programacion.mp4',
        'https://elearning-narino-resources.s3.amazonaws.com/uploads/2024/01/01/tutorial-programacion.mp4',
        'elearning-narino-resources',
        'tutorial-programacion.mp4',
        '.mp4',
        52428800,
        'video/mp4',
        1,
        'activo'
    ),
    (
        'Presentación - Gestión de Proyectos',
        'Diapositivas sobre metodologías de gestión de proyectos',
        'presentacion',
        'academico',
        'uploads/2024/01/01/gestion-proyectos.pptx',
        'https://elearning-narino-resources.s3.amazonaws.com/uploads/2024/01/01/gestion-proyectos.pptx',
        'elearning-narino-resources',
        'gestion-proyectos.pptx',
        '.pptx',
        1048576,
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        1,
        'activo'
    )
ON CONFLICT (id) DO NOTHING;

-- Verificar los cambios
SELECT 
    'Recursos creados:' as info,
    COUNT(*) as total
FROM recurso;

-- Mostrar estructura de la tabla
SELECT 
    'Estructura de tabla recurso:' as info;
\d recurso; 