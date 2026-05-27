# Comentarios de auditoría en PDFs (Abril-Emprendipaz)

## tech_V58. IMM.pdf (14 páginas, 4 comentarios)

### Comentario 1 — página 6 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** Por qué la cantidad de inscritos de antes (2580) al después (2567) es menor? Técnicamente, un proceso de mantenimiento estético de interfaz no debería provocar la desaparición o alteración de registros en la base de datos productiva.

### Comentario 2 — página 9 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** Se solicita reajustar la descripción técnica del alcance en el cuerpo del informe, clasificando con exactitud estas tareas como actividades de estabilización visual y optimización ortográfica de etiquetas. Asimismo, se solicita a enfocar los próximos entregables de mantenimiento en componentes estructurales del sistema (como optimización de consultas en bases de datos, parches de seguridad de servidores o auditorías de rendimiento del backend) que reflejen la sostenibilidad del software a largo plazo.

### Comentario 3 — página 10 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** En el informe se califica la intervención como un 'proceso integral de mantenimiento y optimización estructural'. No obstante, el soporte documental demuestra que las acciones se concentraron de manera casi exclusiva en solucionar problemas de codificación de fuentes (caracteres especiales rotos con el signo '?') y faltas de ortografía en las etiquetas de los formularios. Este tipo de fallas tipográficas e idiomáticas constituyen defectos de construcción inicial de la plataforma y no corresponden a labores complejas de mantenimiento de infraestructura o reingeniería de software.

### Comentario 4 — página 14 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** Se sugiere reescribir las conclusiones, para que tengan un enfoque más técnico y medible, vinculándolo de manera directa a los componentes modificados en la interfaz (tales como el inventario de formularios corregidos, pantallas optimizadas y la nueva disposición jerárquica del menú). Es necesario omitir adjetivos calificativos  o juicios de valor subjetivos sobre la gestión

## tech_V59. INN.pdf (11 páginas, 6 comentarios)

### Comentario 1 — página 5 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** Se sugiere utilizar negrilla para destacar el tema

### Comentario 2 — página 6 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** Mejorar la calidad de la imagen, no se puede distinguir lo que dice aun ampliándolo

### Comentario 3 — página 8 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** Inicialmente se detalla la incorporación de persistencia local, carga diferida y assets livianos para entornos rurales de Nariño para lo cual.  las imágenes 1, 2 y 3 aportadas como evidencia solo muestran formularios de usuario con textos de prueba, elementos que no demuestran el comportamiento del sistema en modo offline ni la sincronización diferida de datos. Se debe presentar evidencias de que sustenten los mecanismos de resiliencia descritos. Esto debe incluir capturas de la consola de desarrollo del navegador o de la plataforma donde se evidencie el almacenamiento local, el comportamiento de la red simulando baja conectividad, entre otras.

### Comentario 4 — página 9 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** A pesar de lo mencionarlo, el informe no incluye una sola gráfica analítica, reporte de logs, porcentaje exacto de disponibilidad ni tableros de herramientas de monitoreo reales (como AWS CloudWatch, Datadog o similares). La afirmación de "cero incidentes" se sustenta únicamente en la narrativa del operador y no en evidencias técnicas verificables.

### Comentario 5 — página 11 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** El informe no contiene ninguna métrica ni prueba técnica que lo respalde.

### Comentario 6 — página 11 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** No se aportaron pruebas de rendimiento de red (network throttling), uso de almacenamiento local (LocalStorage) ni trazas de sincronización que sustenten la conclusión

## tech_V60.IACC.pdf (23 páginas, 18 comentarios)

### Comentario 1 — página 5 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** Se calcula una satisfacción promedio de 3.91/5 basado exclusivamente en 11 encuestas completadas. Al tener 25 tickets que permanecen en estado "Abierto" , la métrica de satisfacción no refleja el universo real de la experiencia del usuario,  donde la mayoría de los casos no han documentado su cierre formal.  Cómo se calcula este valor?

### Comentario 2 — página 6 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** Si los casos que no puede resolver el asistente se pasan a WhatsApp, existe una inconsistencia numérica que debe ser aclarada.  Por ejemplo,  la Tabla 3 reporta 6 tickets con estado "Escalado a WhatsApp". La Tabla 4 (está mal numerada como 3) reporta 14 tickets en el canal "WhatsApp" y la Tabla 8. concluye que el total con evidencia de WhatsApp es de 16 tickets. Aunque se argumente que el estado del ticket y el canal final varían en el ciclo de vida, la falta de una nota aclaratoria que concilie el porqué un estado reporta 6 casos y el total consolidado de evidencias asciende a 16, no es claro

### Comentario 3 — página 6 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** El informe en su portada y encabezados establece que el periodo evaluado corresponde al mes de abril de 2026 (01/04/2026 al 30/04/2026). Sin embargo, en éste apartado se detalla que el rango de creación de los tickets analizados va desde el 14 de marzo de 2026 hasta el 06 de abril de 2026. Es decir, el informe agrupa una porción mayoritaria de datos del mes anterior (marzo) y apenas cubre los primeros 6 días de abril.  Aclarar

### Comentario 4 — página 6 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** Al no existir una integración por API entre la plataforma y WhatsApp, el historial de snapshots se interrumpe. El sistema registra el evento de salida, pero no el contenido del chat, el tiempo de espera del usuario con el asesor humano, ni la calidad de la respuesta final.

Para mejorar el vacío de control en los casos escalados, se sugiere implementar una bitácora o cuadro de cierre manual de WhatsApp dentro del Listado Maestro de Tickets. En este cuadro se deberá registrar la hora de recepción del mensaje en WhatsApp, la hora de la primera respuesta humana, la tipología del problema y el estado de cierre, soportado con la respectiva captura del chat.

### Comentario 5 — página 7 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** Debe ser Tabla 4

### Comentario 6 — página 7 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** Se evidencia un alto volumen de tickets en estado 'Abierto' (25 de 42 analizados), lo cual arroja que el canal opera con un rezago de casos significativo. Esto compromete la validez del indicador de satisfacción (3.91) , ya que se calcula sobre una muestra mínima de casos que sí lograron cerrarse.

### Comentario 7 — página 8 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** Qué acción se implementó para resolver este aspecto teniendo en cuenta que casi el 50% de los casos atendidos es por lo mismo?

### Comentario 8 — página 8 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** No suman 42 que son los Tickets atendidos.

### Comentario 9 — página 10 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** No es acorde al periodo definido para el informe

### Comentario 10 — página 11 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** Se sugiere evaluar la pertinencia de publicar videorreferencias o guías rápidas de navegación directamente en el dashboard principal de los estudiantes para mitigar la necesidad de abrir tickets por estos conceptos.

Por otro lado, se debe robustecer la base de conocimiento del asistente de IA con respuestas más didácticas, específicas y paso a paso enfocadas de manera exclusiva en los  temas críticos, garantizando que el sistema automatizado resuelva con mayor efectividad y de forma autónoma la demanda operativa de primer nivel.

### Comentario 11 — página 12 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** El sistema automatizado del Contact Center pierde el control del caso en el momento exacto del escalamiento. El hecho de que el tramo más crítico de la atención (la interacción humana que resuelve el problema) dependa de una 'exportación manual' posterior, impide realizar una auditoría en tiempo real de los tiempos de respuesta y de la calidad del servicio. 
El Contact Center debe garantizar que todo el ciclo de vida del ticket (desde el asistente IA hasta el cierre del asesor humano) quede unificado en una misma base de datos para su consulta, seguimiento y cierre.  Qué se está haciendo para solucionar este aspecto?

### Comentario 12 — página 12 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** A quien van dirigidas las recomendaciones? Se debe reestructurar este apartado.  En lugar de plantearlo como una recomendación, debe transformarse en un compromiso operativo explícito, detallando las acciones concretas e inmediatas que su equipo técnico ejecutará para garantizar el cierre oportuno de los casos y la captura real de la satisfacción del usuario

### Comentario 13 — página 13 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** Por qué no forman parte del análisis hecho en el informe si forman parte del periodo del mismo?

### Comentario 14 — página 16 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** Se solicita reemplazar las evidencias de tickets inactivos o de mero saludo (como el caso #31) por capturas analíticas de conversaciones que demuestren de extremo a extremo la gestión humana en casos sustanciales. El informe deberá exhibir soportes visuales donde se verifique el diagnóstico del problema, la interacción del asesor y la confirmación de solución por parte del usuario, validando así la verdadera eficiencia del Contact Center.

### Comentario 15 — página 22 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** Vale la pena recordar que la  calificación de satisfacción fue de 3.91/5 (basada en apenas 11 encuestas), lo cual constituyen una muestra muy baja para un universo de 42 casos y califica técnicamente como un rendimiento deficiente, no como un caso de éxito.

### Comentario 16 — página 22 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** En el informe presentado se  admitió en la página 6 y 12 que no existe integración por API con WhatsApp , generando un punto ciego absoluto donde la conversación externa queda fuera del sistema y rompe cualquier estándar de auditoría automatizada, por tanto, la trazabilidad se pierde.

### Comentario 17 — página 22 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** Se destaca y valora positivamente el avance técnico del operador en la presentación de este informe. En comparación con las entregas de periodos anteriores, este documento exhibe una estructura notablemente más adecuada, una organización metodológica clara y una diagramación que facilita la lectura ejecutiva y el proceso de revisión. La inclusión detallada de tablas cuantitativas, la separación por componentes (IA y canales externos) y la adición de anexos con evidencias demuestran un esfuerzo técnico y editorial por elevar la calidad del informe.

### Comentario 18 — página 22 (Highlight)
- **Autor/revisor:** Ruby Cano Hernández
- **Texto:** Cómo se sustenta esta conclusión si  el informe no presenta una sola métrica, gráfico o tabla sobre ANS (Acuerdos de Nivel de Servicio) o tiempos de espera. Además, con 25 tickets en estado 'Abierto' de un total de 42, el rezago operativo roza el 60%, lo cual contradice abiertamente cualquier conclusión de eficiencia o control temporal.
