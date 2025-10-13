-- Script SQL para crear las tablas de activos
-- Crear tabla activos
CREATE TABLE IF NOT EXISTS activos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100) NOT NULL,
    valor_estimado DECIMAL(12,2),
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Crear tabla usuarios_activos
CREATE TABLE IF NOT EXISTS usuarios_activos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    activo_id INTEGER NOT NULL REFERENCES activos(id) ON DELETE CASCADE,
    fecha_entrega DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'entregado', 'rechazado')),
    observaciones TEXT,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_activos_activo ON activos(activo);
CREATE INDEX IF NOT EXISTS idx_activos_categoria ON activos(categoria);
CREATE INDEX IF NOT EXISTS idx_usuarios_activos_user_id ON usuarios_activos(user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_activos_activo_id ON usuarios_activos(activo_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_activos_estado ON usuarios_activos(estado);
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_activos_unique ON usuarios_activos(user_id, activo_id);

-- Insertar activos de ejemplo
INSERT INTO activos (nombre, descripcion, categoria, valor_estimado, activo) VALUES
('Kit de Herramientas Básicas', 'Conjunto de herramientas esenciales para emprendimiento', 'Herramientas', 500000.00, true),
('Equipo de Computo', 'Laptop o computador para gestión empresarial', 'Tecnología', 2000000.00, true),
('Capital Semilla', 'Recurso económico inicial para el emprendimiento', 'Capital', 3000000.00, true),
('Capacitación Especializada', 'Curso o taller especializado en el sector', 'Formación', 800000.00, true),
('Mentoría Empresarial', 'Acompañamiento especializado por 6 meses', 'Acompañamiento', 1200000.00, true)
ON CONFLICT DO NOTHING;
