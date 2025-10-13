#!/bin/bash

# Script para limpiar ambiente dinámico cuando se cierra el PR
# Uso: ./cleanup-dynamic-environment.sh <PR_NUMBER>

set -e

PR_NUMBER=$1
if [ -z "$PR_NUMBER" ]; then
    echo "❌ Error: Número de PR requerido"
    echo "Uso: ./cleanup-dynamic-environment.sh <PR_NUMBER>"
    exit 1
fi

echo "🧹 Limpiando ambiente dinámico para PR-$PR_NUMBER..."

# Cargar información del ambiente si existe
ENV_INFO_FILE="environment-info-pr-$PR_NUMBER.json"

if [ -f "$ENV_INFO_FILE" ]; then
    echo "📋 Cargando información del ambiente..."
    
    BACKEND_STACK_NAME=$(jq -r '.backend_stack_name' "$ENV_INFO_FILE")
    FRONTEND_BUCKET=$(jq -r '.frontend_bucket' "$ENV_INFO_FILE")
    CLOUDFRONT_DISTRIBUTION_ID=$(jq -r '.cloudfront_distribution_id' "$ENV_INFO_FILE")
    
    echo "   Backend Stack: $BACKEND_STACK_NAME"
    echo "   Frontend Bucket: $FRONTEND_BUCKET"
    echo "   CloudFront Distribution: $CLOUDFRONT_DISTRIBUTION_ID"
else
    echo "⚠️  Archivo de información del ambiente no encontrado, usando nombres por defecto..."
    ENV_SUFFIX="pr-$PR_NUMBER"
    BACKEND_STACK_NAME="elearning-backend-$ENV_SUFFIX-dev"
    FRONTEND_BUCKET="elearning-frontend-$ENV_SUFFIX"
fi

# Función para verificar si un recurso existe
resource_exists() {
    local resource_type=$1
    local resource_name=$2
    
    case $resource_type in
        "stack")
            aws cloudformation describe-stacks --stack-name "$resource_name" >/dev/null 2>&1
            ;;
        "bucket")
            aws s3api head-bucket --bucket "$resource_name" >/dev/null 2>&1
            ;;
        "distribution")
            aws cloudfront get-distribution --id "$resource_name" >/dev/null 2>&1
            ;;
    esac
}

# 1. Eliminar distribución CloudFront
if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ] && resource_exists "distribution" "$CLOUDFRONT_DISTRIBUTION_ID"; then
    echo "🌐 Eliminando distribución CloudFront..."
    
    # Deshabilitar distribución primero
    aws cloudfront get-distribution-config --id "$CLOUDFRONT_DISTRIBUTION_ID" > dist-config.json
    ETAG=$(jq -r '.ETag' dist-config.json)
    
    # Modificar configuración para deshabilitar
    jq '.DistributionConfig.Enabled = false' dist-config.json > dist-config-disabled.json
    
    aws cloudfront update-distribution \
        --id "$CLOUDFRONT_DISTRIBUTION_ID" \
        --distribution-config file://dist-config-disabled.json \
        --if-match "$ETAG"
    
    echo "   ⏳ Esperando a que la distribución se deshabilite..."
    aws cloudfront wait distribution-deployed --id "$CLOUDFRONT_DISTRIBUTION_ID"
    
    # Eliminar distribución
    aws cloudfront delete-distribution --id "$CLOUDFRONT_DISTRIBUTION_ID" --if-match "$ETAG"
    echo "   ✅ Distribución CloudFront eliminada"
    
    rm -f dist-config.json dist-config-disabled.json
else
    echo "   ⚠️  Distribución CloudFront no encontrada o ya eliminada"
fi

# 2. Eliminar bucket S3
if [ ! -z "$FRONTEND_BUCKET" ] && resource_exists "bucket" "$FRONTEND_BUCKET"; then
    echo "📦 Eliminando bucket S3..."
    
    # Vaciar bucket primero
    aws s3 rm "s3://$FRONTEND_BUCKET" --recursive
    
    # Eliminar bucket
    aws s3 rb "s3://$FRONTEND_BUCKET"
    echo "   ✅ Bucket S3 eliminado"
else
    echo "   ⚠️  Bucket S3 no encontrado o ya eliminado"
fi

# 3. Eliminar stack de CloudFormation (Backend)
if [ ! -z "$BACKEND_STACK_NAME" ] && resource_exists "stack" "$BACKEND_STACK_NAME"; then
    echo "☁️  Eliminando stack de CloudFormation..."
    
    aws cloudformation delete-stack --stack-name "$BACKEND_STACK_NAME"
    
    echo "   ⏳ Esperando a que el stack se elimine..."
    aws cloudformation wait stack-delete-complete --stack-name "$BACKEND_STACK_NAME"
    
    echo "   ✅ Stack de CloudFormation eliminado"
else
    echo "   ⚠️  Stack de CloudFormation no encontrado o ya eliminado"
fi

# 4. Limpiar archivos temporales
echo "🧽 Limpiando archivos temporales..."
rm -f "$ENV_INFO_FILE"

# 5. Limpiar logs de CloudWatch (opcional)
echo "📝 Limpiando logs de CloudWatch..."
LOG_GROUP_NAME="/aws/lambda/elearning-backend-pr-$PR_NUMBER-dev-app"

if aws logs describe-log-groups --log-group-name-prefix "$LOG_GROUP_NAME" --query 'logGroups[0].logGroupName' --output text | grep -q "$LOG_GROUP_NAME"; then
    aws logs delete-log-group --log-group-name "$LOG_GROUP_NAME"
    echo "   ✅ Log group eliminado"
else
    echo "   ⚠️  Log group no encontrado"
fi

echo "🎉 Limpieza del ambiente dinámico completada!"
echo "📊 Recursos eliminados:"
echo "   ✅ CloudFront Distribution"
echo "   ✅ S3 Bucket"
echo "   ✅ CloudFormation Stack"
echo "   ✅ CloudWatch Logs"
echo "   ✅ Archivos temporales"

echo ""
echo "💰 Costos ahorrados:"
echo "   - Sin cargos de CloudFront"
echo "   - Sin cargos de S3"
echo "   - Sin cargos de Lambda"
echo "   - Sin cargos de API Gateway"
