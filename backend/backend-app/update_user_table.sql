-- Script para agregar los campos de documento a la tabla user existente
-- Ejecutar en MySQL para actualizar la estructura de la tabla

USE elearning_narino;

-- Agregar las nuevas columnas
ALTER TABLE `user` 
ADD COLUMN `tipo_documento` VARCHAR(50) NOT NULL DEFAULT 'cedula_ciudadania' AFTER `email`,
ADD COLUMN `numero_documento` VARCHAR(20) NOT NULL DEFAULT '' AFTER `tipo_documento`;

-- Crear índice para búsquedas por número de documento
CREATE INDEX `idx_numero_documento` ON `user` (`numero_documento`);

-- Verificar que los campos se agregaron correctamente
DESCRIBE `user`;

-- Mostrar la estructura actualizada
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'elearning_narino' 
AND TABLE_NAME = 'user' 
ORDER BY ORDINAL_POSITION; 