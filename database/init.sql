-- Script de inicialización para PostgreSQL
-- Base de datos: elearning_narino

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    tipo_documento VARCHAR(50),
    numero_documento VARCHAR(20),
    documento_pdf BYTEA,
    documento_pdf_nombre VARCHAR(255),
    requisitos_pdf BYTEA,
    requisitos_pdf_nombre VARCHAR(255),
    rol VARCHAR(20) DEFAULT 'estudiante',
    estado_cuenta VARCHAR(20) DEFAULT 'inactiva',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    token_reset VARCHAR(100),
    token_reset_expira TIMESTAMP
);

-- Tabla de cursos
CREATE TABLE IF NOT EXISTS curso (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    instructor_id INTEGER REFERENCES "user"(id),
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de inscripciones
CREATE TABLE IF NOT EXISTS inscripcion (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER REFERENCES "user"(id),
    curso_id INTEGER REFERENCES curso(id),
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'activa',
    UNIQUE(estudiante_id, curso_id)
);

-- Tabla de log de actividades
CREATE TABLE IF NOT EXISTS log_actividad (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES "user"(id),
    accion VARCHAR(100) NOT NULL,
    detalles TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_user_estado ON "user"(estado_cuenta);
CREATE INDEX IF NOT EXISTS idx_inscripcion_estudiante ON inscripcion(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_inscripcion_curso ON inscripcion(curso_id);
CREATE INDEX IF NOT EXISTS idx_log_usuario ON log_actividad(usuario_id);
CREATE INDEX IF NOT EXISTS idx_log_fecha ON log_actividad(fecha);

-- Insertar usuario administrador por defecto (opcional)
-- Password: admin123 (hasheado correctamente)
INSERT INTO "user" (nombre, apellido, email, password_hash, rol, estado_cuenta) 
VALUES ('Administrador', 'Sistema', 'admin@elearning.com', 'pbkdf2:sha256:600000$admin123$8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'admin', 'activa')
ON CONFLICT (email) DO NOTHING; 