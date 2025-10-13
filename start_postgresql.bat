@echo off
echo ========================================
echo    INICIANDO POSTGRESQL CON DOCKER
echo ========================================
echo.

echo 🐳 Iniciando contenedores de PostgreSQL...
docker-compose up -d

echo.
echo ⏳ Esperando que PostgreSQL esté listo...
timeout /t 10 /nobreak >nul

echo.
echo 📊 Verificando estado de los contenedores...
docker-compose ps

echo.
echo 🌐 Acceso a pgAdmin:
echo    URL: http://localhost:5050
echo    Email: admin@elearning.com
echo    Password: admin123
echo.
echo 🗄️ Configuración de PostgreSQL:
echo    Host: localhost
echo    Puerto: 5432
echo    Base de datos: elearning_narino
echo    Usuario: elearning_user
echo    Password: password_seguro
echo.
echo ✅ PostgreSQL iniciado correctamente!
echo.
pause 