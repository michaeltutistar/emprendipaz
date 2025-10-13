-- PostgreSQL: Agregar columna 'convocatoria' a la tabla curso
-- Ejecuta esto en pgAdmin sobre tu base de datos

ALTER TABLE public.curso
ADD COLUMN IF NOT EXISTS convocatoria VARCHAR(20);

-- Verificar
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'curso'; 