#!/usr/bin/env python3
"""
Script para verificar las variables de entorno
"""

import os

print("🔍 Verificando variables de entorno...")
print("=" * 50)

# Verificar FLASK_ENV
flask_env = os.getenv('FLASK_ENV', 'NO_DEFINIDO')
print(f"FLASK_ENV: '{flask_env}' (longitud: {len(flask_env)})")

# Verificar DATABASE_URL
database_url = os.getenv('DATABASE_URL', 'NO_DEFINIDO')
print(f"DATABASE_URL: '{database_url}' (longitud: {len(database_url)})")

# Verificar SECRET_KEY
secret_key = os.getenv('SECRET_KEY', 'NO_DEFINIDO')
print(f"SECRET_KEY: '{secret_key[:20]}...' (longitud: {len(secret_key)})")

print("=" * 50)

# Verificar si FLASK_ENV es 'production' (con strip)
if os.getenv('FLASK_ENV', '').strip() == 'production':
    print("✅ FLASK_ENV es 'production'")
else:
    print("❌ FLASK_ENV NO es 'production'")
    print(f"   Valor actual: '{flask_env}'")

# Verificar si DATABASE_URL contiene postgresql
if 'postgresql' in database_url.lower():
    print("✅ DATABASE_URL contiene 'postgresql'")
else:
    print("❌ DATABASE_URL NO contiene 'postgresql'")

print("=" * 50) 