-- Script para agregar columnas de token de reset a la tabla user
-- Ejecutar en PostgreSQL

-- Agregar columnas para token de reset de contraseña
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS token_reset VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS token_reset_expira TIMESTAMP NULL;

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user' 
AND column_name IN ('token_reset', 'token_reset_expira')
ORDER BY column_name; 