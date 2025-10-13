@echo off
echo ========================================
echo    PRUEBA DE CONEXION POSTGRESQL
echo ========================================
echo.

cd backend\backend-app

echo 🔧 Configurando variables de entorno...
set FLASK_ENV=production
set DATABASE_URL=postgresql://elearning_user:password_seguro@localhost:5432/elearning_narino

echo.
echo 🐍 Activando entorno virtual...
call venv\Scripts\activate.bat

echo.
echo 🧪 Probando conexión...
python test_postgresql.py

echo.
pause 