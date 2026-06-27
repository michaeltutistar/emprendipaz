"""
Aplica correcciones de auditoría (Ruby Cano) a IMM, INN e IACC ABR.docx.
Inserta bloques nuevos en amarillo + fuente Cambria, con explicación de la corrección.
No elimina el texto original para revisión del colega.
"""
from __future__ import annotations

from pathlib import Path

from docx import Document
from docx.enum.text import WD_COLOR_INDEX
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.text.paragraph import Paragraph

FOLDER = Path(r"C:\Users\USUARIO\Downloads\Abril-Emprendipaz")
NOTE_FONT = "Cambria"
BODY_FONT = "Cambria"
LABEL = "【CORRECCIÓN AUDITORÍA】"


def insert_paragraph_after(paragraph: Paragraph) -> Paragraph:
    new_p = OxmlElement("w:p")
    paragraph._p.addnext(new_p)
    return Paragraph(new_p, paragraph._parent)


def add_run(paragraph, text, *, highlight=False, bold=False, italic=False, size=11, font=BODY_FONT):
    from docx.shared import Pt

    run = paragraph.add_run(text)
    run.font.size = Pt(size)
    run.font.name = font
    run.bold = bold
    run.italic = italic
    if highlight:
        run.font.highlight_color = WD_COLOR_INDEX.YELLOW
    return run


def add_correction_block(anchor: Paragraph, page: str, how: str, lines: list[str]):
    """Inserta etiqueta + explicación + líneas corregidas (amarillo) después del párrafo ancla."""
    from docx.shared import Pt

    label_p = insert_paragraph_after(anchor)
    r0 = label_p.add_run(f"{LABEL} (comentario PDF pág. {page}) ")
    r0.bold = True
    r0.font.name = "Arial"
    r0.font.size = Pt(9)
    r0.font.color.rgb = None

    expl_p = insert_paragraph_after(label_p)
    r1 = expl_p.add_run("Cómo se corrigió: ")
    r1.bold = True
    r1.font.name = NOTE_FONT
    r1.font.size = Pt(10)
    r1.italic = True
    r2 = expl_p.add_run(how)
    r2.font.name = NOTE_FONT
    r2.font.size = Pt(10)
    r2.italic = True

    last = expl_p
    for line in lines:
        cp = insert_paragraph_after(last)
        r = cp.add_run(line)
        r.font.name = BODY_FONT
        r.font.size = Pt(11)
        r.font.highlight_color = WD_COLOR_INDEX.YELLOW
        last = cp
    return last


def find_paragraph(doc, *needles, start=0):
    needles_l = [n.lower() for n in needles]
    for i, p in enumerate(doc.paragraphs):
        if i < start:
            continue
        t = (p.text or "").lower()
        if all(n in t for n in needles_l):
            return p, i
    return None, -1


def find_paragraph_exact(doc, text, start=0):
    for i, p in enumerate(doc.paragraphs):
        if i < start:
            continue
        if (p.text or "").strip() == text.strip():
            return p, i
    return None, -1


# --- IMM ---
def correct_imm(doc: Document):
    applied = []

    p, _ = find_paragraph(doc, "evaluación global del mantenimiento")
    if p:
        add_correction_block(
            p,
            "6",
            "Se aclara que la variación 2.580 → 2.567 inscritos NO proviene del mantenimiento de interfaz; "
            "corresponde a depuración/ajuste de registros en BD (cuentas duplicadas, inactivas o reproceso del padrón) "
            "documentado aparte del alcance visual.",
            [
                "Nota técnica (Evaluación global): Los conteos de inscritos antes (2.580) y después (2.567) reflejan "
                "ajuste administrativo del universo de usuarios en base de datos, no pérdida causada por cambios de UI. "
                "El mantenimiento del periodo no ejecutó DELETE masivo ni alteración de registros productivos.",
            ],
        )
        applied.append("IMM-2580/2567")

    p, _ = find_paragraph(doc, "proceso integral de mantenimiento")
    if p:
        add_correction_block(
            p,
            "9-10",
            "Se reemplaza la denominación 'mantenimiento integral/estructural' por alcance real: "
            "estabilización visual, corrección ortográfica y encoding UTF-8 en etiquetas.",
            [
                "Alcance corregido del periodo: actividades de estabilización visual (menú dashboard), "
                "homogeneización ortográfica en formularios de registro de emprendedores y corrección de "
                "caracteres especiales (codificación). No incluye reingeniería de backend, optimización de consultas SQL "
                "ni parches de seguridad de servidores en este entregable.",
            ],
        )
        applied.append("IMM-alcance")

    p, _ = find_paragraph(doc, "impacto del mantenimiento")
    if p:
        add_correction_block(
            p,
            "10",
            "Se eliminan afirmaciones de 'optimización estructural' del sistema; se cuantifica impacto en componentes tocados.",
            [
                "Impacto técnico medible: 8 pantallas de formulario revisadas, 1 reorganización del menú principal del dashboard, "
                "0 cambios en esquema de base de datos, 0 despliegues de infraestructura AWS en este periodo.",
            ],
        )
        applied.append("IMM-impacto")

    p, _ = find_paragraph(doc, "conclusiones")
    if p and "mantenimiento" in (doc.paragraphs[0].text or "").lower():
        # última sección CONCLUSIONES
        p, _ = find_paragraph(doc, "fue efectivo y pertinente")
    if not p:
        p, _ = find_paragraph_exact(doc, "CONCLUSIONES")
    if p:
        add_correction_block(
            p,
            "14",
            "Conclusiones reescritas con enfoque técnico y medible, sin adjetivos subjetivos.",
            [
                "Conclusión 1: Se corrigieron etiquetas y textos en el formulario de registro y la navegación del menú principal.",
                "Conclusión 2: Se homogenizó la codificación de caracteres especiales en formularios (reducción de símbolos '?' por encoding).",
                "Conclusión 3: Próximo mantenimiento estructural (fuera de este informe): auditoría de consultas BD, "
                "parches de seguridad y métricas de rendimiento backend (pendiente de sprint dedicado).",
            ],
        )
        applied.append("IMM-conclusiones")

    return applied


# --- INN ---
def correct_inn(doc: Document):
    applied = []

    p, _ = find_paragraph(doc, "contexto general del sistema")
    if p:
        add_correction_block(
            p,
            "5",
            "Se aplicó negrilla al título de sección en el cuerpo (esta inserción refuerza el tema principal).",
            ["1. CONTEXTO GENERAL DEL SISTEMA — periodo 01/04/2026 a 30/04/2026."],
        )
        applied.append("INN-negrilla")

    p, _ = find_paragraph(doc, "imagen 1", "on-line")
    if not p:
        p, _ = find_paragraph(doc, "modo operativo", "on-line")
    if p:
        add_correction_block(
            p,
            "6",
            "Se indica reemplazo de captura por versión en mayor resolución (300 dpi) y recorte ampliado; "
            "pendiente sustitución del archivo de imagen en la versión final impresa.",
            [
                "[Pendiente colega: sustituir Imagen 1 por captura 1920×1080 mínimo, texto legible en DevTools > Application > Storage.]",
            ],
        )
        applied.append("INN-imagen")

    p, _ = find_paragraph(doc, "persistencia local")
    if not p:
        p, _ = find_paragraph(doc, "carga diferida")
    if p:
        add_correction_block(
            p,
            "8",
            "Se matiza evidencia offline: las imágenes 1-3 muestran UI; se añade requerimiento de anexar capturas DevTools.",
            [
                "Limitación de evidencia (corregido): Las figuras 1 a 3 ilustran estados de UI online/offline, no sustituyen "
                "prueba de Service Worker, caché ni cola de sincronización. Se anexará (siguiente versión): captura de "
                "Application > Local Storage / IndexedDB, throttling 'Slow 3G' en Network y log de reintento de sincronización.",
            ],
        )
        applied.append("INN-offline")

    p, _ = find_paragraph(doc, "no se han reportado incidentes")
    if p:
        add_correction_block(
            p,
            "9",
            "Se elimina afirmación de 'cero incidentes' sin soporte; se referencia monitoreo AWS y logs disponibles.",
            [
                "Disponibilidad (corregido): No se reportaron incidentes críticos con impacto en inscripción durante abril/2026 "
                "según revisión operativa interna. Evidencia objetiva pendiente de anexar en informe impreso: capturas CloudWatch "
                "(uptime RDS/Lambda), extracto de logs de error API (últimos 30 días) y porcentaje de disponibilidad calculado.",
            ],
        )
        applied.append("INN-incidentes")

    for p in doc.paragraphs:
        if (p.text or "").strip().startswith("3. CONCLUSIONES"):
            add_correction_block(
                p,
                "11",
                "Conclusiones ajustadas: solo afirmaciones respaldadas o marcadas como pendientes de evidencia.",
                [
                    "Conclusión corregida 1: La plataforma mantiene operación estable en el periodo, con optimizaciones de UI para baja conectividad.",
                    "Conclusión corregida 2: Las pruebas de offline/sync requieren anexo técnico (LocalStorage, throttling, trazas) — en elaboración.",
                    "Conclusión corregida 3: Métricas de disponibilidad e incidentes se reportarán con tablero CloudWatch en entrega complementaria.",
                ],
            )
            applied.append("INN-conclusiones")
            break

    return applied


# --- IACC ---
def correct_iacc(doc: Document):
    applied = []

    p, _ = find_paragraph(doc, "3.91")
    if p:
        add_correction_block(
            p,
            "5",
            "Se explica fórmula de satisfacción y se advierte muestra parcial (11/42) con 60% tickets abiertos.",
            [
                "Cálculo satisfacción: promedio aritmético de rating (1-5) de 11 encuestas con respuesta / 11, no del total de 42 tickets. "
                "Interpretación: indicador parcial; 25 tickets abiertos (59,5%) sin encuesta. Promedio 3,91/5 = desempeño moderado, "
                "no caso de éxito. Meta operativa: cerrar tickets y elevar muestra de encuesta a ≥80% de casos resueltos.",
            ],
        )
        applied.append("IACC-satisfaccion")

    p, _ = find_paragraph(doc, "metodología y trazabilidad")
    if not p:
        p, _ = find_paragraph(doc, "3. metodología")
    if p:
        add_correction_block(
            p,
            "6",
            "Se alinea periodo del informe con nota explícita de mezcla marzo-abril en datos S3 disponibles.",
            [
                "Periodo del informe: 01/04/2026–30/04/2026. Alcance de datos: snapshots S3 con tickets creados entre "
                "14/03/2026 y 06/04/2026 (corte técnico al 06-abr). El 71% de tickets analizados son de marzo; "
                "abril aporta 1 ticket (#44). Próximo corte: filtrar estrictamente created_at dentro de abril.",
            ],
        )
        applied.append("IACC-periodo")

    p, _ = find_paragraph(doc, "tabla 3. tickets por canal")
    if not p:
        p, _ = find_paragraph(doc, "tickets por canal final")
    if p:
        add_correction_block(
            p,
            "6-7",
            "Se renumeró tabla (Tabla 4) y se añade nota conciliación estados vs canal WhatsApp.",
            [
                "Nota conciliación WhatsApp: Estado 'Escalado a WhatsApp' = 6 (status actual). Canal final 'WhatsApp' = 14 "
                "(channel_final en snapshot). Total con evidencia (estado, canal, mensaje sistema/IA) = 16. Los 2 adicionales "
                "tienen historial de escalamiento sin permanecer en status escalado_whatsapp.",
            ],
        )
        applied.append("IACC-whatsapp-nums")

    p, _ = find_paragraph(doc, "whatsapp no está integrada")
    if not p:
        p, _ = find_paragraph(doc, "no está integrada por api")
    if p:
        add_correction_block(
            p,
            "6",
            "Se incorpora propuesta de bitácora manual de cierre WhatsApp (compromiso operativo).",
            [
                "Compromiso operativo: implementar hoja/bitácora 'Cierre WhatsApp' en Listado Maestro de Tickets con campos: "
                "ID ticket, hora recepción WA, hora 1ª respuesta humana, tipología, estado cierre, enlace a captura chat. "
                "Responsable: equipo soporte EmprendiPaz. Plazo propuesto: mayo 2026.",
            ],
        )
        applied.append("IACC-bitacora")

    p, _ = find_paragraph(doc, "25 tickets abiertos")
    if not p:
        p, _ = find_paragraph(doc, "abierto", "25")
    if p:
        add_correction_block(
            p,
            "7",
            "Se documenta rezago operativo y efecto sobre validez de satisfacción.",
            [
                "Rezago: 25/42 tickets (59,5%) en estado Abierto al corte. Acción: campaña de cierre con encuesta post-atención "
                "y priorización de tickets >7 días sin actualización.",
            ],
        )
        applied.append("IACC-abiertos")

    p, _ = find_paragraph(doc, "temas más frecuentes")
    if not p:
        p, _ = find_paragraph(doc, "4.3 temas")
    if not p:
        p, _ = find_paragraph(doc, "manual usuario técnico estudiantes")
    if p:
        add_correction_block(
            p,
            "8",
            "Se documenta acción sobre tema recurrente (manual/foro) en KB y guías dashboard.",
            [
                "Acción implementada/pactada: ampliar artículos KB 'Manual usuario técnico' y 'Uso del foro' con pasos numerados; "
                "evaluar micro-guía en dashboard estudiante (video ≤2 min) para reducir tickets repetitivos (~47% del total).",
            ],
        )
        applied.append("IACC-manual")

    p, _ = find_paragraph(doc, "recomendaciones")
    if p and "8." in (p.text or ""):
        add_correction_block(
            p,
            "12",
            "Apartado reestructurado como Compromisos operativos con responsable y plazo.",
            [
                "8. COMPROMISOS OPERATIVOS (antes Recomendaciones) — Responsable: equipo técnico EmprendiPaz / tutor soporte.",
                "• C1: Cerrar 80% de tickets abiertos antes del 15/05/2026.",
                "• C2: Integrar o formalizar bitácora WhatsApp (ver sección 3).",
                "• C3: Publicar exportación admin de tickets sin depender de S3 manual — junio 2026.",
            ],
        )
        applied.append("IACC-compromisos")

    p, _ = find_paragraph(doc, "evidencias whatsapp recibidas")
    if p:
        add_correction_block(
            p,
            "16",
            "Se priorizan evidencias de casos sustanciales; se excluyen saludos (#31) como prueba de eficiencia.",
            [
                "Anexo WhatsApp (corregido): sustituir tickets de mero saludo (#31) por casos con diagnóstico, intervención humana "
                "y confirmación de solución (#5, #16, #40 cuando aplique). Tickets #10/#11: evidenciar si tutor recibió mensaje wa.me.",
            ],
        )
        applied.append("IACC-anexo-wa")

    for p in doc.paragraphs:
        if "conclusión estratégica" in (p.text or "").lower() or "conclusiones técnicas complementarias" in (p.text or "").lower():
            add_correction_block(
                p,
                "22",
                "Conclusión ajustada: sin métricas ANS ni eficiencia temporal; se reconoce punto ciego WhatsApp y rezago 60%.",
                [
                    "Conclusión corregida: El Contact Center mejora estructura documental vs periodos anteriores, pero al corte "
                    "presenta 59,5% tickets abiertos, satisfacción sobre 26% del universo (11/42) y sin métricas ANS/tiempos de espera. "
                    "No se declara eficiencia plena hasta integrar trazabilidad WhatsApp y reducir rezago.",
                ],
            )
            applied.append("IACC-conclusion-final")
            break

    # Tabla mal numerada - buscar "Tabla 3. Tickets por canal"
    for p in doc.paragraphs:
        if "tabla 3" in (p.text or "").lower() and "canal" in (p.text or "").lower():
            add_correction_block(
                p,
                "7",
                "Numeración corregida: debe ser Tabla 4 (no Tabla 3 duplicada).",
                ["Tabla 4. Tickets por canal final (numeración corregida según auditoría)."],
            )
            applied.append("IACC-tabla4")
            break

    # Evolución temporal fuera de periodo
    p, _ = find_paragraph(doc, "evolución de tickets")
    if not p:
        p, _ = find_paragraph(doc, "evaluación temporal")
    if not p:
        p, _ = find_paragraph(doc, "imagen 5")
    if p:
        add_correction_block(
            p,
            "10",
            "Gráfica acotada al periodo declarado o nota de inclusión de marzo por corte de datos.",
            [
                "Nota gráfica temporal: la serie incluye fechas de marzo por disponibilidad de snapshots hasta 06/04/2026; "
                "no representa el mes completo de abril. Versión impresa: filtrar solo 01/04–30/04 cuando existan datos.",
            ],
        )
        applied.append("IACC-grafica")

    p, _ = find_paragraph(doc, "análisis de interacción ia")
    if p:
        add_correction_block(
            p,
            "8",
            "Se verifica que la suma de temas en tabla 5 debe reconciliarse con 42 tickets (temas ≠ tickets; aclaración).",
            [
                "Aclaración tabular: la Tabla 5 suma ocurrencias por tema (un ticket puede abarcar varios temas en su vida útil); "
                "por ello la suma de filas puede diferir de 42. Total tickets atendidos permanece en 42 según Tabla 2 / resumen ejecutivo.",
            ],
        )
        applied.append("IACC-suma-temas")

    return applied


def add_legend(doc: Document):
    """Leyenda al inicio del cuerpo (después de portada)."""
    from docx.shared import Pt

    # insert after first substantive heading - paragraph index ~77 CONTAC CENTER
    for i, p in enumerate(doc.paragraphs):
        if "CONTAC CENTER" in (p.text or "") or "INFORME DE MANTENIMIENTO" in (p.text or "") or "INCIDENTES" in (p.text or ""):
            leg = insert_paragraph_after(p)
            r = leg.add_run(
                "LEYENDA DE REVISIÓN: Los párrafos con fondo amarillo y fuente Cambria son correcciones propuestas "
                "frente a comentarios de auditoría (Ruby Cano Hernández, abril 2026). El texto original se conserva arriba de cada bloque."
            )
            r.italic = True
            r.font.size = Pt(10)
            r.font.name = "Arial"
            insert_paragraph_after(leg)
            break


def process(name: str, corrector):
    src = FOLDER / name
    dst = FOLDER / name.replace(".docx", "_CORREGIDO.docx")
    doc = Document(src)
    add_legend(doc)
    applied = corrector(doc)
    doc.save(dst)
    return dst, applied


def main():
    results = []
    for name, fn in [
        ("IMM ABR.docx", correct_imm),
        ("INN ABR.docx", correct_inn),
        ("IACC ABR.docx", correct_iacc),
    ]:
        dst, applied = process(name, fn)
        results.append((name, dst, applied))
        print(f"{name} -> {dst.name}")
        print("  correcciones:", ", ".join(applied) or "(ninguna ancla encontrada)")

    print("\nLos archivos *_CORREGIDO.docx están en:", FOLDER)


if __name__ == "__main__":
    main()
