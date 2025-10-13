#!/bin/bash

# Script para desplegar ambiente dinámico para PR
# Uso: ./deploy-dynamic-environment.sh <PR_NUMBER>

set -e

PR_NUMBER=$1
if [ -z "$PR_NUMBER" ]; then
    echo "❌ Error: Número de PR requerido"
    echo "Uso: ./deploy-dynamic-environment.sh <PR_NUMBER>"
    exit 1
fi

echo "🚀 Desplegando ambiente dinámico para PR-$PR_NUMBER..."

# Variables del ambiente dinámico
ENV_SUFFIX="pr-$PR_NUMBER"
BACKEND_STACK_NAME="elearning-backend-$ENV_SUFFIX"
FRONTEND_BUCKET="elearning-frontend-$ENV_SUFFIX"
CLOUDFRONT_DISTRIBUTION_PREFIX="pr-$PR_NUMBER"

# Función para generar nombres únicos
generate_unique_name() {
    local prefix=$1
    local suffix=$(date +%s)
    echo "${prefix}-${suffix}"
}

# 1. Desplegar Backend (Lambda + API Gateway)
echo "📦 Desplegando backend..."
cd backend/backend-app

# Crear serverless.yml dinámico
cat > serverless-dynamic.yml << EOF
service: elearning-backend-$ENV_SUFFIX

provider:
  name: aws
  runtime: python3.9
  region: us-east-1
  stage: dev
  environment:
    PR_NUMBER: $PR_NUMBER
    ENV_SUFFIX: $ENV_SUFFIX
    DATABASE_URL: \${env:DATABASE_URL}
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - s3:*
          Resource: "*"
        - Effect: Allow
          Action:
            - rds:*
          Resource: "*"

functions:
  app:
    handler: lambda_function.lambda_handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
      - http:
          path: /
          method: ANY
          cors: true

plugins:
  - serverless-python-requirements

custom:
  pythonRequirements:
    dockerizePip: true
    slim: true
    strip: false
EOF

# Desplegar con serverless (usando versión 3.x que no requiere login)
npx serverless@3 deploy --config serverless-dynamic.yml --stage dev

# Obtener URL del API Gateway
BACKEND_URL=$(aws cloudformation describe-stacks \
    --stack-name "$BACKEND_STACK_NAME-dev" \
    --query 'Stacks[0].Outputs[?OutputKey==`ServiceEndpoint`].OutputValue' \
    --output text)

echo "✅ Backend desplegado: $BACKEND_URL"

# 2. Crear bucket S3 para frontend
echo "📦 Creando bucket S3 para frontend..."
FRONTEND_BUCKET_NAME=$(generate_unique_name "$FRONTEND_BUCKET")

aws s3 mb "s3://$FRONTEND_BUCKET_NAME" --region us-east-1

# Configurar bucket para hosting web
aws s3 website "s3://$FRONTEND_BUCKET_NAME" \
    --index-document index.html \
    --error-document index.html

# Configurar política del bucket
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$FRONTEND_BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy \
    --bucket "$FRONTEND_BUCKET_NAME" \
    --policy file://bucket-policy.json

# 3. Subir archivos del frontend
echo "📤 Subiendo archivos del frontend..."
cd ../../frontend/frontend-app

aws s3 sync dist/ "s3://$FRONTEND_BUCKET_NAME" --delete

# 4. Crear distribución CloudFront
echo "🌐 Creando distribución CloudFront..."

# Crear configuración de CloudFront
cat > cloudfront-config.json << EOF
{
    "CallerReference": "pr-$PR_NUMBER-$(date +%s)",
    "Comment": "Frontend distribution for PR $PR_NUMBER",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-$FRONTEND_BUCKET_NAME",
                "DomainName": "$FRONTEND_BUCKET_NAME.s3-website-us-east-1.amazonaws.com",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$FRONTEND_BUCKET_NAME",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 0,
        "MaxTTL": 0
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100"
}
EOF

# Crear distribución CloudFront
CLOUDFRONT_DISTRIBUTION_ID=$(aws cloudfront create-distribution \
    --distribution-config file://cloudfront-config.json \
    --query 'Distribution.Id' \
    --output text)

# Obtener dominio de CloudFront
CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
    --id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --query 'Distribution.DomainName' \
    --output text)

FRONTEND_URL="https://$CLOUDFRONT_DOMAIN"

echo "✅ CloudFront creado: $FRONTEND_URL"

# 5. Guardar información del ambiente
echo "💾 Guardando información del ambiente..."
cd ../..

cat > "environment-info-pr-$PR_NUMBER.json" << EOF
{
    "pr_number": "$PR_NUMBER",
    "environment_suffix": "$ENV_SUFFIX",
    "backend_url": "$BACKEND_URL",
    "frontend_url": "$FRONTEND_URL",
    "frontend_bucket": "$FRONTEND_BUCKET_NAME",
    "cloudfront_distribution_id": "$CLOUDFRONT_DISTRIBUTION_ID",
    "backend_stack_name": "$BACKEND_STACK_NAME-dev",
    "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

# 6. Configurar variables de salida para GitHub Actions
echo "backend_url=$BACKEND_URL" >> $GITHUB_OUTPUT
echo "frontend_url=$FRONTEND_URL" >> $GITHUB_OUTPUT
echo "environment_suffix=$ENV_SUFFIX" >> $GITHUB_OUTPUT

echo "🎉 Ambiente dinámico desplegado exitosamente!"
echo "📊 Resumen:"
echo "   PR Number: $PR_NUMBER"
echo "   Backend URL: $BACKEND_URL"
echo "   Frontend URL: $FRONTEND_URL"
echo "   Environment Suffix: $ENV_SUFFIX"

# Limpiar archivos temporales
rm -f bucket-policy.json cloudfront-config.json
cd backend/backend-app
rm -f serverless-dynamic.yml
