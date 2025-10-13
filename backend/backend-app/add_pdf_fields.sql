-- Script para agregar campos de archivos PDF a la tabla user
-- Ejecutar en MySQL para actualizar la estructura de la tabla

USE elearning_narino;

-- Agregar campos para archivos PDF
ALTER TABLE `user` 
ADD COLUMN `documento_pdf` LONGBLOB NULL AFTER `numero_documento`,
ADD COLUMN `documento_pdf_nombre` VARCHAR(255) NULL AFTER `documento_pdf`,
ADD COLUMN `requisitos_pdf` LONGBLOB NULL AFTER `documento_pdf_nombre`,
ADD COLUMN `requisitos_pdf_nombre` VARCHAR(255) NULL AFTER `requisitos_pdf`;

-- Crear índices para optimizar búsquedas
CREATE INDEX `idx_documento_pdf_nombre` ON `user` (`documento_pdf_nombre`);
CREATE INDEX `idx_requisitos_pdf_nombre` ON `user` (`requisitos_pdf_nombre`);

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