@echo off
REM Script para iniciar el backend en producción
echo Iniciando Plataforma E-Learning en modo produccion...

REM Activar entorno virtual
call venv\Scripts\activate.bat

REM Configurar variables de entorno
set FLASK_ENV=production
set DATABASE_URL=mysql+mysqlconnector://root@localhost/elearning_narino

REM Iniciar servidor
python src/main.py

pause 