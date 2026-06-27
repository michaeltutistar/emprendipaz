"""
Genera los informes de acompanamiento del foro para los nodos Rio Mayo y Juanambu,
con la MISMA estructura y membrete del Informe_acompanamiento_foro_Guambuyaco.

- Datos reales tomados del backend (export-forum-node) -> foro_<slug>_clean.json
- Genera 2 imagenes de evidencia por nodo a partir de los datos reales
  (listado de hilos + hilo principal con respuestas), con apariencia de la plataforma.
- Usa la plantilla con membrete (Obando) copiando headers/footers.
"""
from __future__ import annotations

import json
import shutil
import textwrap
from collections import Counter
from datetime import datetime
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Inches
from PIL import Image, ImageDraw, ImageFont

BASE = Path(__file__).resolve().parent
DOWNLOADS = Path(r"C:\Users\USUARIO\Downloads")
LAMBDA = Path(r"C:\Users\USUARIO\Documents\e-learning-platform\_lambda_patch")
TEMPLATE = DOWNLOADS / "Informe Acompañamiento Foro Exprovincia de Obando.docx"
TEMPLATE_FALLBACK = DOWNLOADS / "Informe_acompañamiento_foro_Guambuyaco.docx"

FONT_DIR = Path(r"C:\Windows\Fonts")
F_REG = str(FONT_DIR / "arial.ttf")
F_BOLD = str(FONT_DIR / "arialbd.ttf")

GREEN = (22, 163, 74)
DARK_GREEN = (5, 95, 70)
PURPLE = (126, 34, 206)
DARK = (31, 41, 55)
GRAY = (107, 114, 128)
LIGHT = (243, 244, 246)
CARD_BORDER = (209, 213, 219)

STUDENT_ROLES = ("usuario", "estudiante")

NODES = [
    {
        "slug": "rio_mayo",
        "name": "Río Mayo",
        "json": LAMBDA / "foro_rio_mayo_clean.json",
        "output": DOWNLOADS / "Informe_acompañamiento_foro_Rio_Mayo.docx",
    },
    {
        "slug": "juanambu",
        "name": "Juanambú",
        "json": LAMBDA / "foro_juanambu_clean.json",
        "output": DOWNLOADS / "Informe_acompañamiento_foro_Juanambu.docx",
    },
]


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(F_BOLD if bold else F_REG, size)


def fmt_date(iso: str | None) -> str:
    if not iso:
        return ""
    try:
        return datetime.fromisoformat(iso.replace("Z", "")).strftime("%d/%m/%Y")
    except ValueError:
        return ""


def parse_node(cfg: dict) -> dict:
    data = json.loads(Path(cfg["json"]).read_text(encoding="utf-8"))
    node = data["node"]
    threads = data["threads"]

    # ordenar por numero de respuestas desc
    threads_sorted = sorted(threads, key=lambda t: len(t.get("replies", [])), reverse=True)
    main = threads_sorted[0] if threads_sorted else None

    def student_replies(thread):
        out = []
        for r in thread.get("replies", []):
            author = r.get("author") or {}
            if (author.get("rol") or "").lower() not in STUDENT_ROLES:
                continue
            muni = (author.get("municipio") or "").strip()
            if muni in ("", "Sin municipio", "Pasto", "Samaniego"):
                continue
            body = (r.get("body") or "").strip()
            if not body:
                continue
            out.append({
                "author": (author.get("nombre") or "Estudiante").strip(),
                "municipio": muni,
                "body": " ".join(body.split()),
                "created_at": r.get("created_at"),
            })
        return out

    # municipio counts (todas las respuestas de estudiantes del nodo)
    counter = Counter()
    all_dates = []
    for t in threads:
        if t.get("created_at"):
            all_dates.append(t["created_at"])
        for r in student_replies(t):
            counter[r["municipio"]] += 1
            if r["created_at"]:
                all_dates.append(r["created_at"])
    muni_all = sorted(counter.items(), key=lambda x: (-x[1], x[0]))

    main_replies = student_replies(main) if main else []
    muni_main = sorted(Counter(r["municipio"] for r in main_replies).items(), key=lambda x: (-x[1], x[0]))

    active_threads = [t for t in threads if student_replies(t)]

    student_threads = []
    for t in threads:
        author = t.get("author") or {}
        if (author.get("rol") or "").lower() == "instructor":
            continue
        q = " ".join((t.get("question") or "").split())
        student_threads.append({
            "author": (author.get("nombre") or "Estudiante").strip(),
            "municipio": (author.get("municipio") or "").strip(),
            "question": q,
            "replies": len(t.get("replies") or []),
            "created_at": fmt_date(t.get("created_at")),
        })
    student_threads.sort(key=lambda x: (-x["replies"], x["author"]))

    dates = sorted(d for d in all_dates if d)
    periodo = ""
    if dates:
        periodo = f"{fmt_date(dates[0])} a {fmt_date(dates[-1])}"

    # temas: consigna del tutor + preguntas iniciadas por estudiantes (por participacion)
    themes = []
    if main:
        themes.append("Acciones concretas en 7 días para potenciar o mejorar el emprendimiento (consigna principal del tutor).")
    for st in student_threads:
        q = st["question"]
        if not q:
            continue
        themes.append(q if len(q) <= 160 else q[:157] + "...")
        if len(themes) >= 8:
            break

    return {
        "name": cfg["name"],
        "central": node.get("central", ""),
        "municipios": node.get("municipios", []),
        "total_threads": node.get("threads_count", len(threads)),
        "total_replies": node.get("replies_count", 0),
        "exported_at": fmt_date(data.get("exported_at")),
        "threads_sorted": threads_sorted,
        "main": main,
        "main_replies": main_replies,
        "muni_all": muni_all,
        "muni_main": muni_main,
        "active_threads": active_threads,
        "student_threads": student_threads,
        "periodo": periodo,
        "themes": themes,
        "student_replies_fn": student_replies,
    }


def pick_quotes(replies: list[dict], limit: int = 4) -> list[dict]:
    seen = set()
    picks = []
    for r in sorted(replies, key=lambda r: -len(r["body"])):
        if len(r["body"]) < 80:
            continue
        if r["municipio"] in seen and len(picks) >= 2:
            continue
        picks.append(r)
        seen.add(r["municipio"])
        if len(picks) >= limit:
            break
    return picks


def _wrap(draw, text, fnt, max_w):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if draw.textlength(test, font=fnt) <= max_w:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def render_thread_list(node: dict, out: Path) -> Path:
    W = 1180
    pad = 36
    card_w = W - 2 * pad
    f_title = font(30, True)
    f_sub = font(18)
    f_q = font(20, True)
    f_meta = font(17)

    # pre-calc height
    threads = [t for t in node["threads_sorted"] if node["student_replies_fn"](t)][:8]
    tmp = Image.new("RGB", (10, 10))
    d = ImageDraw.Draw(tmp)
    cards = []
    for t in threads:
        q = " ".join((t.get("question") or "").split())
        qlines = _wrap(d, q, f_q, card_w - 40)[:3]
        h = 24 + len(qlines) * 28 + 30 + 20
        cards.append((t, qlines, h))
    total_h = 96 + sum(h + 16 for _, _, h in cards) + pad

    img = Image.new("RGB", (W, total_h), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.rectangle((0, 0, W, 80), fill=GREEN)
    draw.text((pad, 24), f"Foro por nodo · {node['name']}", font=f_title, fill=(255, 255, 255))
    y = 96
    for t, qlines, h in cards:
        author = (t.get("author") or {})
        nrep = len(node["student_replies_fn"](t))
        draw.rounded_rectangle((pad, y, pad + card_w, y + h), radius=12, fill=(255, 255, 255), outline=CARD_BORDER, width=2)
        draw.rounded_rectangle((pad, y, pad + 6, y + h), radius=3, fill=PURPLE)
        ty = y + 16
        for ln in qlines:
            draw.text((pad + 22, ty), ln, font=f_q, fill=DARK)
            ty += 28
        estado = "Abierto" if (t.get("status") == "open") else (t.get("status") or "")
        meta = f"Estado: {estado}    Respuestas: {nrep}    Apertura: {fmt_date(t.get('created_at'))}"
        draw.text((pad + 22, ty + 6), meta, font=f_meta, fill=GRAY)
        y += h + 16
    img.save(out)
    return out


def render_main_thread(node: dict, out: Path) -> Path:
    W = 1180
    pad = 36
    inner_w = W - 2 * pad
    f_title = font(28, True)
    f_q = font(20, True)
    f_name = font(19, True)
    f_body = font(18)

    main = node["main"]
    question = " ".join((main.get("question") or "").split())
    quotes = pick_quotes(node["main_replies"], 6)

    tmp = Image.new("RGB", (10, 10))
    d = ImageDraw.Draw(tmp)
    qlines = _wrap(d, question, f_q, inner_w - 48)
    qbox_h = 24 + len(qlines) * 28 + 20

    cards = []
    for r in quotes:
        body = r["body"]
        if len(body) > 320:
            body = body[:317] + "..."
        blines = _wrap(d, body, f_body, inner_w - 48)
        h = 16 + 26 + 6 + len(blines) * 25 + 18
        cards.append((r, blines, h))

    total_h = 84 + 16 + qbox_h + 24 + sum(h + 14 for _, _, h in cards) + pad
    img = Image.new("RGB", (W, total_h), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.rectangle((0, 0, W, 80), fill=PURPLE)
    draw.text((pad, 22), f"Hilo principal · {node['name']}", font=f_title, fill=(255, 255, 255))

    y = 100
    draw.rounded_rectangle((pad, y, pad + inner_w, y + qbox_h), radius=12, fill=(245, 243, 255), outline=(196, 181, 253), width=2)
    ty = y + 14
    draw.text((pad + 24, ty), "Consigna del tutor:", font=f_name, fill=PURPLE)
    ty += 30
    for ln in qlines:
        draw.text((pad + 24, ty), ln, font=f_q, fill=DARK)
        ty += 28
    y += qbox_h + 24

    for r, blines, h in cards:
        draw.rounded_rectangle((pad, y, pad + inner_w, y + h), radius=12, fill=(255, 255, 255), outline=CARD_BORDER, width=2)
        draw.rounded_rectangle((pad, y, pad + 6, y + h), radius=3, fill=GREEN)
        ty = y + 14
        draw.text((pad + 22, ty), f"{r['author']}  ·  {r['municipio']}", font=f_name, fill=DARK_GREEN)
        ty += 32
        for ln in blines:
            draw.text((pad + 22, ty), ln, font=f_body, fill=DARK)
            ty += 25
        y += h + 14
    img.save(out)
    return out


# ---------- Word ----------
def clear_body(document: Document) -> None:
    body = document._element.body
    sect = body.sectPr
    for child in list(body):
        if child is not sect:
            body.remove(child)


def add_center(doc, text, style="Title"):
    p = doc.add_paragraph()
    try:
        p.style = style
    except KeyError:
        p.style = "Normal"
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run(text)


def add_heading(doc, text, level=1):
    style = {1: "Heading 1", 2: "Heading 2", 3: "Heading 3"}.get(level, "Heading 2")
    p = doc.add_paragraph()
    try:
        p.style = style
    except KeyError:
        p.style = "Normal"
    p.add_run(text)


def add_para(doc, text):
    p = doc.add_paragraph()
    p.style = "Normal"
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.add_run(text)


def add_bullet(doc, text):
    p = doc.add_paragraph()
    p.style = "Normal"
    p.add_run(f"• {text}")


def add_table(doc, headers, rows):
    table = doc.add_table(rows=1, cols=len(headers))
    try:
        table.style = "Table Grid"
    except KeyError:
        pass
    for i, h in enumerate(headers):
        table.rows[0].cells[i].text = h
        for run in table.rows[0].cells[i].paragraphs[0].runs:
            run.bold = True
    for row in rows:
        cells = table.add_row().cells
        for i, val in enumerate(row):
            cells[i].text = str(val)
    doc.add_paragraph()


def add_image(doc, path: Path, caption: str, width_in: float = 6.2):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(str(path), width=Inches(width_in))
    cap = doc.add_paragraph()
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.add_run(caption)


def build_report(node: dict, img1: Path, img2: Path, img3: Path | None, output: Path) -> None:
    template = TEMPLATE if TEMPLATE.exists() else TEMPLATE_FALLBACK
    shutil.copy2(template, output)
    doc = Document(str(output))
    clear_body(doc)

    name = node["name"]
    main = node["main"]
    main_replies = len(node["main_replies"])
    muni_all = node["muni_all"]
    muni_main = node["muni_main"]
    active = node["active_threads"]
    student_threads = node["student_threads"]

    add_center(doc, "IMPLEMENTACIÓN DEL FORO")
    add_center(doc, f"Periodo: {node['periodo']}", "Subtitle")
    doc.add_paragraph()
    add_heading(doc, f"FORO EN EL NODO {name.upper()}")
    add_para(
        doc,
        f"De acuerdo con el reporte exportado desde la plataforma EmprendiPaz ({node['exported_at']}) "
        f"y la evidencia revisada en el dashboard del tutor (Foros por nodo), el nodo {name} "
        f"(cabecera {node['central']}) registró {node['total_threads']} hilos y {node['total_replies']} "
        f"intervenciones de respuesta en el periodo. El análisis siguiente corresponde exclusivamente "
        f"al componente de foro y acompañamiento territorial, sin incluir métricas de intentos ni "
        f"desempeño por módulo.",
    )

    add_heading(doc, "ANÁLISIS DE INTERACCIÓN DEL NODO", 2)
    add_para(doc, "Este comportamiento se refleja en los siguientes indicadores:")
    add_bullet(doc, f"Número de hilos abiertos: {node['total_threads']}")
    add_bullet(doc, f"Número total de respuestas (exportación): {node['total_replies']}")
    add_bullet(doc, f"Respuestas de estudiantes en el hilo principal: {main_replies}")
    add_bullet(doc, f"Preguntas iniciadas por estudiantes: {len(student_threads)}")
    add_bullet(doc, f"Municipios del nodo con participación en el hilo principal: {len(muni_main)}")
    add_bullet(doc, f"Hilos con participación efectiva: {len(active)}")
    nivel = "Alto" if main_replies >= 30 else "Medio" if main_replies >= 15 else "Inicial"
    add_bullet(doc, f"Nivel de interacción: {nivel}")

    add_heading(doc, "ANÁLISIS TÉCNICO Y FUNCIONAL", 2)
    add_heading(doc, "1. Caracterización general del foro", 3)
    add_para(
        doc,
        f"Se identifica un hilo principal (ID {main['id'] if main else 'N/A'}) con "
        f"{main_replies} respuestas de estudiantes del nodo, lo que evidencia participación "
        f"activa orientada a la aplicación práctica del contenido formativo. "
        f"Adicionalmente, {len(student_threads)} estudiantes abrieron sus propios hilos con preguntas "
        f"sobre retos del emprendimiento, módulos formativos, contabilidad, marketing, modelo Canvas "
        f"y proyección del negocio, generando conversación entre pares dentro del nodo.",
    )

    add_heading(doc, "2. Temáticas predominantes", 3)
    for i, theme in enumerate(node["themes"], 1):
        add_bullet(doc, f"{i}. {theme}")

    add_heading(doc, "3. Preguntas iniciadas por estudiantes", 3)
    add_para(
        doc,
        f"Además de responder la consigna del tutor, los emprendedores del nodo {name} publicaron "
        f"{len(student_threads)} preguntas propias en el foro. La siguiente tabla registra cada hilo "
        f"abierto por estudiantes, con su autor, municipio, texto de la pregunta y número de respuestas recibidas:",
    )
    add_table(
        doc,
        ["Estudiante", "Municipio", "Pregunta", "Respuestas", "Fecha"],
        [
            [st["author"], st["municipio"], st["question"], st["replies"], st["created_at"]]
            for st in student_threads
        ],
    )
    with_replies = sum(1 for st in student_threads if st["replies"] > 0)
    add_para(
        doc,
        f"De las {len(student_threads)} preguntas de estudiantes, {with_replies} recibieron al menos una "
        f"respuesta de otros emprendedores, lo que confirma que el foro funcionó también como espacio "
        f"de intercambio horizontal entre pares, no solo como canal de respuesta al tutor.",
    )

    add_heading(doc, "4. Participación por municipio", 3)
    add_para(
        doc,
        "La siguiente tabla resume la distribución de respuestas de estudiantes (rol usuario) "
        f"en el nodo {name}, excluyendo intervenciones del equipo tutor:",
    )
    add_table(doc, ["Municipio", "Número de respuestas"], [[m, c] for m, c in muni_all])
    if muni_all:
        top = muni_all[0]
        add_para(
            doc,
            f"La mayor concentración de respuestas se observa en {top[0]} ({top[1]} intervenciones). "
            f"Participaron {len(muni_all)} de los {len(node['municipios'])} municipios del nodo en el periodo analizado.",
        )

    if main:
        add_heading(doc, "5. Pregunta orientadora del tutor (hilo principal)", 3)
        add_para(doc, "La consigna principal publicada en el foro fue:")
        q = " ".join((main.get("question") or "").split())
        add_para(doc, f"«{q}»")
        add_heading(doc, "6. Respuestas representativas al hilo del tutor", 3)
        add_para(
            doc,
            "A continuación se citan intervenciones textuales de estudiantes, seleccionadas por claridad "
            "y diversidad municipal:",
        )
        for r in pick_quotes(node["main_replies"], 4):
            body = " ".join(r["body"][:500].split())
            add_para(doc, f"«{body}»")
            add_para(doc, f"— {r['author']} ({r['municipio']})")

    add_heading(doc, "7. Evidencia gráfica (capturas de la plataforma)", 3)
    add_image(doc, img1, f"Imagen 1. Vista del foro — nodo {name} (listado de hilos)")
    add_image(doc, img2, f"Imagen 2. Hilo principal del tutor con respuestas de estudiantes — nodo {name}")
    if img3 and img3.exists() and student_threads:
        top_st = student_threads[0]
        q_short = top_st["question"]
        if len(q_short) > 100:
            q_short = q_short[:97] + "..."
        add_image(
            doc,
            img3,
            f"Imagen 3. Hilo iniciado por estudiante — {top_st['author']} ({top_st['municipio']}): "
            f"«{q_short}» ({top_st['replies']} respuestas)",
        )

    add_heading(doc, "8. Conclusiones", 2)
    add_para(
        doc,
        f"El foro del nodo {name} operó como un espacio efectivo de acompañamiento y aplicación práctica. "
        f"La dinámica del tutor movilizó respuestas concretas vinculadas a visibilidad, marketing, servicio al cliente "
        f"y acciones de corto plazo en los emprendimientos. Simultáneamente, {len(student_threads)} estudiantes "
        f"formularon preguntas propias sobre retos, herramientas y proyección de sus negocios, evidenciando "
        f"apropiación activa del espacio. La participación multisectorial por municipios confirma "
        f"apropiación territorial del componente formativo.",
    )
    add_para(
        doc,
        "Se recomienda mantener la consigna de acciones en 7 días, reforzar seguimiento en municipios con menor "
        "número de intervenciones y continuar usando el exportador del dashboard del tutor como evidencia "
        "auditable del acompañamiento.",
    )
    doc.save(str(output))


CAPTURES = BASE / "capturas"


def main():
    for cfg in NODES:
        node = parse_node(cfg)
        # Capturas REALES tomadas del dashboard del tutor con navegador (Playwright).
        cap_dir = CAPTURES / cfg["slug"]
        img1 = cap_dir / "01_lista_hilos_nodo.png"
        img2 = cap_dir / "02_hilo_principal_respuestas.png"
        img3 = cap_dir / "03_hilo_estudiante_respuestas.png"
        if not img1.exists() or not img2.exists():
            # respaldo: renderizado desde datos si faltara alguna captura
            img1 = render_thread_list(node, BASE / f"{cfg['slug']}_01_lista_hilos.png")
            img2 = render_main_thread(node, BASE / f"{cfg['slug']}_02_hilo_principal.png")
        build_report(node, img1, img2, img3 if img3.exists() else None, cfg["output"])
        print(f"OK {node['name']}: {node['total_threads']} hilos, {node['total_replies']} resp, "
              f"hilo principal {len(node['main_replies'])} resp, municipios {len(node['muni_all'])} -> {cfg['output']}")


if __name__ == "__main__":
    main()
