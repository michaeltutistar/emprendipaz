# Centro de ayuda — Arquitectura y diseño (documento para auditoría)

**Versión:** alineada al código del repositorio (backend Flask + frontend React, despliegue serverless en AWS Lambda).
**Audiencia:** auditores internos o externos que requieran entender el módulo sin acceso al código.

---

## 1. Propósito y alcance

### 1.1 Objetivo del módulo

El **centro de ayuda** orienta a **estudiantes** (y rol equivalente `usuario`) ante **incidencias técnicas y operativas** del uso de la plataforma: acceso, perfil, progreso, módulos, sincronización, modo offline, navegación y errores frecuentes.

### 1.2 Límites explícitos (no funcional)

- **No** sustituye la tutoría académica: no entrega respuestas de evaluaciones, talleres, contenido pedagógico interno ni código fuente.
- Las respuestas del asistente deben basarse en **evidencia documental** configurada en el sistema; si no hay confianza suficiente, el flujo puede **escalar** a atención humana por **WhatsApp**.

---

## 2. Vista de arquitectura (componentes)

| Capa | Componente | Función |
|------|------------|---------|
| **Cliente** | Widget de centro de ayuda (`SupportCenterWidget`) | Interfaz de chat, gestión de ticket activo, encuesta de satisfacción, apertura de WhatsApp cuando aplica. |
| **API** | Blueprint `/api/student/support/*` | Autenticación, creación y continuación de tickets, escalamiento manual, satisfacción, listado y detalle de tickets. |
| **Lógica** | `support_service` | Recuperación de contexto (RAG ligero), decisión de respuesta, integración opcional con modelo de lenguaje, construcción de URL de WhatsApp, archivado en objeto. |
| **Datos relacionales** | Tablas `support_tickets`, `support_ticket_messages`, `support_ticket_satisfaction` | Persistencia de conversación, estado del ticket, calificación y cierre. |
| **Almacenamiento objeto** | Amazon S3 (bucket configurado) | Base de conocimiento JSON, documentos de soporte (MD/PDF/TXT), copias de respaldo de conversaciones (snapshots). |
| **Servicio externo (opcional)** | OpenRouter (API de modelos de lenguaje) | Generación de respuesta en lenguaje natural condicionada al contexto recuperado. |

El backend puede ejecutarse en **AWS Lambda** detrás de API Gateway u otro front HTTP; el diseño del módulo es independiente del contenedor siempre que las variables de entorno y el acceso a S3 y base de datos estén disponibles.

---

## 3. Flujo funcional resumido

1. El estudiante abre el widget e inicia un mensaje → **POST** `/student/support/start` (o continúa un ticket → **POST** `/student/support/message`).
2. El servidor crea o actualiza un **ticket**, guarda el mensaje del usuario y ejecuta **`build_support_decision(mensaje)`**.
3. Esa función:
   - Normaliza y acota la longitud del mensaje.
   - Trata **saludos simples** con una respuesta fija de bienvenida (sin RAG).
   - Carga **fragmentos recuperables**: entradas de `kb.json` + fragmentos generados desde documentos en `support/documents/` (S3) o, en fallo, documentos locales de soporte.
   - **Recupera** los fragmentos más relevantes mediante un **score léxico** (tokens en título, keywords y cuerpo, con bonificaciones por frases).
   - Aplica **reglas de intención** documentadas en código (p. ej. priorizar entradas de contacto humano cuando la pregunta es explícita sobre hablar con una persona o qué datos enviar al soporte).
   - Si el score máximo es **inferior a un umbral**, no se llama al modelo: se responde con mensaje de **escalamiento a WhatsApp**.
   - Si **OpenRouter está habilitado** y hay API key, envía al modelo el **contexto seleccionado** y la **pregunta**; el modelo debe ceñirse a las evidencias y puede devolver `NO_SE` si no es seguro.
   - Si OpenRouter falla, se usa **respuesta de respaldo** a partir del mejor fragmento recuperado.
4. Se persiste la respuesta del asistente (y metadatos como **confianza** y **tópico**) en `support_ticket_messages`.
5. Si la decisión indica **redirección a WhatsApp**, el ticket pasa a estado `escalated_whatsapp` y la API devuelve una **URL prellenada** (`wa.me`) con número y texto de contexto (incluye id de ticket y datos no sensibles del usuario).
6. El estudiante puede **escalar manualmente** (**POST** `/student/support/escalate`) aunque la IA no haya forzado escalamiento.
7. Tras la interacción, el widget puede mostrar **encuesta de satisfacción** (**POST** `/student/support/satisfaction`), que cierra el ticket (`closed`) y registra calificación opcional (1–5) y comentario acotado en longitud.
8. En puntos clave del ciclo de vida se invoca **`archive_ticket_snapshot`**, que escribe un JSON en S3 bajo prefijos `support/conversations/...` para **trazabilidad** y análisis posterior.

---

## 4. Diseño del “cerebro” asistencial (RAG + IA)

### 4.1 Fuentes de conocimiento

| Fuente | Ubicación típica | Rol |
|--------|-------------------|-----|
| **KB estructurada** | `support/kb.json` (despliegue en paquete o objeto S3 vía `SUPPORT_KB_KEY`) | Artículos cortos con `title`, `content`, `category`, `keywords`; alimentan la recuperación y frases para coincidencia. |
| **Documentos largos** | Prefijo S3 `SUPPORT_DOCS_PREFIX` (p. ej. `support/documents/`), formatos `.md`, `.txt`, `.pdf` | Se fragmentan en secciones/bloques para recuperación; el PDF se extrae como texto. |

**Nota de diseño:** ciertas secciones del manual (p. ej. listas de “ejemplos de preguntas válidas”) pueden **excluirse del índice** en tiempo de fragmentación para evitar que el modelo **repita menús** en lugar de procedimientos concretos.

### 4.2 Recuperación de contexto

- **Tokenización** del texto del usuario y de cada fragmento (normalización Unicode, minúsculas).
- **Puntuación** proporcional a solapamiento en título, keywords y contenido, más bonos si una keyword o el título aparecen como subcadena en la pregunta normalizada.
- Se devuelven los **N** mejores fragmentos (típicamente 4) al generador.

### 4.3 Modelo de lenguaje (OpenRouter)

- **Configurable** mediante `SUPPORT_USE_OPENROUTER` y `OPENROUTER_API_KEY` / `OPENROUTER_MODEL`.
- **Timeout** acotado para evitar bloqueos largos en Lambda.
- **Prompt de sistema** impone: responder solo con base en evidencias, no revelar contenido académico sensible, y usar la marca literal **`NO_SE`** si no hay base suficiente (lo que dispara respuesta de escalamiento en la capa de decisión).
- **Temperatura baja** para reducir inventiva fuera de contexto.

### 4.4 Umbral de confianza

- Existe un **umbral mínimo de score** de recuperación (`LOW_CONFIDENCE_THRESHOLD`). Por debajo de él, **no** se invoca el modelo externo y se ofrece **escalamiento** a WhatsApp, reduciendo riesgo de respuestas infundadas.

### 4.5 Reglas de intención (no son “respuestas fijas” por tema)

Además del score léxico, el código puede **reordenar o inyectar** fragmentos de la KB cuando la pregunta coincide con patrones de **contacto humano** u otras intenciones críticas, para mitigar **falsos positivos** del recuperador (p. ej. la palabra “problema” en muchos documentos).

---

## 5. Modelo de datos y trazabilidad

### 5.1 Entidades principales

- **Ticket:** usuario propietario, estado (`open`, `escalated_whatsapp`, `closed`, etc.), tópico inferido, resumen derivado del mensaje, canal final opcional.
- **Mensaje:** emisor (`user`, `assistant`, `system`), texto, **confianza** numérica opcional para mensajes del asistente, marca de tiempo.
- **Satisfacción:** vinculación 1:1 con ticket, indicador de si el estudiante consideró resuelto el caso, **rating** 1–5, comentario acotado.

### 5.2 Archivo en S3

- Snapshots JSON en rutas bajo `support/conversations/` con motivo de archivo (`ticket_started`, `ticket_message`, `ticket_escalated`, `ticket_closed`, etc.) y payload del ticket (incluyendo mensajes cuando aplica la serialización).

**Utilidad para auditoría:** reconstrucción aproximada del hilo y del momento del escalamiento sin depender solo de logs de aplicación.

---

## 6. Seguridad y control de acceso

- Endpoints bajo **`/api/student/support`**: **`token_required`** (JWT/sesión según implementación global).
- **`_ensure_student_access`:** solo roles **`estudiante`** o **`usuario`**.
- Los tickets se consultan y modifican **solo si pertenecen al usuario autenticado** (`_get_owned_ticket_or_404`).
- Mensajes de usuario y asistente se **acotan en longitud** (`clamp_message`) para abuso y costos.

---

## 7. Privacidad y transferencias externas

| Dato / flujo | Consideración |
|--------------|----------------|
| **Mensaje del estudiante** | Se almacena en base de datos; puede enviarse como texto a **OpenRouter** dentro del prompt junto con fragmentos de documentación. |
| **OpenRouter** | Proveedor externo; conviene revisar sus términos y política de retención para el nivel de auditoría requerido. |
| **WhatsApp** | Al escalar, se abre enlace con **texto predefinido** que incluye id de ticket, nombre del usuario y resumen; no debe incluir contraseñas (la KB orienta a no compartirlas). |
| **S3** | Contiene KB, manuales y snapshots de conversaciones; el acceso debe estar acotado por IAM y cifrado según política de la organización. |

---

## 8. Variables de entorno relevantes (referencia, sin valores secretos)

- `S3_BUCKET` / `SUPPORT_KB_BUCKET`: bucket para KB y documentos de soporte.
- `SUPPORT_KB_KEY`: clave del objeto JSON de KB en S3 (si se usa lectura remota).
- `SUPPORT_DOCS_PREFIX`: prefijo de documentos de soporte.
- `SUPPORT_WHATSAPP_NUMBER`: número para `wa.me`.
- `SUPPORT_USE_OPENROUTER`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`.
- Conectividad y credenciales de **base de datos** para persistencia de tickets.

---

## 9. Características operativas destacadas

- **Tickets con historial** reutilizable (listado y detalle de tickets del estudiante).
- **Escalamiento automático** por baja confianza o respuesta `NO_SE` del modelo.
- **Escalamiento manual** desde el widget.
- **Encuesta de cierre** con cierre formal del ticket.
- **Resiliencia:** si falla la carga de documentos desde S3, puede usarse **fallback** a documentos locales del despliegue (según configuración y empaquetado).
- **Caché en memoria** de listados de documentos S3 para reducir latencia entre invocaciones en el mismo entorno de ejecución (comportamiento a tener en cuenta si se actualizan documentos en caliente).

---

## 10. Riesgos y controles asociados (lectura auditora)

| Riesgo | Mitigación implementada en diseño |
|--------|-----------------------------------|
| Respuesta fuera de evidencia | Prompt restrictivo + `NO_SE` + umbral de recuperación + escalamiento. |
| Fuga de contenido académico | Instrucciones explícitas al modelo y alcance del centro de ayuda en KB y manuales. |
| Recuperación incorrecta (“menú” en lugar de procedimiento) | Exclusión de secciones meta del índice; reglas de intención; ampliación de keywords en KB. |
| Abuso o mensajes muy largos | `clamp_message` en API y servicio. |
| Dependencia de terceros (LLM) | Flag de deshabilitación y fallback por fragmento sin LLM. |

---

## 11. Referencias de código (trazabilidad técnica)

- Frontend: `frontend/frontend-app/src/components/student/SupportCenterWidget.jsx`
- API: `backend/backend-app/src/routes/support.py`
- Lógica: `backend/backend-app/src/services/support_service.py`
- Modelos: `backend/backend-app/src/models/support_ticket.py`
- KB de ejemplo: `backend/backend-app/support/kb.json`
- Registro del blueprint: `backend/backend-app/src/main.py` (`url_prefix` bajo `/api/student/support`)

---

*Fin del documento.*
