#!/usr/bin/env python3
"""
Script para desplegar las correcciones del error 502 Bad Gateway
"""

import os
import subprocess
import sys
from pathlib import Path

def run_command(command, cwd=None, shell=True):
    """Ejecutar comando y mostrar salida"""
    print(f"🔄 Ejecutando: {command}")
    if cwd:
        print(f"📁 En directorio: {cwd}")
    
    try:
        result = subprocess.run(
            command, 
            shell=shell, 
            cwd=cwd, 
            capture_output=True, 
            text=True,
            timeout=300  # 5 minutos timeout
        )
        
        if result.stdout:
            print(f"✅ Salida: {result.stdout}")
        
        if result.stderr:
            print(f"⚠️  Error: {result.stderr}")
            
        if result.returncode != 0:
            print(f"❌ Comando falló con código: {result.returncode}")
            return False
        
        return True
        
    except subprocess.TimeoutExpired:
        print(f"❌ Comando excedió el tiempo límite")
        return False
    except Exception as e:
        print(f"❌ Error ejecutando comando: {e}")
        return False

def main():
    """Función principal"""
    print("🚀 Iniciando despliegue de correcciones para error 502...")
    
    # Cambiar al directorio de Lambda
    lambda_dir = Path(__file__).parent / "backend" / "backend-app" / "lambda-deployment"
    
    if not lambda_dir.exists():
        print(f"❌ Directorio Lambda no encontrado: {lambda_dir}")
        return False
    
    print(f"📁 Trabajando en: {lambda_dir}")
    
    # Verificar que serverless esté instalado
    if not run_command("serverless --version"):
        print("❌ Serverless Framework no está instalado")
        print("💡 Instala con: npm install -g serverless")
        return False
    
    # Verificar configuración de AWS
    if not run_command("aws sts get-caller-identity"):
        print("❌ AWS CLI no está configurado correctamente")
        print("💡 Configura con: aws configure")
        return False
    
    # Instalar dependencias si es necesario
    package_json = lambda_dir / "package.json"
    if package_json.exists():
        print("📦 Instalando dependencias de Node.js...")
        if not run_command("npm install", cwd=lambda_dir):
            print("❌ Error instalando dependencias de Node.js")
            return False
    
    # Desplegar usando Serverless
    print("🚀 Desplegando función Lambda...")
    if not run_command("serverless deploy --verbose", cwd=lambda_dir):
        print("❌ Error en el despliegue")
        return False
    
    print("✅ Despliegue completado exitosamente!")
    print("\n📋 Próximos pasos:")
    print("1. Verifica los logs de CloudWatch para confirmar que no hay errores")
    print("2. Prueba el endpoint de login desde tu aplicación")
    print("3. Si persisten errores, revisa los logs con:")
    print("   serverless logs -f api --tail")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
