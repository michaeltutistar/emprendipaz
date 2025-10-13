@echo off
echo ========================================
echo    ACTUALIZANDO TABLA USER
echo ========================================
echo.

echo 🗄️ Agregando columnas token_reset a la tabla user...
docker exec elearning_postgres psql -U elearning_user -d elearning_narino -c "ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS token_reset VARCHAR(100) NULL;"
docker exec elearning_postgres psql -U elearning_user -d elearning_narino -c "ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS token_reset_expira TIMESTAMP NULL;"

echo.
echo ✅ Columnas agregadas correctamente!

echo.
echo 📋 Verificando estructura de la tabla...
docker exec elearning_postgres psql -U elearning_user -d elearning_narino -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user' ORDER BY ordinal_position;"

echo.
pause 