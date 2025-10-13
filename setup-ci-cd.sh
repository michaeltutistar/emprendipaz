#!/bin/bash

# Script para configurar CI/CD con AWS CodePipeline y CodeBuild
# Autor: Asistente AI
# Fecha: 2025-09-23

set -e

echo "🚀 Configurando CI/CD para EmprendiPaz..."

# Variables
ACCOUNT_ID="491074939576"
REGION="us-east-1"
GITHUB_REPO_OWNER="TU_USUARIO_GITHUB"  # Cambiar por tu usuario de GitHub
GITHUB_REPO_NAME="TU_REPOSITORIO"      # Cambiar por el nombre de tu repositorio
GITHUB_TOKEN="YOUR_GITHUB_TOKEN_HERE"  # Cambiar por tu token de GitHub

echo "📋 Variables configuradas:"
echo "   - Account ID: $ACCOUNT_ID"
echo "   - Region: $REGION"
echo "   - GitHub: $GITHUB_REPO_OWNER/$GITHUB_REPO_NAME"

# 1. Crear bucket para artefactos de CodePipeline
echo "🪣 Creando bucket para artefactos..."
aws s3 mb s3://codepipeline-artifacts-elearning --region $REGION || echo "Bucket ya existe"

# 2. Crear bucket para caché de CodeBuild
echo "🪣 Creando bucket para caché..."
aws s3 mb s3://codebuild-cache-elearning --region $REGION || echo "Bucket ya existe"

# 3. Almacenar token de GitHub en Secrets Manager
echo "🔐 Almacenando token de GitHub en Secrets Manager..."
aws secretsmanager create-secret \
    --name "github-token" \
    --description "GitHub token for CodePipeline" \
    --secret-string "{\"token\":\"$GITHUB_TOKEN\"}" \
    --region $REGION || \
aws secretsmanager update-secret \
    --secret-id "github-token" \
    --secret-string "{\"token\":\"$GITHUB_TOKEN\"}" \
    --region $REGION

# 4. Crear rol de servicio para CodeBuild
echo "👤 Creando rol de servicio para CodeBuild..."
cat > codebuild-trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws iam create-role \
    --role-name codebuild-elearning-service-role \
    --assume-role-policy-document file://codebuild-trust-policy.json || echo "Rol ya existe"

# 5. Crear política para CodeBuild
cat > codebuild-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:$REGION:$ACCOUNT_ID:*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:GetObjectVersion",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::codepipeline-artifacts-elearning",
                "arn:aws:s3:::codepipeline-artifacts-elearning/*",
                "arn:aws:s3:::codebuild-cache-elearning",
                "arn:aws:s3:::codebuild-cache-elearning/*",
                "arn:aws:s3:::elearning-frontend-prod-v2",
                "arn:aws:s3:::elearning-frontend-prod-v2/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "cloudfront:CreateInvalidation"
            ],
            "Resource": "arn:aws:cloudfront::$ACCOUNT_ID:distribution/E3QN9WFZXCI4DS"
        }
    ]
}
EOF

aws iam put-role-policy \
    --role-name codebuild-elearning-service-role \
    --policy-name CodeBuildServiceRolePolicy \
    --policy-document file://codebuild-policy.json

# 6. Crear rol de servicio para CodePipeline
echo "👤 Creando rol de servicio para CodePipeline..."
cat > codepipeline-trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "codepipeline.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws iam create-role \
    --role-name codepipeline-elearning-service-role \
    --assume-role-policy-document file://codepipeline-trust-policy.json || echo "Rol ya existe"

# 7. Crear política para CodePipeline
cat > codepipeline-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetBucketVersioning",
                "s3:GetObject",
                "s3:GetObjectVersion",
                "s3:PutObject"
            ],
            "Resource": [
                "arn:aws:s3:::codepipeline-artifacts-elearning",
                "arn:aws:s3:::codepipeline-artifacts-elearning/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "codebuild:BatchGetBuilds",
                "codebuild:StartBuild"
            ],
            "Resource": "arn:aws:codebuild:$REGION:$ACCOUNT_ID:project/elearning-frontend-build"
        },
        {
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue"
            ],
            "Resource": "arn:aws:secretsmanager:$REGION:$ACCOUNT_ID:secret:github-token*"
        }
    ]
}
EOF

aws iam put-role-policy \
    --role-name codepipeline-elearning-service-role \
    --policy-name CodePipelineServiceRolePolicy \
    --policy-document file://codepipeline-policy.json

# 8. Actualizar configuraciones con Account ID
sed -i "s/ACCOUNT_ID/$ACCOUNT_ID/g" codebuild-config.json
sed -i "s/ACCOUNT_ID/$ACCOUNT_ID/g" codepipeline-config.json
sed -i "s/TU_USUARIO_GITHUB/$GITHUB_REPO_OWNER/g" codepipeline-config.json
sed -i "s/TU_REPOSITORIO/$GITHUB_REPO_NAME/g" codepipeline-config.json

# 9. Crear proyecto de CodeBuild
echo "🔨 Creando proyecto de CodeBuild..."
aws codebuild create-project --cli-input-json file://codebuild-config.json

# 10. Crear pipeline de CodePipeline
echo "🔄 Creando pipeline de CodePipeline..."
aws codepipeline create-pipeline --cli-input-json file://codepipeline-config.json

# 11. Limpiar archivos temporales
rm -f *-trust-policy.json *-policy.json

echo "✅ CI/CD configurado exitosamente!"
echo ""
echo "📋 Resumen:"
echo "   - CodeBuild Project: elearning-frontend-build"
echo "   - CodePipeline: elearning-frontend-pipeline"
echo "   - S3 Artifacts: codepipeline-artifacts-elearning"
echo "   - S3 Cache: codebuild-cache-elearning"
echo ""
echo "🚀 Próximos pasos:"
echo "   1. Subir el código a GitHub"
echo "   2. El pipeline se ejecutará automáticamente con cada push a main"
echo "   3. Monitorear en AWS Console > CodePipeline"
