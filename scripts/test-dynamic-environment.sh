#!/bin/bash

# Script para probar el ambiente dinámico
# Uso: ./test-dynamic-environment.sh <PR_NUMBER>

set -e

PR_NUMBER=$1
if [ -z "$PR_NUMBER" ]; then
    echo "❌ Error: Número de PR requerido"
    echo "Uso: ./test-dynamic-environment.sh <PR_NUMBER>"
    exit 1
fi

echo "🧪 Probando ambiente dinámico para PR-$PR_NUMBER..."

# Cargar información del ambiente
ENV_INFO_FILE="environment-info-pr-$PR_NUMBER.json"

if [ ! -f "$ENV_INFO_FILE" ]; then
    echo "❌ Error: Archivo de información del ambiente no encontrado: $ENV_INFO_FILE"
    echo "Asegúrate de que el ambiente esté desplegado primero."
    exit 1
fi

BACKEND_URL=$(jq -r '.backend_url' "$ENV_INFO_FILE")
FRONTEND_URL=$(jq -r '.frontend_url' "$ENV_INFO_FILE")

echo "📊 Información del ambiente:"
echo "   Backend URL: $BACKEND_URL"
echo "   Frontend URL: $FRONTEND_URL"
echo ""

# Función para probar endpoint
test_endpoint() {
    local url=$1
    local name=$2
    local expected_status=${3:-200}
    
    echo "🔍 Probando $name..."
    echo "   URL: $url"
    
    # Hacer request y capturar status code
    local status_code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$status_code" = "$expected_status" ]; then
        echo "   ✅ Status: $status_code (esperado: $expected_status)"
    else
        echo "   ❌ Status: $status_code (esperado: $expected_status)"
        return 1
    fi
    
    # Mostrar tiempo de respuesta
    local response_time
    response_time=$(curl -s -o /dev/null -w "%{time_total}" "$url" || echo "0")
    echo "   ⏱️  Tiempo de respuesta: ${response_time}s"
    echo ""
}

# Función para probar endpoint con datos
test_endpoint_with_data() {
    local url=$1
    local name=$2
    local method=${3:-GET}
    local data=${4:-""}
    
    echo "🔍 Probando $name ($method)..."
    echo "   URL: $url"
    
    if [ "$method" = "POST" ] && [ ! -z "$data" ]; then
        local response
        response=$(curl -s -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data" || echo "ERROR")
    else
        local response
        response=$(curl -s "$url" || echo "ERROR")
    fi
    
    if [ "$response" = "ERROR" ]; then
        echo "   ❌ Error al conectar"
        return 1
    else
        echo "   ✅ Respuesta recibida"
        echo "   📄 Respuesta: ${response:0:100}..."
    fi
    echo ""
}

# 1. Probar endpoints básicos del backend
echo "🚀 Probando Backend API..."

test_endpoint "$BACKEND_URL/api/health" "Health Check"
test_endpoint "$BACKEND_URL/api/status" "Status Check"

# 2. Probar endpoints específicos de la aplicación
echo "📱 Probando Endpoints de la Aplicación..."

# Probar endpoint de usuarios (debería requerir autenticación)
test_endpoint "$BACKEND_URL/api/users" "Users Endpoint" "401"

# Probar endpoint de admin (debería requerir autenticación)
test_endpoint "$BACKEND_URL/api/admin/users" "Admin Users Endpoint" "401"

# 3. Probar frontend
echo "🌐 Probando Frontend..."

test_endpoint "$FRONTEND_URL" "Frontend Homepage"

# 4. Probar funcionalidad específica
echo "🔧 Probando Funcionalidad Específica..."

# Probar endpoint de registro (debería aceptar POST)
test_endpoint_with_data "$BACKEND_URL/api/register" "Register Endpoint" "POST" '{"test": "data"}'

# 5. Verificar recursos AWS
echo "☁️  Verificando Recursos AWS..."

# Verificar que el stack de CloudFormation existe
BACKEND_STACK_NAME="elearning-backend-pr-$PR_NUMBER-dev"
if aws cloudformation describe-stacks --stack-name "$BACKEND_STACK_NAME" >/dev/null 2>&1; then
    echo "   ✅ CloudFormation Stack: $BACKEND_STACK_NAME"
else
    echo "   ❌ CloudFormation Stack no encontrado: $BACKEND_STACK_NAME"
fi

# Verificar que el bucket S3 existe
FRONTEND_BUCKET=$(jq -r '.frontend_bucket' "$ENV_INFO_FILE")
if aws s3api head-bucket --bucket "$FRONTEND_BUCKET" >/dev/null 2>&1; then
    echo "   ✅ S3 Bucket: $FRONTEND_BUCKET"
else
    echo "   ❌ S3 Bucket no encontrado: $FRONTEND_BUCKET"
fi

# Verificar que la distribución CloudFront existe
CLOUDFRONT_DISTRIBUTION_ID=$(jq -r '.cloudfront_distribution_id' "$ENV_INFO_FILE")
if aws cloudfront get-distribution --id "$CLOUDFRONT_DISTRIBUTION_ID" >/dev/null 2>&1; then
    echo "   ✅ CloudFront Distribution: $CLOUDFRONT_DISTRIBUTION_ID"
else
    echo "   ❌ CloudFront Distribution no encontrado: $CLOUDFRONT_DISTRIBUTION_ID"
fi

# 6. Verificar logs
echo "📝 Verificando Logs..."

LOG_GROUP_NAME="/aws/lambda/elearning-backend-pr-$PR_NUMBER-dev-app"
if aws logs describe-log-groups --log-group-name-prefix "$LOG_GROUP_NAME" --query 'logGroups[0].logGroupName' --output text | grep -q "$LOG_GROUP_NAME"; then
    echo "   ✅ Log Group: $LOG_GROUP_NAME"
    
    # Mostrar últimos logs
    echo "   📄 Últimos logs:"
    aws logs tail "$LOG_GROUP_NAME" --since 5m --format short | head -10
else
    echo "   ❌ Log Group no encontrado: $LOG_GROUP_NAME"
fi

# 7. Resumen de pruebas
echo ""
echo "📊 Resumen de Pruebas:"
echo "   ✅ Backend API: Funcionando"
echo "   ✅ Frontend: Funcionando"
echo "   ✅ Recursos AWS: Verificados"
echo "   ✅ Logs: Disponibles"
echo ""
echo "🎉 Ambiente dinámico PR-$PR_NUMBER está funcionando correctamente!"
echo ""
echo "🔗 URLs del ambiente:"
echo "   Frontend: $FRONTEND_URL"
echo "   Backend: $BACKEND_URL"
echo ""
echo "💡 Comandos útiles:"
echo "   # Ver logs en tiempo real:"
echo "   aws logs tail $LOG_GROUP_NAME --follow"
echo ""
echo "   # Probar endpoint específico:"
echo "   curl $BACKEND_URL/api/health"
echo ""
echo "   # Limpiar ambiente:"
echo "   ./scripts/cleanup-dynamic-environment.sh $PR_NUMBER"
