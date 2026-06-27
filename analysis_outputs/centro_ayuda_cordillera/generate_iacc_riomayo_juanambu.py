"""
Genera IACC Rio Mayo y Juanambu excluyendo tickets de prueba interna (Luis Ulcue, ID 1911).
"""
from __future__ import annotations

import csv
import json
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parents[1]
CSV_PADRON = ROOT / "backend" / "backend-app" / "src" / "data" / "municipios.csv"
sys.path.insert(0, str(SCRIPT_DIR))

from generate_iacc_node_reports import (  # noqa: E402
    DOWNLOADS,
    build_summary,
    collect_all_records,
    filter_node_records,
    plot_charts,
    write_docx,
    write_xlsx,
)

# Sesiones de prueba del equipo (mensajes exploratorios, no uso legitimo del emprendedor)
EXCLUDED_USER_IDS = {1911}

EXCLUSION_NOTE = (
    "Criterio de auditoría: se excluyeron del análisis los tickets del usuario ID 1911 "
    "(Luis Ulcue, Buesaco) por corresponder a sesiones de prueba interna del equipo técnico, "
    "identificables por mensajes exploratorios («¿quién eres?», «cómo estás») y pruebas de flujos "
    "(recuperación de contraseña, escalamiento), no por necesidades operativas de emprendedores del nodo."
)

NODES = [
    {
        "slug": "rio_mayo",
        "name": "Río Mayo",
        "central": "La Cruz",
        "municipios": [
            "Albán",
            "Belén",
            "Colón",
            "El Tablón de Gómez",
            "La Cruz",
            "San Bernardo",
            "San Pablo",
        ],
        "period_label": "11/06/2026 – 18/06/2026",
        "exclusion_note": EXCLUSION_NOTE,
        "docx": DOWNLOADS / "IACC_Rio_Mayo.docx",
        "xlsx": DOWNLOADS / "Consolidado_IACC_Rio_Mayo.xlsx",
    },
    {
        "slug": "juanambu",
        "name": "Juanambú",
        "central": "La Unión",
        "municipios": [
            "Arboleda",
            "Buesaco",
            "La Unión",
            "San Lorenzo",
            "San Pedro de Cartago",
        ],
        "period_label": "11/06/2026 – 18/06/2026",
        "exclusion_note": EXCLUSION_NOTE,
        "docx": DOWNLOADS / "IACC_Juanambu.docx",
        "xlsx": DOWNLOADS / "Consolidado_IACC_Juanambu.xlsx",
    },
]


def load_student_names():
    names = {}
    with CSV_PADRON.open("r", encoding="latin-1", newline="") as handle:
        for row in csv.DictReader(handle, delimiter=";"):
            raw_id = (row.get("ID") or "").strip()
            if not raw_id:
                continue
            try:
                uid = int(raw_id)
            except ValueError:
                continue
            n = (row.get("Nombre ") or row.get("Nombre") or "").strip()
            a = (row.get("Apellido") or "").strip()
            names[uid] = f"{n} {a}".strip()
    return names


def enrich_records(records, student_names):
    out = []
    for r in records:
        rec = dict(r)
        uid = rec.get("user_id")
        rec["student_name"] = student_names.get(uid, "")
        out.append(rec)
    return out


def apply_legitimate_filter(records, messages):
    records = [r for r in records if r.get("user_id") not in EXCLUDED_USER_IDS]
    ticket_ids = {r["ticket_id"] for r in records}
    messages = [m for m in messages if m.get("ticket_id") in ticket_ids]
    return records, messages


def main():
    all_records, all_messages, history_count = collect_all_records()
    global_total = len(all_records)
    student_names = load_student_names()

    for node in NODES:
        node = {**node, "global_tickets_total": global_total}
        records, messages = filter_node_records(all_records, all_messages, node["municipios"])
        records, messages = apply_legitimate_filter(records, messages)
        records = enrich_records(records, student_names)
        summary = build_summary(records, messages, history_count)
        charts = plot_charts(node["name"], node["slug"], summary)
        write_xlsx(node, records, messages, summary)
        out_docx = node["docx"]
        try:
            docx = write_docx(node, records, summary, charts, messages=messages)
        except PermissionError:
            out_docx = node["docx"].with_name(node["docx"].stem + "_actualizado.docx")
            node = {**node, "docx": out_docx}
            docx = write_docx(node, records, summary, charts, messages=messages)
            print(f"  [AVISO] archivo original abierto; guardado como {out_docx.name}")
        summary_path = SCRIPT_DIR / f"iacc_{node['slug']}_summary.json"
        summary_path.write_text(
            json.dumps(
                {"node": node["name"], "summary": summary, "records": records},
                ensure_ascii=False,
                indent=2,
                default=str,
            ),
            encoding="utf-8",
        )
        print(
            f"OK {node['name']}: {summary['tickets_total']} ticket(s) legitimo(s) -> {docx}"
        )


if __name__ == "__main__":
    main()
