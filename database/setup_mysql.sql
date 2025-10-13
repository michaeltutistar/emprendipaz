-- Script de configuración de MySQL para la Plataforma E-Learning
-- Gobernación de Nariño

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS elearning_narino
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE elearning_narino;

-- Crear usuario para la aplicación
CREATE USER IF NOT EXISTS 'elearning_user'@'localhost' IDENTIFIED BY 'password_seguro';

-- Otorgar permisos al usuario
GRANT ALL PRIVILEGES ON elearning_narino.* TO 'elearning_user'@'localhost';

-- Otorgar permisos adicionales para operaciones de base de datos
GRANT CREATE, DROP, ALTER, INDEX, REFERENCES ON elearning_narino.* TO 'elearning_user'@'localhost';

-- Aplicar los cambios
FLUSH PRIVILEGES;

-- Verificar que el usuario se creó correctamente
SELECT User, Host FROM mysql.user WHERE User = 'elearning_user';

-- Mostrar las bases de datos disponibles
SHOW DATABASES; 