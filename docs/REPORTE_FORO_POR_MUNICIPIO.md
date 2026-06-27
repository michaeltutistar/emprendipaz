# Reporte técnico y funcional del foro por municipio

**Versión:** alineada al código actual del repositorio
**Audiencia:** revisión interna, técnica y documental
**Formato:** síntesis impersonal y profesional del módulo implementado

---

## 1. Descripción general

El módulo identificado funcionalmente como **foro por municipio** fue implementado en la plataforma como un **foro por nodo territorial**. En la práctica, el municipio del usuario no crea un foro aislado por cada localidad, sino que se utiliza para determinar el **nodo territorial** al que pertenece el estudiante. A partir de esta asignación, el sistema habilita el acceso al espacio de conversación correspondiente.

Este enfoque permite agrupar municipios relacionados dentro de un mismo foro, mantener la segmentación territorial de las conversaciones y facilitar la interacción entre estudiantes e instructores de un mismo contexto geográfico.

---

## 2. Objetivo del módulo

El propósito del módulo es habilitar un espacio de comunicación asincrónica entre estudiantes e instructores, organizado territorialmente, para:

- publicar preguntas relacionadas con el proceso formativo;
- responder inquietudes dentro del mismo territorio;
- centralizar conversaciones por nodo;
- facilitar el acompañamiento académico y operativo sin mezclar comunidades de diferentes zonas.

---

## 3. Criterio de organización territorial

La lógica territorial del foro parte del **municipio del usuario**. Ese valor se normaliza y se contrasta contra un catálogo de nodos y municipios asociados.

El sistema contempla **once nodos territoriales**:

- Centro
- Abades
- Cordillera
- Exprovincia de Obando
- Guambuyaco
- Juanambú
- Occidente
- Río Mayo
- Costa Pacífica
- Sabana
- Telembí

Cada nodo contiene:

- un `slug` técnico;
- un nombre visible;
- una cabecera municipal;
- un listado de municipios asociados.

Por tanto, el foro no está modelado como “un foro independiente por cada municipio”, sino como **un foro por nodo derivado del municipio**.

---

## 4. Arquitectura de la solución

### 4.1 Frontend

La interfaz fue implementada en **React** y cuenta con dos vistas principales:

- `StudentNodeForumPage`, para estudiantes;
- `InstructorNodeForumPage`, para instructores.

En la capa de cliente también existe una constante compartida con la definición de nodos y alias de municipios, utilizada para resolver el nodo correspondiente y mostrar mensajes contextuales en la interfaz.

Las rutas principales expuestas en la aplicación web son:

- `/student/foro`
- `/instructor/foro`

Desde el panel del estudiante se muestra un acceso directo al foro de su nodo. Desde el panel del instructor se expone una entrada a la vista de administración y seguimiento de foros por nodo.

### 4.2 Backend

La lógica del módulo está implementada en **Flask** mediante un blueprint específico para foro, registrado bajo el prefijo general `/api`.

El backend se encarga de:

- autenticar al usuario;
- validar el rol;
- resolver el nodo territorial desde el municipio;
- listar los hilos del nodo correspondiente;
- crear preguntas;
- crear respuestas;
- restringir accesos cuando el estudiante intenta abrir un hilo que no pertenece a su nodo;
- permitir al instructor administrar conversaciones en cualquier nodo.

### 4.3 Persistencia de datos

El módulo utiliza dos entidades principales en base de datos:

| Tabla | Función |
|------|---------|
| `node_forum_threads` | Almacena los hilos o preguntas principales del foro |
| `node_forum_replies` | Almacena las respuestas asociadas a cada hilo |

La relación es de tipo uno a muchos: un hilo puede contener múltiples respuestas.

Los registros almacenan, entre otros, los siguientes datos:

- identificador del nodo;
- usuario autor;
- contenido de la pregunta o respuesta;
- estado del hilo;
- fecha de creación;
- fecha de actualización.

---

## 5. Lógica de asignación por municipio

La asignación territorial se apoya en dos capas:

1. **Obtención del municipio preferido del usuario.**
   El sistema intenta resolver el municipio desde una fuente operativa en CSV y, si no existe coincidencia, usa el municipio registrado en el perfil del usuario.

2. **Resolución del nodo territorial.**
   El municipio se normaliza para corregir diferencias de tildes, mayúsculas, espacios y alias comunes. Posteriormente se compara contra la tabla de municipios configurados por nodo.

Este diseño permite manejar variaciones ortográficas como nombres con o sin tilde, formas abreviadas o equivalencias operativas.

---

## 6. Modelo funcional del foro

El funcionamiento general del módulo es el siguiente:

1. El usuario autenticado ingresa al foro.
2. El backend identifica su municipio preferido.
3. El sistema determina el nodo territorial correspondiente.
4. Se cargan las estadísticas y los hilos del nodo.
5. El usuario puede crear una nueva pregunta o responder un hilo existente.
6. Cada nueva respuesta actualiza la fecha de actividad del hilo.

Cuando el usuario tiene rol de estudiante, el acceso queda restringido exclusivamente al foro de su propio nodo. Cuando el usuario tiene rol de instructor, el sistema permite navegar entre todos los nodos y administrar su contenido.

---

## 7. Funcionalidades implementadas para estudiantes

La vista del estudiante incorpora las siguientes capacidades:

- consulta de la información de su nodo territorial;
- visualización del municipio con el que fue asignado;
- visualización de cabecera del nodo;
- consulta de estadísticas del foro, incluyendo cantidad de preguntas y respuestas;
- publicación de nuevas preguntas;
- consulta del listado de hilos disponibles en su nodo;
- apertura del detalle de cada hilo;
- publicación de respuestas dentro de un hilo;
- bloqueo de acceso a hilos pertenecientes a otros nodos;
- acceso directo desde el dashboard al foro correspondiente;
- mensaje contextual en el perfil indicando el foro al que pertenece según el municipio registrado.

La experiencia está construida como un foro asincrónico de interacción simple, orientado a preguntas y respuestas dentro del mismo territorio.

---

## 8. Funcionalidades implementadas para instructores

La vista del instructor incorpora funciones de supervisión y gestión ampliadas:

- consulta del listado de nodos territoriales;
- visualización de métricas por nodo;
- filtrado de hilos por nodo;
- creación de preguntas directamente en cualquier nodo;
- respuesta a hilos como instructor;
- consulta del detalle completo de cada conversación;
- eliminación de hilos;
- eliminación de respuestas;
- exportación de la conversación de un nodo.

La exportación se entrega desde el backend en formato estructurado y en el frontend se transforma en un archivo `.xlsx`, con el fin de facilitar revisión, seguimiento o respaldo operativo.

---

## 9. Seguridad y control de acceso

El módulo aplica controles diferenciados por rol:

- el estudiante solo puede consultar y participar en el foro del nodo asignado;
- el instructor puede consultar y gestionar todos los nodos;
- la autenticación se realiza mediante token;
- los endpoints validan acceso antes de exponer información o permitir modificaciones.

Adicionalmente, el backend aplica validaciones básicas sobre los textos recibidos, como limpieza y recorte de longitud, con el fin de reducir entradas vacías o excesivamente extensas.

---

## 10. Endpoints principales

### 10.1 Endpoints para estudiante

- `GET /api/student/forum/me`
- `GET /api/student/forum/threads`
- `POST /api/student/forum/threads`
- `GET /api/student/forum/threads/<id>`
- `POST /api/student/forum/threads/<id>/replies`

### 10.2 Endpoints para instructor

- `GET /api/instructor/forum/nodes`
- `GET /api/instructor/forum/nodes/<slug>/export`
- `GET /api/instructor/forum/threads`
- `POST /api/instructor/forum/threads`
- `GET /api/instructor/forum/threads/<id>`
- `DELETE /api/instructor/forum/threads/<id>`
- `POST /api/instructor/forum/threads/<id>/replies`
- `DELETE /api/instructor/forum/replies/<id>`

---

## 11. Integración con la plataforma

El módulo no se encuentra aislado; está integrado con varias áreas de la plataforma:

- **Dashboard del estudiante**, desde donde se presenta el acceso al foro del nodo correspondiente.
- **Dashboard del instructor**, desde donde se accede a la gestión de foros por nodo.
- **Perfil del estudiante**, donde se informa el nodo del foro asociado al municipio.
- **Sistema de autenticación**, que controla sesión y permisos.
- **Modelo de usuario**, desde donde se toma la información territorial base.

Esta integración permite que el foro se perciba como una extensión natural del ecosistema de aprendizaje y no como una funcionalidad externa.

---

## 12. Alcance real de la implementación

Desde el punto de vista documental, es importante precisar que el desarrollo existente corresponde a un **foro territorial segmentado por nodo**, no a una estructura de foros individuales por municipio.

En consecuencia:

- el municipio sí es determinante en la asignación;
- la experiencia del estudiante depende del municipio registrado;
- varios municipios comparten un mismo foro;
- la segmentación real ocurre a nivel de nodo territorial.

Esta precisión es relevante para informes técnicos, auditorías o documentación funcional, ya que evita describir la solución con un nivel de granularidad diferente al efectivamente implementado.

---

## 13. Archivos principales de referencia

### Backend

- `backend/backend-app/src/routes/forum.py`
- `backend/backend-app/src/services/forum_node_service.py`
- `backend/backend-app/src/services/student_municipio_service.py`
- `backend/backend-app/src/models/node_forum.py`

### Frontend

- `frontend/frontend-app/src/components/student/StudentNodeForumPage.jsx`
- `frontend/frontend-app/src/components/instructor/InstructorNodeForumPage.jsx`
- `frontend/frontend-app/src/components/student/StudentDashboard.jsx`
- `frontend/frontend-app/src/components/InstructorDashboard.jsx`
- `frontend/frontend-app/src/components/student/StudentProfile.jsx`
- `frontend/frontend-app/src/components/student/StudentRoutes.jsx`
- `frontend/frontend-app/src/components/instructor/InstructorRoutes.jsx`
- `frontend/frontend-app/src/constants/forumNodes.js`

---

## 14. Conclusión

El foro construido en la plataforma corresponde a un módulo de comunicación asincrónica segmentado territorialmente. Su diseño toma el municipio del usuario como dato de entrada, resuelve el nodo territorial correspondiente y habilita la participación únicamente dentro de ese espacio.

La solución combina una interfaz React, una API Flask con validación por rol, persistencia relacional de hilos y respuestas, y una capa de normalización territorial para asociar municipios a nodos. En términos funcionales, permite la publicación y seguimiento de conversaciones entre estudiantes e instructores, con control de acceso, trazabilidad básica y herramientas de administración para el rol docente.

En síntesis, se trata de un foro territorial operativo, integrado a la plataforma e-learning y alineado con una organización por nodos derivados del municipio del usuario.

---

*Fin del documento.*
