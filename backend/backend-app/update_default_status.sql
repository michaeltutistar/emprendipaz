-- Script para cambiar el valor por defecto del estado de cuenta
-- Ejecutar en MySQL para actualizar la configuración

USE elearning_narino;

-- Cambiar el valor por defecto del campo estado_cuenta a 'inactiva'
ALTER TABLE `user` 
MODIFY COLUMN `estado_cuenta` VARCHAR(20) NOT NULL DEFAULT 'inactiva';

-- Verificar el cambio
DESCRIBE `user`;

-- Mostrar usuarios actuales y su estado
SELECT 
    id,
    nombre,
    apellido,
    email,
    estado_cuenta,
    fecha_creacion
FROM `user` 
ORDER BY fecha_creacion DESC;

-- Opcional: Activar usuarios existentes si es necesario
-- UPDATE `user` SET estado_cuenta = 'activa' WHERE estado_cuenta = 'inactiva'; 