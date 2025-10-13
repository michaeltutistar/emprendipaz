# Plataforma E-Learning - Gobernación de Nariño

## Descripción del Proyecto

La Plataforma E-Learning de la Gobernación de Nariño es una solución educativa digital completa diseñada específicamente para fortalecer los conocimientos y habilidades de los ciudadanos del departamento de Nariño. Esta plataforma web moderna combina una interfaz atractiva que sigue estrictamente los lineamientos de identidad visual oficial de la Gobernación con un sistema robusto de registro y autenticación de usuarios.

El proyecto se desarrolló utilizando tecnologías web modernas, con React para el frontend y Flask para el backend, garantizando una experiencia de usuario fluida y segura. La plataforma incluye una landing page informativa, sistema de registro de usuarios, autenticación segura y funcionalidad de recuperación de contraseñas.

## Características Principales

### Landing Page Institucional
- Diseño que cumple con los lineamientos de identidad visual de la Gobernación de Nariño
- Uso de colores oficiales: amarillo (#FFD500), verde (#10A13B), azul oscuro (#003366) y gris (#4A4A4A)
- Integración de logos oficiales (Gobernación de Nariño y GOV.CO)
- Secciones informativas: Hero, Características, Estadísticas, Beneficios y Footer
- Diseño completamente responsive para dispositivos móviles y desktop

### Sistema de Registro de Usuarios
- Formulario de registro con validaciones completas en frontend y backend
- Campos requeridos: nombre, apellido, correo electrónico y contraseña
- Validaciones de seguridad para contraseñas (mínimo 8 caracteres, letras y números)
- Verificación de coincidencia de contraseñas
- Almacenamiento seguro con hash de contraseñas

### Sistema de Autenticación
- Inicio de sesión seguro con email y contraseña
- Opción "Recordarme" para mantener la sesión
- Protección contra ataques de fuerza bruta
- Tokens de autenticación seguros

### Recuperación de Contraseñas
- Sistema de solicitud de recuperación por email
- Generación de tokens seguros con expiración
- Formulario para establecer nueva contraseña
- Validaciones de seguridad en todo el proceso

## Tecnologías Utilizadas

### Frontend
- **React 19.1.0**: Framework principal para la interfaz de usuario
- **Vite**: Herramienta de construcción y desarrollo
- **Tailwind CSS**: Framework de estilos para diseño responsive
- **React Router DOM**: Navegación entre páginas
- **Lucide React**: Iconografía moderna
- **Radix UI**: Componentes de interfaz accesibles

### Backend
- **Flask 3.1.1**: Framework web de Python
- **SQLAlchemy**: ORM para manejo de base de datos
- **Flask-CORS**: Manejo de CORS para comunicación frontend-backend
- **Werkzeug**: Utilidades de seguridad para hash de contraseñas
- **SQLite**: Base de datos para desarrollo (configurable para MySQL en producción)

### Seguridad
- Hash seguro de contraseñas con Werkzeug
- Validación de datos en frontend y backend
- Protección contra inyecciones SQL
- Configuración CORS segura
- Tokens de recuperación con expiración

## Estructura del Proyecto

```
e-learning-platform/
├── frontend/
│   └── frontend-app/
│       ├── src/
│       │   ├── components/
│       │   │   ├── LandingPage.jsx
│       │   │   ├── LoginPage.jsx
│       │   │   ├── RegisterPage.jsx
│       │   │   ├── ForgotPasswordPage.jsx
│       │   │   └── ResetPasswordPage.jsx
│       │   ├── assets/
│       │   │   ├── logo-gobernacion.png
│       │   │   └── logo-gov.png
│       │   ├── App.jsx
│       │   └── App.css
│       ├── package.json
│       └── vite.config.js
├── backend/
│   └── backend-app/
│       ├── src/
│       │   ├── models/
│       │   │   └── user.py
│       │   ├── routes/
│       │   │   └── user.py
│       │   └── main.py
│       ├── venv/
│       └── requirements.txt
└── README.md
```

## Instalación y Configuración

### Requisitos Previos
- Node.js 20.18.0 o superior
- Python 3.11 o superior
- pnpm (gestor de paquetes para Node.js)
- Git

### Configuración del Backend

1. **Navegar al directorio del backend:**
   ```bash
   cd e-learning-platform/backend/backend-app
   ```

2. **Crear y activar el entorno virtual:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # En Linux/Mac
   # o
   venv\Scripts\activate  # En Windows
   ```

3. **Instalar dependencias:**
   ```bash
   pip install flask flask-sqlalchemy flask-cors werkzeug
   ```

4. **Iniciar el servidor backend:**
   ```bash
   python src/main.py
   ```

   El servidor estará disponible en `http://localhost:5000`

### Configuración del Frontend

1. **Navegar al directorio del frontend:**
   ```bash
   cd e-learning-platform/frontend/frontend-app
   ```

2. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   pnpm run dev
   ```

   La aplicación estará disponible en `http://localhost:5173`

## Uso de la Plataforma

### Para Usuarios Finales

1. **Acceso a la Plataforma:**
   - Visitar la URL de la plataforma
   - Explorar la landing page con información sobre los servicios

2. **Registro de Nueva Cuenta:**
   - Hacer clic en "Registrarse" desde la landing page o header
   - Completar el formulario con información personal
   - Verificar que las contraseñas coincidan
   - Enviar el formulario para crear la cuenta

3. **Inicio de Sesión:**
   - Hacer clic en "Iniciar Sesión"
   - Ingresar email y contraseña
   - Opcionalmente marcar "Recordarme" para mantener la sesión
   - Acceder a la plataforma

4. **Recuperación de Contraseña:**
   - En la página de login, hacer clic en "¿Olvidaste tu contraseña?"
   - Ingresar el email registrado
   - Seguir las instrucciones recibidas
   - Usar el token para establecer nueva contraseña

### Para Administradores

1. **Monitoreo de Usuarios:**
   - Los datos de usuarios se almacenan en la base de datos SQLite
   - Acceso directo a la base de datos para consultas administrativas

2. **Configuración de Seguridad:**
   - Revisar logs del servidor para intentos de acceso
   - Monitorear tokens de recuperación expirados
   - Verificar integridad de datos de usuarios

## API Endpoints

### Registro de Usuario
- **URL:** `POST /api/register`
- **Parámetros:**
  ```json
  {
    "nombre": "string",
    "apellido": "string", 
    "email": "string",
    "password": "string",
    "confirm_password": "string"
  }
  ```
- **Respuesta exitosa:** `201 Created`
- **Respuesta de error:** `400 Bad Request` con mensaje de error

### Inicio de Sesión
- **URL:** `POST /api/login`
- **Parámetros:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Respuesta exitosa:** `200 OK` con datos del usuario
- **Respuesta de error:** `401 Unauthorized`

### Solicitud de Recuperación de Contraseña
- **URL:** `POST /api/forgot-password`
- **Parámetros:**
  ```json
  {
    "email": "string"
  }
  ```
- **Respuesta exitosa:** `200 OK` con mensaje de confirmación
- **Respuesta de error:** `404 Not Found` si el email no existe

### Restablecimiento de Contraseña
- **URL:** `POST /api/reset-password`
- **Parámetros:**
  ```json
  {
    "token": "string",
    "new_password": "string",
    "confirm_password": "string"
  }
  ```
- **Respuesta exitosa:** `200 OK`
- **Respuesta de error:** `400 Bad Request` con mensaje de error

## Seguridad Implementada

### Validaciones Frontend
- Verificación de campos obligatorios
- Validación de formato de email
- Verificación de fortaleza de contraseña
- Confirmación de coincidencia de contraseñas
- Sanitización de entrada de datos

### Seguridad Backend
- Hash seguro de contraseñas con Werkzeug
- Validación de datos en todas las rutas
- Protección contra inyecciones SQL mediante SQLAlchemy ORM
- Tokens de recuperación con expiración automática
- Configuración CORS restrictiva

### Base de Datos
- Esquema normalizado para usuarios
- Índices únicos para emails
- Campos de auditoría (fecha de creación, estado de cuenta)
- Almacenamiento seguro de tokens de recuperación

## Lineamientos de Identidad Visual

La plataforma cumple estrictamente con el Manual de Identidad Visual de la Gobernación de Nariño:

### Colores Oficiales
- **Amarillo Institucional:** #FFD500
- **Verde Institucional:** #10A13B  
- **Azul Oscuro:** #003366
- **Gris:** #4A4A4A

### Tipografía
- Fuente principal: Hind Madurai
- Jerarquía tipográfica definida para títulos, subtítulos y texto

### Logos
- Logo oficial de la Gobernación de Nariño en header
- Logo GOV.CO como elemento de identificación gubernamental
- Respeto de espacios mínimos y proporciones

## Próximos Pasos y Mejoras

### Funcionalidades Pendientes
1. **Dashboard de Usuario:** Área personal para estudiantes registrados
2. **Gestión de Cursos:** Sistema para crear y administrar contenido educativo
3. **Sistema de Certificaciones:** Generación automática de certificados
4. **Foros de Discusión:** Espacios de interacción entre estudiantes
5. **Reportes y Analytics:** Métricas de uso y progreso de estudiantes

### Mejoras Técnicas
1. **Base de Datos en Producción:** Migración a MySQL o PostgreSQL
2. **Autenticación Avanzada:** Implementación de JWT tokens
3. **Notificaciones Email:** Sistema real de envío de emails
4. **Caching:** Implementación de Redis para mejorar rendimiento
5. **Testing:** Suite completa de pruebas unitarias e integración

### Escalabilidad
1. **Containerización:** Docker para deployment
2. **CI/CD:** Pipeline de integración y deployment continuo
3. **Monitoreo:** Logs centralizados y métricas de rendimiento
4. **CDN:** Distribución de contenido estático
5. **Load Balancing:** Balanceador de carga para alta disponibilidad

## Soporte y Mantenimiento

### Contacto Técnico
- **Fecha de Desarrollo:** Agosto 2025
- **Versión:** 1.0.0

### Documentación Adicional
- Manual de Identidad Visual: `MIV_Gobernacionde_Narino_V.-1.0-Junio-2024-2.pdf`
- Lineamientos de Diseño: `design_guidelines.md`
- Lista de Tareas: `todo.md`

### Licencia
Este proyecto fue desarrollado específicamente para la Gobernación de Nariño y está sujeto a las políticas de software de la entidad.

---

**Nota:** Esta plataforma representa la fase inicial del proyecto e-learning. Las funcionalidades implementadas (landing page, registro y autenticación) constituyen la base sólida sobre la cual se pueden construir las características educativas avanzadas según las necesidades específicas de la Gobernación de Nariño.

# Pipeline trigger
