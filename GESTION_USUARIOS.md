# Gestión de Usuarios - Plataforma E-Learning Gobernación de Nariño

## Sistema de Activación de Cuentas

### Flujo de Registro y Activación

1. **Registro de Usuario**: Los usuarios se registran con estado `inactiva` por defecto
2. **Activación Manual**: El administrador debe activar las cuentas manualmente
3. **Acceso a la Plataforma**: Solo usuarios con estado `activa` pueden iniciar sesión

### Estados de Cuenta

- **`inactiva`**: Cuenta recién registrada, pendiente de activación
- **`activa`**: Cuenta habilitada, puede acceder a la plataforma
- **`suspendida`**: Cuenta temporalmente bloqueada por el administrador

## Comandos de Gestión

### Script de Activación de Usuarios

Ubicación: `backend/backend-app/activate_user.py`

#### Listar Usuarios Inactivos
```bash
cd backend/backend-app
python activate_user.py list
```

#### Activar Usuario por ID
```bash
python activate_user.py activate-id <ID_USUARIO>
```

#### Activar Usuario por Email
```bash
python activate_user.py activate-email <EMAIL_USUARIO>
```

#### Activar Todos los Usuarios Inactivos
```bash
python activate_user.py activate-all
```

### Sentencias SQL para Gestión Directa

#### Ver Usuarios y su Estado
```sql
USE elearning_narino;

SELECT 
    id,
    nombre,
    apellido,
    email,
    tipo_documento,
    numero_documento,
    estado_cuenta,
    fecha_creacion
FROM user 
ORDER BY fecha_creacion DESC;
```

#### Activar Usuario Específico
```sql
UPDATE user 
SET estado_cuenta = 'activa' 
WHERE email = 'usuario@example.com';
```

#### Activar Todos los Usuarios Inactivos
```sql
UPDATE user 
SET estado_cuenta = 'activa' 
WHERE estado_cuenta = 'inactiva';
```

#### Suspender Usuario
```sql
UPDATE user 
SET estado_cuenta = 'suspendida' 
WHERE email = 'usuario@example.com';
```

#### Ver Estadísticas de Estados
```sql
SELECT 
    estado_cuenta,
    COUNT(*) as cantidad
FROM user 
GROUP BY estado_cuenta;
```

## Proceso de Activación Recomendado

### 1. Revisión de Registros
- Ejecutar `python activate_user.py list` para ver usuarios pendientes
- Verificar información del usuario (nombre, email, documento)

### 2. Activación Individual
- Para usuarios verificados: `python activate_user.py activate-email usuario@example.com`
- Para casos especiales: usar el ID del usuario

### 3. Activación Masiva (Opcional)
- Solo usar cuando se confirme la verificación de todos los usuarios
- Ejecutar `python activate_user.py activate-all`

### 4. Seguimiento
- Monitorear el acceso de usuarios activados
- Mantener registro de activaciones realizadas

## Seguridad y Consideraciones

### Validación de Usuarios
- Verificar que el email sea válido y pertenezca al usuario
- Confirmar que el documento de identidad sea correcto
- Validar que el usuario pertenezca a la población objetivo

### Registro de Actividades
- Mantener log de activaciones realizadas
- Documentar razones de suspensión de cuentas
- Registrar fechas y responsables de cada acción

### Políticas de Activación
- Establecer criterios claros para la activación
- Definir proceso de verificación de identidad
- Establecer protocolo para casos especiales

## Troubleshooting

### Usuario No Puede Iniciar Sesión
1. Verificar estado de cuenta: `SELECT estado_cuenta FROM user WHERE email = 'usuario@example.com';`
2. Si está inactiva, activar la cuenta
3. Si está suspendida, revisar razones y decidir reactivación

### Error en Script de Activación
1. Verificar conexión a la base de datos
2. Confirmar que el entorno esté configurado correctamente
3. Revisar permisos de acceso a la base de datos

### Usuarios Duplicados
```sql
-- Verificar emails duplicados
SELECT email, COUNT(*) as cantidad
FROM user 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Verificar documentos duplicados
SELECT numero_documento, COUNT(*) as cantidad
FROM user 
GROUP BY numero_documento 
HAVING COUNT(*) > 1;
```

## Contacto y Soporte

Para dudas sobre la gestión de usuarios, contactar al administrador del sistema o al equipo técnico de la Gobernación de Nariño. 