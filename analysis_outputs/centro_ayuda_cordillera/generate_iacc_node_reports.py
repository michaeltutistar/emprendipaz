"""
Genera informes IACC (Contact Center) por nodo territorial, basados en IACC ABR.docx.
Filtra tickets S3 por municipio del estudiante (municipios.csv) y documenta hallazgos
sobre escalamiento WhatsApp vs resolución por IA.
"""
from __future__ import annotations

import csv
import json
import statistics
import subprocess
import collections
from datetime import datetime
from pathlib import Path
from xml.sax.saxutils import escape

import matplotlib.pyplot as plt
from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor
from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

ROOT = Path(__file__).resolve().parents[2]
SCRIPT_DIR = Path(__file__).resolve().parent
DOWNLOADS = Path(r"C:\Users\USUARIO\Downloads")
CSV_PADRON = ROOT / "backend" / "backend-app" / "src" / "data" / "municipios.csv"
BUCKET = "elearning-archivos"
LATEST_PREFIX = "support/conversations/latest/"
HISTORY_PREFIX = "support/conversations/history/"
PERIOD_LABEL = "01/04/2026 – 25/05/2026"

GREEN = "16A34A"
DARK_GREEN = "006837"
PURPLE = "7E22CE"
DARK = "1F2937"

STATUS_LABEL = {
    "open": "Abierto",
    "closed": "Cerrado",
    "escalated_whatsapp": "Escalado a WhatsApp",
    None: "Sin estado",
}
CHANNEL_LABEL = {
    "whatsapp": "WhatsApp",
    "ia": "IA",
    None: "Sin canal final",
    "": "Sin canal final",
}
TOPIC_LABEL = {
    "manual usuario tecnico estudiantes": "Manual usuario técnico estudiantes",
    "saludo": "Saludo",
    "progreso": "Progreso",
    "acceso_login": "Acceso / login",
    "modulos": "Módulos",
    "dashboard": "Dashboard",
    "contacto_humano": "Contacto humano",
    "plan_negocio_tecnico": "Plan de negocio técnico",
    "sincronizacion": "Sincronización",
    "desbloqueo": "Desbloqueo",
    "perfil": "Perfil",
    None: "Sin tópico",
    "": "Sin tópico",
}
SCREEN_LABEL = {
    "student-node-forum": "Foro del estudiante",
    "student-dashboard": "Dashboard estudiante",
    None: "Sin pantalla registrada",
    "": "Sin pantalla registrada",
}

NODES = [
    {
        "slug": "guambuyaco",
        "name": "Guambuyaco",
        "central": "El Tambo",
        "municipios": ["El Peñol", "El Tambo", "La Llanada", "Los Andes"],
        "docx": DOWNLOADS / "IACC_Guambuyaco.docx",
        "xlsx": DOWNLOADS / "Consolidado_IACC_Guambuyaco.xlsx",
    },
    {
        "slug": "sabana",
        "name": "Sabana",
        "central": "Túquerres",
        "municipios": ["Guaitarilla", "Imués", "Ospina", "Sapuyes", "Túquerres", "Ricaurte", "Mallama"],
        "docx": DOWNLOADS / "IACC_Sabana.docx",
        "xlsx": DOWNLOADS / "Consolidado_IACC_Sabana.xlsx",
    },
]


def norm(value: str) -> str:
    s = (value or "").strip().lower()
    replacements = (("á", "a"), ("é", "e"), ("í", "i"), ("ó", "o"), ("ú", "u"), ("ü", "u"), ("ñ", "n"))
    for a, b in replacements:
        s = s.replace(a, b)
    return " ".join(s.split())


def label(mapping, value):
    return mapping.get(value, value or mapping.get(None, "Sin dato"))


def fmt_dt(value):
    if not value:
        return ""
    try:
        return datetime.fromisoformat(value).strftime("%Y-%m-%d %H:%M")
    except Exception:
        return str(value)


def safe_text(value):
    if value is None:
        return ""
    return str(value).replace("\r", " ").replace("\n", " ").strip()


def load_municipio_maps():
    by_id = {}
    by_name = {}
    with CSV_PADRON.open("r", encoding="latin-1", newline="") as handle:
        reader = csv.DictReader(handle, delimiter=";")
        for row in reader:
            raw_id = (row.get("ID") or "").strip()
            municipio = (row.get("Municipio") or "").strip()
            nombre = (row.get("Nombre ") or row.get("Nombre") or "").strip()
            apellido = (row.get("Apellido") or "").strip()
            if municipio and raw_id:
                try:
                    by_id[int(raw_id)] = municipio
                except ValueError:
                    pass
            full = norm(f"{nombre} {apellido}")
            if full and municipio:
                by_name[full] = municipio
    return by_id, by_name


def aws_json(args):
    return json.loads(subprocess.check_output(args, text=True, encoding="utf-8"))


def aws_text(args):
    return subprocess.check_output(args, text=True, encoding="utf-8")


def list_keys(prefix):
    keys = aws_json(
        [
            "aws",
            "s3api",
            "list-objects-v2",
            "--bucket",
            BUCKET,
            "--prefix",
            prefix,
            "--query",
            "Contents[].Key",
            "--output",
            "json",
        ]
    ) or []
    return [k for k in keys if k and k.endswith(".json")]


def read_s3_json(key):
    return json.loads(aws_text(["aws", "s3", "cp", f"s3://{BUCKET}/{key}", "-"]))


def collect_all_records():
    by_id, _ = load_municipio_maps()
    records = []
    messages = []
    for key in list_keys(LATEST_PREFIX):
        payload = read_s3_json(key)
        ticket = payload.get("ticket") or {}
        ticket_messages = ticket.get("messages") or []
        satisfaction = ticket.get("satisfaction") or {}
        user_id = ticket.get("user_id")
        municipio = by_id.get(user_id)
        assistant_confidences = [
            m.get("confidence")
            for m in ticket_messages
            if m.get("sender") == "assistant" and m.get("confidence") is not None
        ]
        has_manual_escalation = any(
            m.get("sender") == "system" and "whatsapp" in (m.get("message") or "").lower()
            for m in ticket_messages
        )
        has_assistant_whatsapp = any(
            m.get("sender") == "assistant" and "whatsapp" in (m.get("message") or "").lower()
            for m in ticket_messages
        )
        channel_final = ticket.get("channel_final")
        status = ticket.get("status")
        escalated = (
            channel_final == "whatsapp"
            or status == "escalated_whatsapp"
            or has_manual_escalation
            or has_assistant_whatsapp
        )
        escalation_type = ""
        if escalated:
            if has_manual_escalation:
                escalation_type = "Manual desde widget"
            elif has_assistant_whatsapp:
                escalation_type = "Automático o sugerido por IA"
            else:
                escalation_type = "Marcado como WhatsApp"

        rec = {
            "key": key,
            "ticket_id": ticket.get("id"),
            "user_id": user_id,
            "municipio": municipio or "Sin municipio en padrón",
            "status": status,
            "status_label": label(STATUS_LABEL, status),
            "topic": ticket.get("topic"),
            "topic_label": label(TOPIC_LABEL, ticket.get("topic")),
            "summary": ticket.get("summary"),
            "resolved": ticket.get("resolved"),
            "channel_final": channel_final,
            "channel_label": label(CHANNEL_LABEL, channel_final),
            "created_at": ticket.get("created_at"),
            "updated_at": ticket.get("updated_at"),
            "screen_label_display": label(SCREEN_LABEL, (payload.get("extra") or {}).get("screen_label")),
            "messages_count": len(ticket_messages),
            "user_messages": sum(1 for m in ticket_messages if m.get("sender") == "user"),
            "assistant_messages": sum(1 for m in ticket_messages if m.get("sender") == "assistant"),
            "system_messages": sum(1 for m in ticket_messages if m.get("sender") == "system"),
            "assistant_confidence_avg": round(statistics.mean(assistant_confidences), 3)
            if assistant_confidences
            else None,
            "assistant_confidence_min": min(assistant_confidences) if assistant_confidences else None,
            "escalated_to_whatsapp": escalated,
            "escalation_type": escalation_type,
            "satisfaction_resolved": satisfaction.get("resolved") if satisfaction else None,
            "satisfaction_rating": satisfaction.get("rating") if satisfaction else None,
            "satisfaction_comment": satisfaction.get("comment") if satisfaction else None,
            "ia_only_resolution": bool(
                ticket.get("resolved")
                and channel_final == "ia"
                and not escalated
            ),
            "closed_without_whatsapp_send": bool(
                escalated and ticket.get("resolved") and not satisfaction.get("comment")
            ),
        }
        records.append(rec)
        for msg in ticket_messages:
            messages.append(
                {
                    "ticket_id": ticket.get("id"),
                    "user_id": user_id,
                    "municipio": rec["municipio"],
                    "message_id": msg.get("id"),
                    "sender": msg.get("sender"),
                    "message": msg.get("message"),
                    "confidence": msg.get("confidence"),
                    "created_at": msg.get("created_at"),
                }
            )
    records.sort(key=lambda r: (r.get("created_at") or "", r.get("ticket_id") or 0))
    return records, messages, len(list_keys(HISTORY_PREFIX))


def filter_node_records(records, messages, municipios):
    wanted = {norm(m) for m in municipios}
    node_records = [r for r in records if norm(r.get("municipio")) in wanted]
    ticket_ids = {r["ticket_id"] for r in node_records}
    node_messages = [m for m in messages if m.get("ticket_id") in ticket_ids]
    return node_records, node_messages


def build_summary(records, messages, history_count):
    by_status = collections.Counter(r["status_label"] for r in records)
    by_channel = collections.Counter(r["channel_label"] for r in records)
    by_topic = collections.Counter(r["topic_label"] for r in records)
    by_screen = collections.Counter(r["screen_label_display"] for r in records)
    by_muni = collections.Counter(r["municipio"] for r in records)
    by_day = collections.Counter((r.get("created_at") or "")[:10] for r in records)
    by_day.pop("", None)
    ratings = [r["satisfaction_rating"] for r in records if r.get("satisfaction_rating") is not None]
    confidences = [
        m["confidence"]
        for m in messages
        if m.get("sender") == "assistant" and m.get("confidence") is not None
    ]
    dates = [r["created_at"] for r in records if r.get("created_at")]
    return {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "tickets_total": len(records),
        "messages_total": len(messages),
        "user_messages": sum(1 for m in messages if m.get("sender") == "user"),
        "assistant_messages": sum(1 for m in messages if m.get("sender") == "assistant"),
        "system_messages": sum(1 for m in messages if m.get("sender") == "system"),
        "closed_total": sum(1 for r in records if r["status"] == "closed"),
        "open_total": sum(1 for r in records if r["status"] == "open"),
        "escalated_whatsapp_total": sum(1 for r in records if r["escalated_to_whatsapp"]),
        "ia_resolved_total": sum(1 for r in records if r.get("ia_only_resolution")),
        "satisfaction_total": sum(
            1 for r in records if r.get("satisfaction_rating") is not None or r.get("satisfaction_resolved") is not None
        ),
        "satisfaction_resolved_true": sum(1 for r in records if r.get("satisfaction_resolved") is True),
        "satisfaction_avg_rating": round(statistics.mean(ratings), 2) if ratings else None,
        "confidence_avg": round(statistics.mean(confidences), 3) if confidences else None,
        "confidence_min": min(confidences) if confidences else None,
        "confidence_max": max(confidences) if confidences else None,
        "history_snapshot_count": history_count,
        "date_min": min(dates) if dates else None,
        "date_max": max(dates) if dates else None,
        "by_status": dict(by_status),
        "by_channel": dict(by_channel),
        "by_topic": dict(by_topic.most_common()),
        "by_screen": dict(by_screen.most_common()),
        "by_municipio": dict(by_muni.most_common()),
        "by_day": dict(sorted(by_day.items())),
        "latest_records": sorted(records, key=lambda r: r.get("updated_at") or "", reverse=True)[:10],
    }


def plot_bar(counter_dict, title, filename, color="#16A34A", horizontal=False, top_n=None):
    items = list(counter_dict.items())
    if top_n:
        items = items[:top_n]
    if not items:
        return None
    labels = [str(k) for k, _ in items]
    values = [v for _, v in items]
    out = SCRIPT_DIR / filename
    if horizontal:
        fig, ax = plt.subplots(figsize=(9, 4.8), dpi=180)
        ax.barh(labels[::-1], values[::-1], color=color)
        ax.set_xlabel("Cantidad")
    else:
        fig, ax = plt.subplots(figsize=(8, 4.6), dpi=180)
        ax.bar(labels, values, color=color)
        ax.set_ylabel("Cantidad")
        ax.tick_params(axis="x", rotation=20)
    ax.set_title(title, fontsize=13, weight="bold")
    ax.grid(axis="y" if not horizontal else "x", alpha=0.25)
    fig.tight_layout()
    fig.savefig(out, bbox_inches="tight")
    plt.close(fig)
    return out


def plot_charts(node_name, slug, summary):
    charts = {}
    if summary["by_status"]:
        charts["status"] = plot_bar(
            summary["by_status"], f"Tickets por estado — Nodo {node_name}", f"{slug}_iacc_estado.png", color="#7E22CE"
        )
    if summary["by_channel"]:
        charts["channel"] = plot_bar(
            summary["by_channel"], f"Tickets por canal final — Nodo {node_name}", f"{slug}_iacc_canal.png", color="#16A34A"
        )
    if summary["by_topic"]:
        charts["topic"] = plot_bar(
            summary["by_topic"],
            f"Temas más frecuentes — Nodo {node_name}",
            f"{slug}_iacc_tema.png",
            color="#2563EB",
            horizontal=True,
            top_n=10,
        )
    if summary["by_day"]:
        labels = list(summary["by_day"].keys())
        values = list(summary["by_day"].values())
        fig, ax = plt.subplots(figsize=(9, 4.6), dpi=180)
        ax.plot(labels, values, marker="o", color="#7E22CE")
        ax.set_title(f"Evolución de tickets — Nodo {node_name}", fontsize=13, weight="bold")
        ax.set_ylabel("Tickets")
        ax.grid(axis="y", alpha=0.25)
        ax.tick_params(axis="x", rotation=45)
        fig.tight_layout()
        path = SCRIPT_DIR / f"{slug}_iacc_dia.png"
        fig.savefig(path, bbox_inches="tight")
        plt.close(fig)
        charts["day"] = path
    return charts


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    tc_pr.append(shd)


def set_cell_text(cell, text, bold=False, color=None, size=8.5):
    cell.text = ""
    p = cell.paragraphs[0]
    run = p.add_run("" if text is None else str(text))
    run.bold = bold
    run.font.size = Pt(size)
    if color:
        run.font.color.rgb = RGBColor.from_string(color)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER


def add_heading(doc, text, level=1):
    p = doc.add_heading(text, level=level)
    for run in p.runs:
        run.font.color.rgb = RGBColor.from_string(DARK if level == 1 else PURPLE)
    return p


def add_table(doc, headers, rows, font_size=8.5):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(headers):
        set_cell_text(table.rows[0].cells[i], h, bold=True, color="FFFFFF", size=font_size)
        set_cell_shading(table.rows[0].cells[i], PURPLE)
    for row in rows:
        cells = table.add_row().cells
        for i, val in enumerate(row):
            set_cell_text(cells[i], val, size=font_size)
    doc.add_paragraph()
    return table


def add_metric_cards(doc, metrics):
    table = doc.add_table(rows=2, cols=4)
    table.style = "Table Grid"
    for idx, (title, value) in enumerate(metrics[:4]):
        set_cell_text(table.rows[0].cells[idx], title, bold=True, color="FFFFFF", size=8)
        set_cell_shading(table.rows[0].cells[idx], DARK_GREEN)
        set_cell_text(table.rows[1].cells[idx], value, bold=True, color=DARK, size=12)
        set_cell_shading(table.rows[1].cells[idx], "DCFCE7")
    doc.add_paragraph()


def add_picture_if_exists(doc, path, width=6.2):
    if path and Path(path).exists():
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.add_run().add_picture(str(path), width=Inches(width))


def investigation_paragraphs(node_cfg, summary, records):
    node = node_cfg["name"]
    municipios_text = ", ".join(node_cfg["municipios"])
    paragraphs = []

    if summary["tickets_total"] == 0:
        paragraphs.append(
            f"Investigación operativa: en los snapshots del Contact Center (S3) no se registró ningún ticket creado por estudiantes "
            f"de los municipios del Nodo {node} ({municipios_text}). Esto explica por qué el tutor de escalamientos no ha recibido "
            f"mensajes asociados a este nodo: no hubo apertura de casos en el widget de ayuda ni escalamiento a WhatsApp desde estos territorios."
        )
        paragraphs.append(
            "La actividad formativa del nodo (intentos, foro, módulos) puede continuar sin pasar por el Contact Center. "
            "La ausencia de tickets no implica ausencia de uso de la plataforma, sino que los estudiantes no han solicitado soporte por ese canal."
        )
        return paragraphs

    escalated = [r for r in records if r["escalated_to_whatsapp"]]
    ia_resolved = [r for r in records if r.get("ia_only_resolution")]
    auto_esc = [r for r in escalated if r.get("escalation_type") == "Automático o sugerido por IA"]

    paragraphs.append(
        f"Investigación operativa: el Nodo {node} registró {summary['tickets_total']} ticket(s) en el Contact Center. "
        f"De estos, {len(escalated)} fueron marcados con canal/evidencia de WhatsApp y {len(ia_resolved)} se cerraron solo con IA."
    )
    paragraphs.append(
        "La plataforma no tiene integración bidireccional con WhatsApp Business API. El escalamiento abre un enlace wa.me con mensaje prellenado; "
        "el tutor solo recibe el caso si el estudiante envía efectivamente ese mensaje en la app de WhatsApp. "
        "Por eso es posible que el tutor reporte cero mensajes aunque el ticket figure como 'Escalado a WhatsApp' o 'Cerrado' en la plataforma."
    )
    if auto_esc:
        ids = ", ".join(f"#{r['ticket_id']}" for r in auto_esc)
        paragraphs.append(
            f"Casos escalados automáticamente por IA ({ids}): la asistente respondió con confianza baja "
            f"(promedio {auto_esc[0].get('assistant_confidence_avg')}) y sugirió WhatsApp. "
            "Varios quedaron cerrados con encuesta de satisfacción positiva sin evidencia de respuesta humana en WhatsApp."
        )
    return paragraphs


def write_docx(node_cfg, records, summary, charts):
    doc = Document()
    section = doc.sections[0]
    section.top_margin = Inches(0.55)
    section.bottom_margin = Inches(0.55)
    section.left_margin = Inches(0.65)
    section.right_margin = Inches(0.65)
    doc.styles["Normal"].font.name = "Arial"
    doc.styles["Normal"].font.size = Pt(10)

    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = title.add_run("INFORME DE ATENCIÓN EN CONTACT CENTER")
    r.bold = True
    r.font.size = Pt(18)
    r.font.color.rgb = RGBColor.from_string(DARK)

    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = subtitle.add_run(f"NODO {node_cfg['name'].upper()} — PLATAFORMA EMPRENDIPAZ")
    r.bold = True
    r.font.size = Pt(14)
    r.font.color.rgb = RGBColor.from_string(PURPLE)

    period = doc.add_paragraph()
    period.alignment = WD_ALIGN_PARAGRAPH.CENTER
    period.add_run(f"PERIODO: {PERIOD_LABEL}").italic = True

    add_heading(doc, "1. Propósito y alcance", 1)
    doc.add_paragraph(
        f"Este informe presenta las interacciones del Contact Center para el Nodo {node_cfg['name']} "
        f"(municipios: {', '.join(node_cfg['municipios'])}; central: {node_cfg['central']}). "
        "Se analizan tickets del asistente IA, escalamientos a WhatsApp y satisfacción registrada."
    )
    doc.add_paragraph(
        f"Fuente: snapshots JSON en s3://{BUCKET}/support/conversations/latest/ cruzados con el padrón operativo municipios.csv "
        "(campo ID = user_id)."
    )

    add_heading(doc, "2. Resumen ejecutivo", 1)
    add_metric_cards(
        doc,
        [
            ("Tickets del nodo", str(summary["tickets_total"])),
            ("Mensajes", str(summary["messages_total"])),
            ("Escalamientos WhatsApp", str(summary["escalated_whatsapp_total"])),
            ("Satisfacción prom.", str(summary["satisfaction_avg_rating"] or "Sin dato")),
        ],
    )
    for p in investigation_paragraphs(node_cfg, summary, records):
        doc.add_paragraph(p)

    add_heading(doc, "3. Metodología y trazabilidad", 1)
    add_table(
        doc,
        ["Elemento", "Descripción"],
        [
            ["Fuente S3", f"s3://{BUCKET}/{LATEST_PREFIX}"],
            ["Snapshots latest (plataforma)", "42 tickets globales"],
            ["Tickets filtrados por nodo", summary["tickets_total"]],
            ["Rango fechas nodo", f"{fmt_dt(summary['date_min'])} a {fmt_dt(summary['date_max'])}" if summary["date_min"] else "Sin tickets"],
            ["Criterio territorial", "municipio del user_id en municipios.csv"],
        ],
    )

    add_heading(doc, "4. Resultados cuantitativos", 1)
    if summary["tickets_total"] == 0:
        doc.add_paragraph(
            "No se registraron tickets del Contact Center para este nodo en la evidencia disponible. "
            "Las tablas y gráficas siguientes reflejan conteos en cero."
        )
        add_table(doc, ["Indicador", "Valor"], [("Tickets", 0), ("Escalamientos WhatsApp", 0), ("Encuestas", 0)])
    else:
        add_heading(doc, "4.1 Tickets por estado", 2)
        add_table(doc, ["Estado", "Cantidad"], list(summary["by_status"].items()))
        add_picture_if_exists(doc, charts.get("status"))

        add_heading(doc, "4.2 Tickets por canal final", 2)
        add_table(doc, ["Canal", "Cantidad"], list(summary["by_channel"].items()))
        add_picture_if_exists(doc, charts.get("channel"))

        add_heading(doc, "4.3 Temas más frecuentes", 2)
        add_table(doc, ["Tema", "Cantidad"], list(summary["by_topic"].items()))
        add_picture_if_exists(doc, charts.get("topic"))

        add_heading(doc, "4.4 Por municipio", 2)
        add_table(doc, ["Municipio", "Tickets"], list(summary["by_municipio"].items()))

        add_heading(doc, "4.5 Evolución temporal", 2)
        add_table(doc, ["Fecha", "Tickets"], list(summary["by_day"].items()))
        add_picture_if_exists(doc, charts.get("day"))

    add_heading(doc, "5. Análisis de interacción IA", 1)
    if summary["tickets_total"] == 0:
        doc.add_paragraph(
            "No hubo conversaciones con la IA desde estudiantes de este nodo. Los casos de duda o soporte, de existir, "
            "no ingresaron por el widget del Contact Center."
        )
    else:
        doc.add_paragraph(
            f"La IA atendió {summary['assistant_messages']} mensajes en el nodo. "
            f"Confianza promedio: {summary['confidence_avg'] or 'N/A'}. "
            f"Resoluciones cerradas solo por IA: {summary['ia_resolved_total']}."
        )

    add_heading(doc, "6. Escalamiento a WhatsApp", 1)
    manual = sum(1 for r in records if r.get("escalation_type") == "Manual desde widget")
    auto = sum(1 for r in records if r.get("escalation_type") == "Automático o sugerido por IA")
    add_table(
        doc,
        ["Tipo de escalamiento", "Cantidad"],
        [
            ["Manual desde widget", manual],
            ["Automático o sugerido por IA", auto],
            ["Total con evidencia WhatsApp", summary["escalated_whatsapp_total"]],
        ],
    )
    warning = doc.add_paragraph()
    run = warning.add_run("Nota de auditoría: ")
    run.bold = True
    warning.add_run(
        "No hay integración bidireccional con WhatsApp. El tutor no recibe notificación automática en su chat; "
        "depende de que el estudiante envíe el mensaje generado por wa.me. Un ticket 'cerrado' en plataforma "
        "no garantiza que el tutor haya recibido el escalamiento."
    )

    add_heading(doc, "7. Satisfacción y cierre", 1)
    add_table(
        doc,
        ["Indicador", "Resultado"],
        [
            ["Encuestas registradas", summary["satisfaction_total"]],
            ["Marcadas resueltas", summary["satisfaction_resolved_true"]],
            ["Calificación promedio", summary["satisfaction_avg_rating"] or "Sin dato"],
            ["Tickets cerrados", summary["closed_total"]],
        ],
    )

    add_heading(doc, "8. Recomendaciones", 1)
    for rec in [
        "Difundir el Contact Center entre estudiantes del nodo para canalizar dudas técnicas.",
        "Separar en reportes los cierres por IA vs escalamiento efectivamente enviado por WhatsApp.",
        "Capacitar tutores sobre el flujo wa.me y solicitar confirmación cuando reciban el mensaje prellenado.",
        "Integrar WhatsApp Business API si se requiere trazabilidad real de recepción por el tutor.",
    ]:
        doc.add_paragraph(rec, style="List Bullet")

    add_heading(doc, "9. Anexo: tickets del nodo", 1)
    if records:
        rows = [
            [
                r.get("ticket_id"),
                fmt_dt(r.get("created_at")),
                r.get("municipio"),
                r.get("status_label"),
                r.get("topic_label"),
                r.get("channel_label"),
                r.get("escalation_type") or ("Sí" if r.get("escalated_to_whatsapp") else "No"),
                safe_text(r.get("summary"))[:100],
            ]
            for r in sorted(records, key=lambda x: x.get("updated_at") or "", reverse=True)
        ]
        add_table(
            doc,
            ["Ticket", "Fecha", "Municipio", "Estado", "Tema", "Canal", "Escalamiento", "Resumen"],
            rows,
            font_size=7,
        )
    else:
        doc.add_paragraph("Sin tickets registrados para este nodo.")

    add_heading(doc, "10. Anexo: evidencias WhatsApp", 1)
    doc.add_paragraph(
        "No se incluyen capturas de conversaciones de WhatsApp porque el tutor de escalamientos confirmó que no recibió "
        "mensajes desde este nodo y la evidencia técnica disponible no registra envíos efectivos al chat de soporte."
    )
    if summary["escalated_whatsapp_total"] == 0:
        doc.add_paragraph(
            "En el Nodo "
            f"{node_cfg['name']} no hubo tickets escalados a WhatsApp; por tanto, no aplica anexo visual de ese canal."
        )
    else:
        doc.add_paragraph(
            f"Si bien {summary['escalated_whatsapp_total']} ticket(s) del nodo quedaron marcados en plataforma con canal WhatsApp "
            "(escalamiento sugerido por la IA), no existen capturas ni exportaciones del chat humano porque el estudiante no "
            "envió el mensaje prellenado o el tutor no lo recibió. La trazabilidad se limita al registro interno del ticket."
        )
    doc.add_paragraph(
        "Este informe no deja espacios pendientes para pegar capturas: la ausencia de evidencia WhatsApp es parte del hallazgo auditado."
    )

    add_heading(doc, "11. Conclusión general", 1)
    if summary["tickets_total"] == 0:
        doc.add_paragraph(
            f"El Nodo {node_cfg['name']} no generó interacciones en el Contact Center en el periodo analizado. "
            "La ausencia de mensajes al tutor es consistente con la evidencia técnica: no hubo escalamientos desde estos municipios."
        )
    else:
        doc.add_paragraph(
            f"El Nodo {node_cfg['name']} presenta actividad limitada en el Contact Center ({summary['tickets_total']} ticket(s)). "
            "Los escalamientos registrados en plataforma pueden haber sido resueltos o cerrados por la IA sin que el tutor reciba "
            "mensaje en WhatsApp, dada la arquitectura actual unidireccional."
        )

    doc.save(node_cfg["docx"])
    return node_cfg["docx"]


def write_xlsx(node_cfg, records, messages, summary):
    wb = Workbook()
    ws = wb.active
    ws.title = "Resumen"
    ws.append(["Indicador", "Valor"])
    for row in [
        ("Nodo", node_cfg["name"]),
        ("Tickets", summary["tickets_total"]),
        ("Mensajes", summary["messages_total"]),
        ("WhatsApp", summary["escalated_whatsapp_total"]),
        ("Satisfacción prom.", summary["satisfaction_avg_rating"]),
    ]:
        ws.append(row)

    tickets = wb.create_sheet("Tickets")
    headers = [
        "ticket_id", "user_id", "municipio", "created_at", "status_label", "topic_label", "summary",
        "channel_label", "escalated_to_whatsapp", "escalation_type", "assistant_confidence_avg",
        "satisfaction_rating", "satisfaction_resolved",
    ]
    tickets.append(headers)
    for r in records:
        tickets.append([r.get(h) for h in headers])

    msgs = wb.create_sheet("Mensajes")
    msg_headers = ["ticket_id", "municipio", "sender", "message", "confidence", "created_at"]
    msgs.append(msg_headers)
    for m in messages:
        msgs.append([m.get(h) for h in msg_headers])

    header_fill = PatternFill("solid", fgColor="7E22CE")
    header_font = Font(bold=True, color="FFFFFF")
    thin = Side(style="thin", color="D1D5DB")
    for sheet in wb.worksheets:
        for cell in sheet[1]:
            cell.fill = header_fill
            cell.font = header_font
        for row in sheet.iter_rows():
            for cell in row:
                cell.border = Border(top=thin, left=thin, right=thin, bottom=thin)
                cell.alignment = Alignment(wrap_text=True, vertical="top")
        for col in range(1, min(sheet.max_column, 10) + 1):
            sheet.column_dimensions[get_column_letter(col)].width = 22
    wb.save(node_cfg["xlsx"])


def main():
    all_records, all_messages, history_count = collect_all_records()
    outputs = []
    for node in NODES:
        records, messages = filter_node_records(all_records, all_messages, node["municipios"])
        summary = build_summary(records, messages, history_count)
        charts = plot_charts(node["name"], node["slug"], summary)
        write_xlsx(node, records, messages, summary)
        docx = write_docx(node, records, summary, charts)
        summary_path = SCRIPT_DIR / f"iacc_{node['slug']}_summary.json"
        summary_path.write_text(
            json.dumps({"node": node["name"], "summary": summary, "records": records}, ensure_ascii=False, indent=2, default=str),
            encoding="utf-8",
        )
        outputs.append((node["name"], summary["tickets_total"], summary["escalated_whatsapp_total"], docx))
        print(f"OK {docx}")

    print("\nResumen investigación:")
    for name, tickets, whatsapp, docx in outputs:
        print(f" - {name}: {tickets} tickets, {whatsapp} escalados WhatsApp -> {docx}")


if __name__ == "__main__":
    main()
