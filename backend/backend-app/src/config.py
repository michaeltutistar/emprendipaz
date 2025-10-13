import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Configuración base"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'asdf#FGSgvasgf$5$WGT')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(Config):
    """Configuración para desarrollo"""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "postgresql+psycopg://elearning_user:password_seguro@localhost:5433/elearning_narino"

class ProductionConfig(Config):
    """Configuración para producción"""
    DEBUG = False
    # Usar DATABASE_URL si está definida; fallback a la URL conocida
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://elearning_user:Elearning2024!@elearning-db.cwn4cmackagl.us-east-1.rds.amazonaws.com:5432/elearning_narino",
    )

# Configuración por defecto
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig,
} 