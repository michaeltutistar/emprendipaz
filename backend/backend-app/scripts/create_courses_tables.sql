-- Script SQL para crear las tablas de cursos
-- Ejecutar en pgAdmin en la base de datos elearning_narino

-- Crear tabla cursos
CREATE TABLE IF NOT EXISTS cursos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('video', 'pdf', 'quiz', 'otro')),
    url VARCHAR(500),
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Crear tabla usuarios_cursos para asignaciones
CREATE TABLE IF NOT EXISTS usuarios_cursos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    curso_id INTEGER NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completado')),
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_completado TIMESTAMP NULL,
    progreso INTEGER DEFAULT 0 CHECK (progreso >= 0 AND progreso <= 100),
    fecha_inicio TIMESTAMP NULL,
    fecha_ultima_actividad TIMESTAMP NULL
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_cursos_activo ON cursos(activo);
CREATE INDEX IF NOT EXISTS idx_cursos_tipo ON cursos(tipo);
CREATE INDEX IF NOT EXISTS idx_usuarios_cursos_user_id ON usuarios_cursos(user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_cursos_curso_id ON usuarios_cursos(curso_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_cursos_estado ON usuarios_cursos(estado);
CREATE INDEX IF NOT EXISTS idx_usuarios_cursos_fecha_asignacion ON usuarios_cursos(fecha_asignacion);

-- Crear índice único para evitar asignaciones duplicadas
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_cursos_unique ON usuarios_cursos(user_id, curso_id);

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cursos_updated_at 
    BEFORE UPDATE ON cursos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE cursos IS 'Tabla para almacenar información de cursos disponibles';
COMMENT ON COLUMN cursos.id IS 'Identificador único del curso';
COMMENT ON COLUMN cursos.titulo IS 'Título del curso';
COMMENT ON COLUMN cursos.descripcion IS 'Descripción detallada del curso';
COMMENT ON COLUMN cursos.tipo IS 'Tipo de curso: video, pdf, quiz, otro';
COMMENT ON COLUMN cursos.url IS 'URL o enlace al contenido del curso';
COMMENT ON COLUMN cursos.activo IS 'Indica si el curso está activo y disponible';
COMMENT ON COLUMN cursos.created_at IS 'Fecha de creación del curso';
COMMENT ON COLUMN cursos.updated_at IS 'Fecha de última actualización del curso';

COMMENT ON TABLE usuarios_cursos IS 'Tabla para gestionar asignaciones de cursos a usuarios';
COMMENT ON COLUMN usuarios_cursos.id IS 'Identificador único de la asignación';
COMMENT ON COLUMN usuarios_cursos.user_id IS 'ID del usuario asignado';
COMMENT ON COLUMN usuarios_cursos.curso_id IS 'ID del curso asignado';
COMMENT ON COLUMN usuarios_cursos.estado IS 'Estado del curso para el usuario: pendiente, en_progreso, completado';
COMMENT ON COLUMN usuarios_cursos.fecha_asignacion IS 'Fecha en que se asignó el curso';
COMMENT ON COLUMN usuarios_cursos.fecha_completado IS 'Fecha en que se completó el curso (NULL si no está completado)';
COMMENT ON COLUMN usuarios_cursos.progreso IS 'Porcentaje de progreso del curso (0-100)';
COMMENT ON COLUMN usuarios_cursos.fecha_inicio IS 'Fecha en que el usuario inició el curso';
COMMENT ON COLUMN usuarios_cursos.fecha_ultima_actividad IS 'Fecha de la última actividad en el curso';

-- Insertar algunos cursos de ejemplo
INSERT INTO cursos (titulo, descripcion, tipo, url, activo) VALUES
('Introducción al Emprendimiento', 'Curso básico sobre conceptos de emprendimiento y creación de empresas', 'video', 'https://ejemplo.com/curso1', true),
('Plan de Negocios', 'Guía completa para desarrollar un plan de negocios efectivo', 'pdf', 'https://ejemplo.com/plan-negocios.pdf', true),
('Marketing Digital', 'Fundamentos del marketing digital para emprendedores', 'video', 'https://ejemplo.com/marketing-digital', true),
('Evaluación Final', 'Quiz de evaluación de conocimientos adquiridos', 'quiz', 'https://ejemplo.com/quiz-final', true)
ON CONFLICT DO NOTHING;

-- Verificar que las tablas se crearon correctamente
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('cursos', 'usuarios_cursos')
ORDER BY table_name, ordinal_position;
