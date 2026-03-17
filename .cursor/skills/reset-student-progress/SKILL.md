---
name: reset-student-progress
description: Resetea el progreso de un estudiante a cero (usuarios de prueba). Usar cuando el usuario pida quitar progreso, resetear estudiante, empezar de cero, o preparar usuario de prueba. Incluye endpoint admin, despliegue Lambda y comando para invocar.
---

# Resetear progreso de estudiante

## Cuándo usar

- Usuario pide "quitar progreso", "resetear estudiante", "empezar de nuevo", "usuario de prueba con progreso en cero"
- Ejemplo: "arevalomadelyn9@gmail.com del municipio de Aldana lo tomamos como usuario de prueba y tendríamos que tener su progreso en cero"

## Endpoint

`POST /api/admin/users/reset-progress`

- **Auth**: Admin (Bearer token)
- **Body**: `{"email": "correo@ejemplo.com"}`
- **Elimina**: LogActividad (Completó/leccion_completada), IntentosEvaluacion, PuntosPlanNegocio, RespuestasPlanNegocio, AsistenciaJornada

## Invocar vía PowerShell

```powershell
$email = "correo@ejemplo.com"
$body = "{`"email`":`"$email`"}"
$loginBody = '{"email":"admin@elearning.com","password":"Admin2024!"}'

$loginResp = Invoke-RestMethod -Uri "https://by89bq27g7.execute-api.us-east-1.amazonaws.com/dev/api/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResp.token

$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }
Invoke-RestMethod -Uri "https://by89bq27g7.execute-api.us-east-1.amazonaws.com/dev/api/admin/users/reset-progress" -Method POST -Body $body -Headers $headers
```

## Si el endpoint no existe o hay cambios en backend

1. **Código**: Endpoint en `backend/backend-app/src/routes/admin.py` — ruta `@admin_bp.route('/users/reset-progress', methods=['POST'])`
2. **Copiar a Lambda**: `Copy-Item backend\backend-app\src\routes\admin.py _lambda_patch\out\src\routes\admin.py -Force`
3. **Empaquetar**: `cd _lambda_patch; python make_zip.py`
4. **Desplegar**: Subir zip a S3 y actualizar Lambda (zip > 70MB requiere S3):

```powershell
$key = "deployments/lambda_reset_$(Get-Date -Format 'yyyyMMddHHmm').zip"
aws s3 cp lambda_fixed.zip "s3://elearning-archivos/$key" --region us-east-1
aws lambda update-function-code --function-name elearning-api-dev-api --s3-bucket elearning-archivos --s3-key $key --region us-east-1
aws lambda wait function-updated --function-name elearning-api-dev-api --region us-east-1
```

## Respuesta esperada

```json
{
  "success": true,
  "message": "Progreso de correo@ejemplo.com reseteado a cero",
  "deleted": {
    "log_actividad": 239,
    "intentos_evaluacion": 116,
    "puntos_plan_negocio": 34,
    "respuestas_plan_negocio": 8,
    "asistencia_jornada": 0
  }
}
```
