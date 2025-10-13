@echo off
echo ========================================
echo    PLATAFORMA E-LEARNING COMPLETA
echo    CON DASHBOARD ADMINISTRATIVO
echo    POSTGRESQL + BACKEND + FRONTEND
echo ========================================
echo.

echo 🧹 Limpiando procesos anteriores...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 🐳 Verificando PostgreSQL...
docker-compose ps

echo.
echo 🚀 Iniciando Backend con PostgreSQL...
start "Backend PostgreSQL" cmd /k "cd backend\backend-app && set FLASK_ENV=production && set DATABASE_URL=postgresql://elearning_user:password_seguro@localhost:5432/elearning_narino && call venv\Scripts\activate.bat && python src\main.py"

echo.
echo ⏳ Esperando que el backend esté listo...
timeout /t 8 /nobreak >nul

echo.
echo 🌐 Iniciando Frontend...
start "Frontend" cmd /k "cd frontend\frontend-app && pnpm dev"

echo.
echo ⏳ Esperando que el frontend esté listo...
timeout /t 10 /nobreak >nul

echo.
echo ✅ Plataforma iniciada correctamente!
echo.
echo 📊 Acceso a servicios:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo    pgAdmin:  http://localhost:5050
echo.
echo 🎛️ Dashboard Administrativo:
echo    URL: http://localhost:5173/admin
echo    Email: admin@elearning.com
echo    Password: admin123
echo.
echo 🗄️ Base de datos PostgreSQL:
echo    Host: localhost:5432
echo    Database: elearning_narino
echo    User: elearning_user
echo.
echo 🧪 Para probar:
echo    1. Ve a http://localhost:5173/admin
echo    2. Inicia sesión con las credenciales de administrador
echo    3. Explora las funcionalidades del dashboard
echo.
echo 📋 Funcionalidades del Dashboard:
echo    • 📊 Métricas generales de la plataforma
echo    • 👥 Gestión completa de usuarios
echo    • 📥 Registro masivo de usuarios (CSV)
echo    • 📋 Logs de actividad del sistema
echo    • 🔄 Actualización masiva de usuarios
echo    • 📤 Exportación de datos
echo.
echo 💡 Si hay problemas:
echo    - Verifica que no haya otros procesos en puertos 5000 y 5173
echo    - Ejecuta este script nuevamente para limpiar
echo    - Revisa los logs en las ventanas de terminal
echo.
pause 