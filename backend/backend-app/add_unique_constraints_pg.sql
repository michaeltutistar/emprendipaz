-- PostgreSQL: agregar restricciones únicas en usuario
-- Ejecuta en pgAdmin sobre tu base de datos

-- Asegurar índice único en email
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' AND indexname = 'user_email_key') THEN
        ALTER TABLE public."user" ADD CONSTRAINT user_email_key UNIQUE (email);
    END IF;
END $$;

-- Asegurar índice único en numero_documento
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' AND indexname = 'user_numero_documento_key') THEN
        ALTER TABLE public."user" ADD CONSTRAINT user_numero_documento_key UNIQUE (numero_documento);
    END IF;
END $$;

-- Verificar
SELECT conname, pg_get_constraintdef(c.oid)
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE n.nspname = 'public' AND t.relname = 'user' AND c.contype = 'u'; 