-- Script para crear las tablas de módulos y lecciones
-- Ejecutar en pgAdmin o directamente en PostgreSQL

-- Crear tabla de módulos
CREATE TABLE IF NOT EXISTS modulo (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    curso_id INTEGER REFERENCES curso(id) ON DELETE CASCADE,
    orden INTEGER DEFAULT 1,
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de lecciones
CREATE TABLE IF NOT EXISTS leccion (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    contenido TEXT,
    modulo_id INTEGER REFERENCES modulo(id) ON DELETE CASCADE,
    orden INTEGER DEFAULT 1,
    tipo VARCHAR(50) DEFAULT 'texto',
    duracion_minutos INTEGER DEFAULT 0,
    url_video VARCHAR(500),
    archivo_url VARCHAR(500),
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_modulo_curso ON modulo(curso_id);
CREATE INDEX IF NOT EXISTS idx_modulo_orden ON modulo(orden);
CREATE INDEX IF NOT EXISTS idx_leccion_modulo ON leccion(modulo_id);
CREATE INDEX IF NOT EXISTS idx_leccion_orden ON leccion(orden);

-- Crear trigger para actualizar fecha_actualizacion automáticamente en módulos
CREATE OR REPLACE FUNCTION update_modulo_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para módulos si no existe
DROP TRIGGER IF EXISTS trigger_update_modulo_fecha_actualizacion ON modulo;
CREATE TRIGGER trigger_update_modulo_fecha_actualizacion
    BEFORE UPDATE ON modulo
    FOR EACH ROW
    EXECUTE FUNCTION update_modulo_fecha_actualizacion();

-- Crear trigger para actualizar fecha_actualizacion automáticamente en lecciones
CREATE OR REPLACE FUNCTION update_leccion_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para lecciones si no existe
DROP TRIGGER IF EXISTS trigger_update_leccion_fecha_actualizacion ON leccion;
CREATE TRIGGER trigger_update_leccion_fecha_actualizacion
    BEFORE UPDATE ON leccion
    FOR EACH ROW
    EXECUTE FUNCTION update_leccion_fecha_actualizacion();

-- Insertar algunos módulos de ejemplo
INSERT INTO modulo (titulo, descripcion, curso_id, orden, estado) 
VALUES 
    ('Fundamentos de Programación', 'Conceptos básicos de programación y lógica', 1, 1, 'activo'),
    ('Estructuras de Datos', 'Arrays, listas, pilas y colas', 1, 2, 'activo'),
    ('Algoritmos Básicos', 'Algoritmos de búsqueda y ordenamiento', 1, 3, 'activo')
ON CONFLICT (id) DO NOTHING;

-- Insertar algunas lecciones de ejemplo
INSERT INTO leccion (titulo, descripcion, contenido, modulo_id, orden, tipo, duracion_minutos) 
VALUES 
    ('¿Qué es la programación?', 'Introducción a los conceptos básicos', 'La programación es el proceso de crear instrucciones para que una computadora ejecute tareas específicas...', 1, 1, 'texto', 30),
    ('Variables y Tipos de Datos', 'Conceptos fundamentales de variables', 'Las variables son contenedores que almacenan datos en memoria...', 1, 2, 'texto', 45),
    ('Estructuras de Control', 'Condicionales y bucles', 'Las estructuras de control permiten tomar decisiones y repetir código...', 1, 3, 'texto', 60),
    ('Arrays y Listas', 'Estructuras de datos lineales', 'Los arrays son estructuras que almacenan múltiples valores del mismo tipo...', 2, 1, 'texto', 40),
    ('Pilas y Colas', 'Estructuras LIFO y FIFO', 'Las pilas siguen el principio LIFO (Last In, First Out)...', 2, 2, 'texto', 35)
ON CONFLICT (id) DO NOTHING;

-- Verificar los cambios
SELECT 
    'Módulos creados:' as info,
    COUNT(*) as total
FROM modulo;

SELECT 
    'Lecciones creadas:' as info,
    COUNT(*) as total
FROM leccion;

-- Mostrar estructura de las tablas
SELECT 
    'Estructura de tabla modulo:' as info;
\d modulo;

SELECT 
    'Estructura de tabla leccion:' as info;
\d leccion; 