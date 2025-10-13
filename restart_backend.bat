@echo off
echo ========================================
echo    REINICIANDO BACKEND
echo ========================================
echo.

echo 🧹 Deteniendo procesos de Python...
taskkill /F /IM python.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 🚀 Iniciando Backend con PostgreSQL...
start "Backend PostgreSQL" cmd /k "cd backend\backend-app && set FLASK_ENV=production && set DATABASE_URL=postgresql://elearning_user:password_seguro@localhost:5432/elearning_narino && call venv\Scripts\activate.bat && python src\main.py"

echo.
echo ⏳ Esperando que el backend esté listo...
timeout /t 8 /nobreak >nul

echo.
echo ✅ Backend reiniciado correctamente!
echo.
echo 🧪 Para probar:
echo    python test_admin_with_session.py
echo.
pause 