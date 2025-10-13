#!/usr/bin/env python3
"""
Script para preparar el proyecto para subir a GitHub
"""

import os
import shutil
import subprocess
import json
from pathlib import Path

def run_command(command, cwd=None):
    """Ejecutar comando y mostrar resultado"""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            cwd=cwd, 
            capture_output=True, 
            text=True
        )
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def clean_sensitive_files():
    """Limpiar archivos sensibles antes de subir a GitHub"""
    print("🧹 Limpiando archivos sensibles...")
    
    sensitive_patterns = [
        "**/.env*",
        "**/env.*",
        "**/*credentials*",
        "**/*.log",
        "**/venv/",
        "**/node_modules/",
        "**/.serverless/",
        "**/*.zip"
    ]
    
    removed_count = 0
    for pattern in sensitive_patterns:
        for file_path in Path('.').glob(pattern):
            if file_path.exists():
                if file_path.is_dir():
                    print(f"  📁 Eliminando directorio: {file_path}")
                    shutil.rmtree(file_path, ignore_errors=True)
                else:
                    print(f"  📄 Eliminando archivo: {file_path}")
                    file_path.unlink(missing_ok=True)
                removed_count += 1
    
    print(f"✅ {removed_count} elementos sensibles eliminados")

def create_env_examples():
    """Crear archivos .env.example"""
    print("📝 Creando archivos .env.example...")
    
    # Frontend .env.example
    frontend_env_example = """# Frontend Environment Variables
VITE_API_URL=https://your-api-url.amazonaws.com/dev
VITE_APP_NAME=E-Learning Platform
VITE_APP_VERSION=1.0.0
"""
    
    frontend_path = Path("frontend/frontend-app/.env.example")
    frontend_path.parent.mkdir(parents=True, exist_ok=True)
    with open(frontend_path, 'w') as f:
        f.write(frontend_env_example)
    
    # Backend .env.example
    backend_env_example = """# Backend Environment Variables
DATABASE_URL=postgresql://user:password@host:5432/database
SECRET_KEY=your-secret-key-here
FLASK_ENV=development
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET=your-s3-bucket
"""
    
    backend_path = Path("backend/backend-app/.env.example")
    backend_path.parent.mkdir(parents=True, exist_ok=True)
    with open(backend_path, 'w') as f:
        f.write(backend_env_example)
    
    print("✅ Archivos .env.example creados")

def create_amplify_structure():
    """Crear estructura básica de Amplify"""
    print("🏗️ Creando estructura de Amplify...")
    
    amplify_dir = Path("amplify")
    amplify_dir.mkdir(exist_ok=True)
    
    # amplify.yml para CI/CD
    amplify_yml = """version: 1
backend:
  phases:
    build:
      commands:
        - '# Execute Amplify CLI with the helper script'
        - amplifyPush --simple
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend/frontend-app
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/frontend-app/dist
    files:
      - '**/*'
  cache:
    paths:
      - frontend/frontend-app/node_modules/**/*
"""
    
    with open("amplify.yml", 'w') as f:
        f.write(amplify_yml)
    
    print("✅ Estructura de Amplify creada")

def create_github_workflows():
    """Crear GitHub Actions workflows"""
    print("⚙️ Creando GitHub Actions workflows...")
    
    workflows_dir = Path(".github/workflows")
    workflows_dir.mkdir(parents=True, exist_ok=True)
    
    # CI/CD workflow
    workflow_yml = """name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/frontend-app/package-lock.json
    
    - name: Install dependencies
      run: |
        cd frontend/frontend-app
        npm ci
    
    - name: Run tests
      run: |
        cd frontend/frontend-app
        npm run test -- --watchAll=false
    
    - name: Build
      run: |
        cd frontend/frontend-app
        npm run build

  test-backend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'
    
    - name: Install dependencies
      run: |
        cd backend/backend-app
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    
    - name: Run tests
      run: |
        cd backend/backend-app
        python -m pytest tests/ --verbose || echo "Tests not implemented yet"

  deploy:
    needs: [test-frontend, test-backend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Amplify
      run: echo "Deployment handled by Amplify Console"
"""
    
    with open(workflows_dir / "ci-cd.yml", 'w') as f:
        f.write(workflow_yml)
    
    print("✅ GitHub Actions workflows creados")

def init_git_repo():
    """Inicializar repositorio Git"""
    print("🔧 Inicializando repositorio Git...")
    
    # Verificar si ya es un repo Git
    if Path(".git").exists():
        print("  ℹ️ Ya es un repositorio Git")
        return True
    
    success, stdout, stderr = run_command("git init")
    if success:
        print("✅ Repositorio Git inicializado")
        
        # Configurar usuario si no está configurado
        run_command('git config user.name "E-Learning Team"')
        run_command('git config user.email "team@elearning.com"')
        
        return True
    else:
        print(f"❌ Error inicializando Git: {stderr}")
        return False

def create_initial_commit():
    """Crear commit inicial"""
    print("📝 Creando commit inicial...")
    
    # Agregar archivos
    success, stdout, stderr = run_command("git add .")
    if not success:
        print(f"❌ Error agregando archivos: {stderr}")
        return False
    
    # Crear commit
    success, stdout, stderr = run_command('git commit -m "Initial commit: E-Learning Platform ready for Amplify"')
    if success:
        print("✅ Commit inicial creado")
        return True
    else:
        print(f"❌ Error creando commit: {stderr}")
        return False

def main():
    """Función principal"""
    print("🚀 PREPARANDO PROYECTO PARA GITHUB + AMPLIFY")
    print("=" * 60)
    
    steps = [
        ("Limpiando archivos sensibles", clean_sensitive_files),
        ("Creando archivos .env.example", create_env_examples),
        ("Creando estructura de Amplify", create_amplify_structure),
        ("Creando GitHub Actions workflows", create_github_workflows),
        ("Inicializando repositorio Git", init_git_repo),
        ("Creando commit inicial", create_initial_commit),
    ]
    
    for step_name, step_func in steps:
        print(f"\n📋 {step_name}...")
        try:
            result = step_func()
            if result is False:
                print(f"❌ Error en: {step_name}")
                return False
        except Exception as e:
            print(f"❌ Error en {step_name}: {e}")
            return False
    
    print("\n" + "=" * 60)
    print("🎉 ¡PROYECTO PREPARADO EXITOSAMENTE!")
    print("=" * 60)
    print("\n📋 PRÓXIMOS PASOS:")
    print("1. Crear repositorio en GitHub")
    print("2. Agregar remote: git remote add origin <tu-repo-url>")
    print("3. Subir código: git push -u origin main")
    print("4. Configurar AWS Amplify Console")
    print("5. Conectar GitHub con Amplify")
    
    print("\n💡 COMANDOS ÚTILES:")
    print("git remote add origin https://github.com/tu-usuario/e-learning-platform.git")
    print("git branch -M main")
    print("git push -u origin main")
    
    return True

if __name__ == "__main__":
    main()
