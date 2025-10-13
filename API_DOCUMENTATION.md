# Documentación de API - Plataforma E-Learning Gobernación de Nariño

## Información General

### Base URL
```
http://localhost:5000/api
```

### Formato de Respuesta
Todas las respuestas de la API están en formato JSON.

### Códigos de Estado HTTP
- `200 OK` - Solicitud exitosa
- `201 Created` - Recurso creado exitosamente
- `400 Bad Request` - Error en los datos enviados
- `401 Unauthorized` - Credenciales inválidas
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error interno del servidor

### Headers Requeridos
```
Content-Type: application/json
```

## Endpoints de Autenticación

### 1. Registro de Usuario

Crea una nueva cuenta de usuario en la plataforma.

**URL:** `POST /api/register`

**Parámetros del Body:**
```json
{
  "nombre": "string (requerido, máx. 100 caracteres)",
  "apellido": "string (requerido, máx. 100 caracteres)",
  "email": "string (requerido, formato email válido)",
  "tipo_documento": "string (requerido, valores: cedula_ciudadania, tarjeta_identidad, pasaporte, cedula_extranjeria, dni)",
  "numero_documento": "string (requerido, máx. 20 caracteres)",
  "documento_pdf": "string (opcional, archivo PDF en base64)",
  "documento_pdf_nombre": "string (opcional, nombre del archivo PDF)",
  "requisitos_pdf": "string (opcional, archivo PDF en base64)",
  "requisitos_pdf_nombre": "string (opcional, nombre del archivo PDF)",
  "password": "string (requerido, mín. 8 caracteres, debe incluir letras y números)",
  "confirm_password": "string (requerido, debe coincidir con password)"
}
```

**Ejemplo de Solicitud:**
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María Elena",
    "apellido": "Rodríguez Muñoz",
    "email": "maria.rodriguez@example.com",
    "tipo_documento": "cedula_ciudadania",
    "numero_documento": "1234567890",
    "password": "MiPassword123",
    "confirm_password": "MiPassword123"
  }'
```

**Respuesta Exitosa (201 Created):**
```json
{
  "message": "Usuario registrado exitosamente. Tu cuenta está pendiente de activación por el administrador.",
  "user": {
    "id": 1,
    "nombre": "María Elena",
    "apellido": "Rodríguez Muñoz",
    "email": "maria.rodriguez@example.com",
    "tipo_documento": "cedula_ciudadania",
    "numero_documento": "1234567890",
    "fecha_creacion": "2024-08-15T14:30:00.000Z",
    "estado_cuenta": "inactiva"
  }
}
```

**Respuesta de Error (400 Bad Request):**
```json
{
  "error": "El correo electrónico ya está registrado"
}
```

**Validaciones:**
- Todos los campos son obligatorios
- El email debe tener formato válido y ser único
- El tipo de documento debe ser uno de los valores permitidos
- El número de documento es obligatorio
- Los archivos PDF deben ser válidos y no exceder 5MB
- La contraseña debe tener al menos 8 caracteres
- La contraseña debe incluir letras y números
- Las contraseñas deben coincidir

### 2. Inicio de Sesión

Autentica un usuario existente en la plataforma.

**URL:** `POST /api/login`

**Parámetros del Body:**
```json
{
  "email": "string (requerido)",
  "password": "string (requerido)"
}
```

**Ejemplo de Solicitud:**
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria.rodriguez@example.com",
    "password": "MiPassword123"
  }'
```

**Respuesta Exitosa (200 OK):**
```json
{
  "message": "Inicio de sesión exitoso",
  "user": {
    "id": 1,
    "nombre": "María Elena",
    "apellido": "Rodríguez Muñoz",
    "email": "maria.rodriguez@example.com",
    "fecha_creacion": "2024-08-15T14:30:00.000Z",
    "estado_cuenta": "activa"
  }
}
```

**Respuesta de Error (401 Unauthorized):**
```json
{
  "error": "Credenciales inválidas"
}
```

**Respuesta de Error - Cuenta Inactiva (401 Unauthorized):**
```json
{
  "error": "Tu cuenta está inactiva. Contacta al administrador para activarla."
}
```

**Respuesta de Error - Cuenta Suspendida (401 Unauthorized):**
```json
{
  "error": "Tu cuenta está suspendida. Contacta al administrador."
}
```

**Validaciones:**
- Email y contraseña son obligatorios
- Las credenciales deben coincidir con un usuario registrado
- La cuenta debe estar activa

### 3. Solicitud de Recuperación de Contraseña

Genera un token de recuperación para restablecer la contraseña.

**URL:** `POST /api/forgot-password`

**Parámetros del Body:**
```json
{
  "email": "string (requerido)"
}
```

**Ejemplo de Solicitud:**
```bash
curl -X POST http://localhost:5000/api/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria.rodriguez@example.com"
  }'
```

**Respuesta Exitosa (200 OK):**
```json
{
  "message": "Se ha enviado un enlace de recuperación a tu correo electrónico",
  "token": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
}
```

**Nota:** En un entorno de producción, el token se enviaría por email y no se incluiría en la respuesta.

**Respuesta de Error (404 Not Found):**
```json
{
  "error": "No se encontró una cuenta con ese correo electrónico"
}
```

**Validaciones:**
- El email debe tener formato válido
- El email debe existir en la base de datos
- Se genera un token único con expiración de 1 hora

### 4. Restablecimiento de Contraseña

Establece una nueva contraseña usando un token de recuperación válido.

**URL:** `POST /api/reset-password`

**Parámetros del Body:**
```json
{
  "token": "string (requerido)",
  "new_password": "string (requerido, mín. 8 caracteres, debe incluir letras y números)",
  "confirm_password": "string (requerido, debe coincidir con new_password)"
}
```

**Ejemplo de Solicitud:**
```bash
curl -X POST http://localhost:5000/api/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
    "new_password": "NuevaPassword456",
    "confirm_password": "NuevaPassword456"
  }'
```

**Respuesta Exitosa (200 OK):**
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

**Respuesta de Error (400 Bad Request):**
```json
{
  "error": "Token inválido o expirado"
}
```

**Validaciones:**
- El token debe ser válido y no estar expirado
- La nueva contraseña debe cumplir los requisitos de seguridad
- Las contraseñas deben coincidir
- El token se invalida después del uso exitoso

## Modelos de Datos

### Usuario (User)

**Estructura de la tabla:**
```sql
CREATE TABLE user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    tipo_documento VARCHAR(50) NOT NULL,
    numero_documento VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado_cuenta VARCHAR(20) DEFAULT 'activa',
    token_reset VARCHAR(100),
    token_reset_expira DATETIME
);
```

**Campos:**
- `id`: Identificador único del usuario (auto-incremento)
- `nombre`: Nombre del usuario (máximo 100 caracteres)
- `apellido`: Apellido del usuario (máximo 100 caracteres)
- `email`: Correo electrónico único del usuario
- `tipo_documento`: Tipo de documento de identidad (máximo 50 caracteres)
- `numero_documento`: Número de documento de identidad (máximo 20 caracteres)
- `password_hash`: Hash seguro de la contraseña
- `fecha_creacion`: Fecha y hora de creación de la cuenta
- `estado_cuenta`: Estado de la cuenta (activa, inactiva, suspendida)
- `token_reset`: Token temporal para recuperación de contraseña
- `token_reset_expira`: Fecha de expiración del token de recuperación

**Representación JSON:**
```json
{
  "id": 1,
  "nombre": "María Elena",
  "apellido": "Rodríguez Muñoz",
  "email": "maria.rodriguez@example.com",
  "tipo_documento": "cedula_ciudadania",
  "numero_documento": "1234567890",
  "fecha_creacion": "2024-08-15T14:30:00.000Z",
  "estado_cuenta": "activa"
}
```

**Nota:** Los campos `password_hash`, `token_reset` y `token_reset_expira` nunca se incluyen en las respuestas JSON por seguridad.

## Códigos de Error Detallados

### Errores de Validación (400 Bad Request)

**Registro de Usuario:**
- `"Todos los campos son obligatorios"`
- `"El formato del correo electrónico no es válido"`
- `"El correo electrónico ya está registrado"`
- `"La contraseña debe tener al menos 8 caracteres"`
- `"La contraseña debe incluir letras y números"`
- `"Las contraseñas no coinciden"`

**Inicio de Sesión:**
- `"Email y contraseña son obligatorios"`
- `"Credenciales inválidas"`

**Recuperación de Contraseña:**
- `"El correo electrónico es obligatorio"`
- `"El formato del correo electrónico no es válido"`
- `"No se encontró una cuenta con ese correo electrónico"`

**Restablecimiento de Contraseña:**
- `"Todos los campos son obligatorios"`
- `"Token inválido o expirado"`
- `"La contraseña debe tener al menos 8 caracteres"`
- `"La contraseña debe incluir letras y números"`
- `"Las contraseñas no coinciden"`

### Errores del Servidor (500 Internal Server Error)

```json
{
  "error": "Error interno del servidor"
}
```

## Seguridad

### Hash de Contraseñas
- Se utiliza Werkzeug para generar hashes seguros
- Las contraseñas nunca se almacenan en texto plano
- Se utiliza salt automático para prevenir ataques de diccionario

### Tokens de Recuperación
- Se generan usando `secrets.token_urlsafe(32)`
- Tienen una expiración de 1 hora
- Se invalidan automáticamente después del uso
- Son únicos y no predecibles

### Validación de Datos
- Todas las entradas se validan en el backend
- Se utiliza SQLAlchemy ORM para prevenir inyecciones SQL
- Se sanitizan los datos antes del almacenamiento

### CORS
- Configurado para permitir solicitudes desde el frontend
- Soporte para credenciales habilitado
- Configuración restrictiva para producción

## Ejemplos de Uso

### Flujo Completo de Registro y Login

1. **Registrar nuevo usuario:**
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Carlos",
    "apellido": "Pérez García",
    "email": "juan.perez@example.com",
    "password": "MiPassword123",
    "confirm_password": "MiPassword123"
  }'
```

2. **Iniciar sesión:**
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan.perez@example.com",
    "password": "MiPassword123"
  }'
```

### Flujo de Recuperación de Contraseña

1. **Solicitar recuperación:**
```bash
curl -X POST http://localhost:5000/api/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan.perez@example.com"
  }'
```

2. **Restablecer contraseña:**
```bash
curl -X POST http://localhost:5000/api/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_RECIBIDO",
    "new_password": "NuevaPassword456",
    "confirm_password": "NuevaPassword456"
  }'
```

## Testing de la API

### Usando curl

**Archivo de pruebas (test_api.sh):**
```bash
#!/bin/bash

BASE_URL="http://localhost:5000/api"

echo "=== Probando Registro ==="
curl -X POST $BASE_URL/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "apellido": "User",
    "email": "test@example.com",
    "password": "TestPass123",
    "confirm_password": "TestPass123"
  }'

echo -e "\n\n=== Probando Login ==="
curl -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'

echo -e "\n\n=== Probando Recuperación ==="
curl -X POST $BASE_URL/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### Usando Postman

**Colección de Postman:**
1. Importar las siguientes solicitudes:
   - POST `/api/register`
   - POST `/api/login`
   - POST `/api/forgot-password`
   - POST `/api/reset-password`

2. Configurar variables de entorno:
   - `base_url`: `http://localhost:5000`

### Usando Python requests

```python
import requests
import json

BASE_URL = "http://localhost:5000/api"

# Registro
register_data = {
    "nombre": "Test",
    "apellido": "User",
    "email": "test@example.com",
    "password": "TestPass123",
    "confirm_password": "TestPass123"
}

response = requests.post(f"{BASE_URL}/register", json=register_data)
print("Registro:", response.status_code, response.json())

# Login
login_data = {
    "email": "test@example.com",
    "password": "TestPass123"
}

response = requests.post(f"{BASE_URL}/login", json=login_data)
print("Login:", response.status_code, response.json())
```

## Limitaciones Actuales

### Funcionalidades No Implementadas
- Autenticación basada en JWT tokens
- Refresh tokens para sesiones extendidas
- Rate limiting para prevenir ataques de fuerza bruta
- Logging detallado de actividades
- Endpoints para gestión de perfil de usuario

### Consideraciones para Producción
- Implementar HTTPS obligatorio
- Configurar rate limiting
- Añadir logging y monitoreo
- Implementar envío real de emails
- Configurar backup automático de base de datos
- Añadir validación de CAPTCHA para registro

## Versionado de la API

**Versión Actual:** v1.0.0

**Política de Versionado:**
- Cambios menores (bug fixes): incremento de patch (v1.0.1)
- Nuevas funcionalidades compatibles: incremento de minor (v1.1.0)
- Cambios incompatibles: incremento de major (v2.0.0)

---

**Nota:** Esta documentación corresponde a la versión inicial de la API. Se recomienda mantenerla actualizada conforme se añadan nuevas funcionalidades a la plataforma.

