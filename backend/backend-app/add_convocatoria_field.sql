-- Agregar columna 'convocatoria' a la tabla `user`
-- Ejecutar en MySQL para actualizar la estructura de la tabla

USE elearning_narino;

ALTER TABLE `user`
ADD COLUMN `convocatoria` VARCHAR(20) NULL AFTER `token_reset_expira`;

-- Verificar estructura
DESCRIBE `user`; 