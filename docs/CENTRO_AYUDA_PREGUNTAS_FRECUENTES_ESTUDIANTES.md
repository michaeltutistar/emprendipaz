# Preguntas frecuentes que suelen hacer los estudiantes (Centro de ayuda)

Este documento recoge **unas 15 preguntas típicas** formuladas como las escribirían los estudiantes. Están alineadas con la **base de conocimientos** (`support/kb.json`: acceso, perfil, progreso, módulos, desbloqueo, offline, sincronización, navegación, plan de negocio a nivel técnico, errores y contacto humano) y con la **arquitectura del centro de ayuda** en la plataforma:

- **Asistente conversacional** en el widget del estudiante, con **apertura de ticket** para seguimiento.
- **Respuestas** apoyadas en la KB, documentos de soporte en **S3** (PDF, MD, TXT) y, cuando aplica, **modelo de lenguaje vía OpenRouter** con umbral de confianza; si no alcanza certeza, puede **escalar a WhatsApp** con enlace/ticket.
- **Alcance**: problemas **técnicos y operativos** de la plataforma; **no** sustituye la tutoría académica del contenido de los módulos.

---

## 15 preguntas populares (formulación estudiante)

1. **No puedo entrar: me dice que el correo o la contraseña están mal y estoy seguro de que los escribí bien.**
   *(Relacionado con acceso / recuperación de contraseña.)*

2. **Olvidé mi contraseña y no me llega el correo para recuperarla.**
   *(Acceso / escalamiento si el flujo falla.)*

3. **La sesión se me cierra sola o me saca de la plataforma sin querer.**
   *(Sesión / PWA y validación con servidor.)*

4. **Si cierro sesión, ¿puedo volver a entrar sin internet en la app (PWA)?**
   *(Offline / reingreso tras logout.)*

5. **Estoy sin internet: ¿cómo sé si lo que hice se guardó y cuándo se va a subir?**
   *(Modo offline y cola de sincronización.)*

6. **Trabajé en el campo sin señal y cuando volvió el internet el porcentaje del módulo no subió / sigue en 75%.**
   *(Sincronización y demora; plan de negocio y registro de hitos.)*

7. **Completé una actividad (o un taller) pero el porcentaje del módulo no cambió.**
   *(Progreso / refresco en dashboard.)*

8. **En el dashboard veo un avance distinto al que veo dentro del módulo.**
   *(Dashboard vs. estado interno / sincronización.)*

9. **No se me desbloquea la siguiente unidad aunque ya terminé la anterior.**
   *(Desbloqueo progresivo / refrescar estado.)*

10. **Una unidad dice 100% pero no me deja abrir la que sigue.**
    *(Desbloqueo / posible desfase de estado.)*

11. **La página se queda en blanco o se ve “rota” y no sé qué hacer.**
    *(Navegación / caché / recarga / PWA.)*

12. **La plataforma va muy lenta o se queda cargando y no responde.**
    *(Rendimiento / conexión / reportar ruta.)*

13. **No cargan imágenes, botones o una parte de la pantalla.**
    *(Recursos / caché / reporte con pantalla concreta.)*

14. **En el Plan de Negocio guardé respuestas pero no suben los puntos o el módulo no llega al 100%.**
    *(Plan de negocio — aspecto técnico de guardado y sincronización, no el contenido académico.)*

15. **El asistente no me resolvió el problema: ¿cómo hablo con una persona y qué datos debo enviar?**
    *(Escalamiento a WhatsApp, ticket, pantalla, online/offline, descripción breve.)*

---

## Nota para contenido y soporte

- Estas preguntas sirven como **guía de redacción** para ampliar keywords en la KB, FAQs públicas o scripts de orientadores.
- Para casos que requieran diagnóstico manual, conviene que el estudiante indique **ruta o pantalla**, si estaba **con o sin internet**, y el **número de ticket** si ya existe, tal como describe la propia KB de contacto humano.
