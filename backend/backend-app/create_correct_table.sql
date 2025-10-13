-- Script para crear la tabla user con la estructura correcta
-- Eliminar tabla existente si existe
DROP TABLE IF EXISTS `user`;

-- Crear tabla user con la estructura correcta según el modelo SQLAlchemy
CREATE TABLE `user` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre` VARCHAR(100) NOT NULL,
    `apellido` VARCHAR(100) NOT NULL,
    `email` VARCHAR(120) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `estado_cuenta` VARCHAR(20) DEFAULT 'activa',
    `token_reset` VARCHAR(100) NULL,
    `token_reset_expira` DATETIME NULL,
    
    INDEX `idx_email` (`email`),
    INDEX `idx_estado_cuenta` (`estado_cuenta`),
    INDEX `idx_fecha_creacion` (`fecha_creacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar que la tabla se creó correctamente
DESCRIBE `user`; 