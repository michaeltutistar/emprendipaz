-- Script SQL para crear la tabla de notificaciones
-- Ejecutar en pgAdmin en la base de datos elearning_narino

CREATE TABLE IF NOT EXISTS notificacion (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "user"(id),
    mensaje TEXT NOT NULL,
    fase_nueva VARCHAR(20) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    leida BOOLEAN DEFAULT FALSE NOT NULL
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_notificacion_user_id ON notificacion(user_id);
CREATE INDEX IF NOT EXISTS idx_notificacion_fecha ON notificacion(fecha);
CREATE INDEX IF NOT EXISTS idx_notificacion_leida ON notificacion(leida);

-- Comentarios para documentación
COMMENT ON TABLE notificacion IS 'Tabla para almacenar notificaciones de cambio de fase de usuarios';
COMMENT ON COLUMN notificacion.id IS 'Identificador único de la notificación';
COMMENT ON COLUMN notificacion.user_id IS 'ID del usuario que recibe la notificación';
COMMENT ON COLUMN notificacion.mensaje IS 'Mensaje de la notificación';
COMMENT ON COLUMN notificacion.fase_nueva IS 'Nueva fase del usuario (inscripcion, formacion, entrega_activos)';
COMMENT ON COLUMN notificacion.fecha IS 'Fecha y hora de creación de la notificación';
COMMENT ON COLUMN notificacion.leida IS 'Indica si la notificación ha sido leída por el usuario';

-- Verificar que la tabla se creó correctamente
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notificacion' 
ORDER BY ordinal_position;
