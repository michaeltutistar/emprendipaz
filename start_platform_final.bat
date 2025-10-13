@echo off
echo ========================================
echo    PLATAFORMA E-LEARNING COMPLETA
echo    CON POSTGRESQL
echo ========================================
echo.

echo 🐳 Verificando PostgreSQL...
docker-compose ps

echo.
echo 🚀 Iniciando Backend con PostgreSQL...
start "Backend PostgreSQL" cmd /k "cd backend\backend-app && set \"FLASK_ENV=production\" && set \"DATABASE_URL=postgresql://elearning_user:password_seguro@localhost:5432/elearning_narino\" && call venv\Scripts\activate.bat && python src\main.py"

echo.
echo ⏳ Esperando que el backend esté listo...
timeout /t 8 /nobreak >nul

echo.
echo 🌐 Iniciando Frontend...
start "Frontend" cmd /k "cd frontend\frontend-app && pnpm dev"

echo.
echo ✅ Plataforma iniciada correctamente!
echo.
echo 📊 Acceso a servicios:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo    pgAdmin:  http://localhost:5050
echo.
echo 🗄️ Base de datos PostgreSQL:
echo    Host: localhost:5432
echo    Database: elearning_narino
echo    User: elearning_user
echo.
echo 🧪 Para probar:
echo    1. Ve a http://localhost:5173
echo    2. Crea una cuenta nueva
echo    3. Verifica en pgAdmin que se guarde
echo.
pause 