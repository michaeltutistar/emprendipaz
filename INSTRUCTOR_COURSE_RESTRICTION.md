# Restricción de Cursos para Instructores

## Descripción

Esta funcionalidad asegura que los instructores solo puedan ver y gestionar los cursos que les han sido específicamente asignados por el administrador, en lugar de tener acceso a todos los cursos del sistema.

## Funcionalidades Implementadas

### 1. Asignación de Instructores (Panel de Administrador)

**Ubicación**: `frontend/frontend-app/src/components/admin/ContentManagement.jsx`

- El administrador puede asignar instructores a cursos desde la sección de "Gestión de Contenido"
- Cada curso tiene un campo de selección de instructor
- Los instructores pueden ser asignados o desasignados de cursos existentes

### 2. Filtrado de Cursos por Instructor (Backend)

**Ubicación**: `backend/backend-app/src/routes/instructor.py`

Los endpoints del instructor filtran automáticamente los cursos por `instructor_id`:

- `GET /api/instructor/dashboard` - Solo muestra estadísticas de cursos asignados
- `GET /api/instructor/cursos` - Solo lista cursos asignados al instructor
- `GET /api/instructor/curso/{id}` - Solo permite acceso a cursos asignados
- `GET /api/instructor/curso/{id}/estudiantes` - Solo estudiantes de cursos asignados
- `GET /api/instructor/modulos` - Solo módulos de cursos asignados

### 3. Dashboard del Instructor Actualizado

**Ubicación**: `frontend/frontend-app/src/components/InstructorDashboard.jsx`

- Conectado con la API real del backend
- Muestra solo los cursos asignados al instructor logueado
- Estadísticas basadas en cursos asignados únicamente

### 4. Gestión de Cursos del Instructor

**Ubicación**: `frontend/frontend-app/src/components/instructor/CourseManager.jsx`

- Lista completa de cursos asignados al instructor
- Búsqueda y filtrado de cursos propios
- Vista detallada de cada curso asignado
- Navegación a gestión de estudiantes y módulos

### 5. Componentes de Contenido Actualizados

**Ubicaciones**:
- `frontend/frontend-app/src/components/instructor/ContentUpload.jsx`
- `frontend/frontend-app/src/components/instructor/ContentScheduler.jsx`

- Solo muestran cursos asignados al instructor en los selectores
- Carga dinámica de cursos y módulos desde la API

## Flujo de Trabajo

### Para el Administrador:

1. **Acceder a Gestión de Contenido**
   - Ir a `/admin/content-management`
   - Ver lista de todos los cursos del sistema

2. **Asignar Instructor**
   - Seleccionar un curso
   - Hacer clic en "Editar"
   - Elegir instructor del dropdown
   - Guardar cambios

3. **Verificar Asignación**
   - El curso mostrará el instructor asignado en la lista

### Para el Instructor:

1. **Iniciar Sesión**
   - Login con credenciales de instructor
   - Acceder al dashboard

2. **Ver Cursos Asignados**
   - Dashboard muestra solo cursos asignados
   - Estadísticas basadas en cursos propios

3. **Gestionar Contenido**
   - Subir contenido solo a cursos asignados
   - Programar contenido solo en cursos propios
   - Ver estudiantes solo de cursos asignados

## Seguridad Implementada

### Backend (Decoradores de Autenticación)

```python
@token_required
@instructor_required
def get_instructor_courses(current_user):
    # Filtra automáticamente por instructor_id
    cursos = Curso.query.filter_by(instructor_id=current_user.id).all()
```

### Verificación de Propiedad

```python
# Verificar que el curso pertenece al instructor
curso = Curso.query.filter_by(id=curso_id, instructor_id=current_user.id).first()
if not curso:
    return jsonify({'error': 'Curso no encontrado'}), 404
```

## Endpoints de la API

### Instructor (Restringidos)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/instructor/dashboard` | GET | Dashboard con cursos asignados |
| `/api/instructor/cursos` | GET | Lista de cursos asignados |
| `/api/instructor/curso/{id}` | GET | Detalles de curso asignado |
| `/api/instructor/curso/{id}/estudiantes` | GET | Estudiantes de curso asignado |
| `/api/instructor/modulos` | GET | Módulos de cursos asignados |

### Admin (Sin Restricciones)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/admin/courses` | GET | Todos los cursos del sistema |
| `/api/admin/courses/{id}` | PUT | Asignar instructor a curso |
| `/api/admin/instructors` | GET | Lista de instructores |

## Pruebas

### Script de Prueba Automatizada

**Archivo**: `test_instructor_courses.py`

El script verifica:

1. ✅ Login como administrador
2. ✅ Obtener todos los cursos (vista admin)
3. ✅ Asignar instructor a curso
4. ✅ Login como instructor
5. ✅ Verificar que instructor solo ve cursos asignados
6. ✅ Verificar que instructor no puede acceder a endpoint de admin

### Ejecutar Pruebas

```bash
python test_instructor_courses.py
```

## Casos de Uso

### Escenario 1: Instructor Nuevo
1. Admin crea curso "React Avanzado"
2. Admin asigna instructor "Juan Pérez" al curso
3. Juan Pérez inicia sesión
4. Ve solo "React Avanzado" en su dashboard
5. Puede gestionar contenido del curso

### Escenario 2: Múltiples Instructores
1. Admin tiene 10 cursos en el sistema
2. Instructor A está asignado a 3 cursos
3. Instructor B está asignado a 2 cursos
4. Instructor C está asignado a 5 cursos
5. Cada instructor ve solo sus cursos asignados

### Escenario 3: Reasignación
1. Admin reasigna curso de Instructor A a Instructor B
2. Instructor A ya no ve el curso
3. Instructor B ahora ve el curso
4. Los datos del curso se mantienen intactos

## Beneficios

### Seguridad
- ✅ Aislamiento de datos entre instructores
- ✅ Prevención de acceso no autorizado
- ✅ Verificación de propiedad en cada operación

### Usabilidad
- ✅ Interfaz limpia sin cursos irrelevantes
- ✅ Estadísticas precisas por instructor
- ✅ Navegación simplificada

### Escalabilidad
- ✅ Soporte para múltiples instructores
- ✅ Fácil reasignación de cursos
- ✅ Auditoría de asignaciones

## Consideraciones Técnicas

### Base de Datos
- Campo `instructor_id` en tabla `curso`
- Relación con tabla `user` (rol = 'instructor')
- Índices para optimizar consultas por instructor

### Frontend
- Carga dinámica de datos desde API
- Manejo de estados de carga
- Validación de permisos en componentes

### Backend
- Decoradores de autenticación y autorización
- Filtrado automático por instructor
- Manejo de errores y respuestas consistentes

## Mantenimiento

### Monitoreo
- Revisar logs de acceso a endpoints
- Verificar asignaciones de cursos
- Monitorear rendimiento de consultas

### Actualizaciones
- Mantener sincronización entre frontend y backend
- Actualizar documentación de API
- Revisar permisos y decoradores

## Conclusión

Esta implementación proporciona un sistema robusto y seguro para la gestión de cursos por instructores, asegurando que cada instructor tenga acceso únicamente a sus cursos asignados, mientras que el administrador mantiene control total sobre todas las asignaciones. 