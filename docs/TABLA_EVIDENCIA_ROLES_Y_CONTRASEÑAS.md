# Evidencia de roles, permisos y almacenamiento de contraseñas

Este documento agrupa una **tabla con datos reales consultados desde la base de datos por medio de la función Lambda** y la trazabilidad técnica en el código de la plataforma. La consulta fue de solo lectura y se usó para evidenciar configuración de roles, permisos y almacenamiento de contraseñas como hash.

## 1. Tabla real por perfil

| ID | Nombre | Correo | Rol en BD | Descripción del rol | Estado | Evidencia de contraseña hasheada | Algoritmo | Longitud hash | Permisos asociados |
| --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| 1 | Administrador Sistema | `admin@elearning.com` | `admin` | Administrador de plataforma | `activa` | `scrypt:32768:8:1$pqoeo7J2ovCgEGl...cd63190fd8cb10e73f` | `scrypt:32768:8:1` | 162 | Acceso a rutas administrativas `/api/admin`, gestión de usuarios, módulos, métricas y configuración, sujeto a `@token_required` + `@admin_required`. |
| 4 | Diego Ayala | `ayala@gmail.com` | `instructor` | Instructor / acompañamiento académico | `activa` | `scrypt:32768:8:1$2DLciQ9bB4VzcVG...9c4921518fc1e39346` | `scrypt:32768:8:1` | 162 | Acceso a rutas `/api/instructor`, seguimiento de estudiantes, contenidos o recursos asignados, sujeto a `@token_required` + `@instructor_required` o `@admin_or_instructor_required`. |
| 37 | angie trejo | `angie@gmail.com` | `instructor` | Instructor / acompañamiento académico | `activa` | `scrypt:32768:8:1$csdVUKnTeb02HbL...f8836795db65564a1c` | `scrypt:32768:8:1` | 162 | Mismos permisos de instructor; las restricciones específicas por curso o recurso se aplican según la lógica de negocio. |
| 10 | Elena Reina | `elena@gmail.com` | `estudiante` | Estudiante / beneficiario de formación | `activa` | `scrypt:32768:8:1$oFt2QTLISZa9khP...8279e0964b55ad4965` | `scrypt:32768:8:1` | 162 | Acceso a rutas de estudiante `/api/student`, avance de módulos, plan de negocio, soporte y recursos propios, sujeto a rol `estudiante`. |
| 23 | Manu Bravo | `manu@gmail.com` | `estudiante` | Estudiante / beneficiario de formación | `activa` | `scrypt:32768:8:1$NgO7pM7xkH1lVP2...5f4ee465a2f2f37646` | `scrypt:32768:8:1` | 162 | Mismos permisos de estudiante; acceso limitado a información y progreso propio. |
| 24 | Estheban Bravo Bravo Bravo Bravo Bravo Bravo Bravo Bravo | `estheban@gmail.com` | `estudiante` | Estudiante / beneficiario de formación | `activa` | `scrypt:32768:8:1$zVujny8Y0nnRRlA...35600c38241076cfc7` | `scrypt:32768:8:1` | 162 | Mismos permisos de estudiante; acceso limitado a información y progreso propio. |

**Nota:** la consulta solicitó hasta dos administradores, dos instructores y tres estudiantes. La base de datos devolvió un administrador disponible con rol `admin`; por eso la tabla incluye un administrador real, dos instructores y tres estudiantes.

## 2. Trazabilidad en código (evidencia técnica)

### 2.1 Modelo de usuario: rol y hash de contraseña

- Columnas `password_hash` y `rol` en el modelo `User`.
- Métodos `set_password` / `check_password` basados en Werkzeug (`generate_password_hash` / `check_password_hash`).

Ver implementación en:

`backend/backend-app/src/models/user.py` (aprox. líneas 125–151).

### 2.2 Registro y login

- En registro, si viene `password`, se llama `user.set_password(...)`.
- En login, se valida con `user.check_password(...)` sin exponer el hash al cliente.

Rutas en `backend/backend-app/src/routes/user.py` (por ejemplo `register`, `login`).

### 2.3 Permisos por rol (API)

- Verificación de JWT: `token_required` decodifica el token HS256 y carga el usuario por `user_id`.
- Cuentas con rol `admin`, `evaluador`, `instructor` o `estudiante` requieren `estado_cuenta == 'activa'` para usar el token en rutas protegidas.
- Decoradores específicos: `admin_required`, `instructor_required`, `admin_or_instructor_required`, `student_required`, etc.

Ver `backend/backend-app/src/services/auth_service.py`.

### 2.4 Prefijos de API por tipo de usuario

- Admin: blueprint registrado con prefijo `/api/admin` en `backend/backend-app/src/main.py`.
- Instructor: `/api/instructor`.

Esto **separa superficies** de la API por rol, además de las comprobaciones en cada endpoint.

## 3. Nota de redacción para auditorías

- Las contraseñas **no se almacenan cifradas reversibles**; se guarda un **hash unidireccional** que permite comprobar la contraseña en el login sin recuperar el texto original.
- El **rol** es un campo explícito en base de datos; los **permisos** se aplican combinando JWT, estado de cuenta y decoradores por ruta.

Si necesita esta misma tabla dentro de un informe Word (.docx), puede copiar la tabla de la sección 1 o solicitar su exportación embebida en el documento correspondiente.
