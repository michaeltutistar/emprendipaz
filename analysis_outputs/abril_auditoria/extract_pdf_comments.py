import json
from pathlib import Path

import fitz

FOLDER = Path(r"C:\Users\USUARIO\Downloads\Abril-Emprendipaz")
OUT = Path(__file__).resolve().parent


def extract_pdf(pdf_path: Path) -> dict:
    doc = fitz.open(pdf_path)
    annots_all = []
    for pno in range(doc.page_count):
        page = doc[pno]
        for annot in page.annots() or []:
            info = annot.info or {}
            content = (info.get("content") or "").strip()
            title = info.get("title") or info.get("subject") or ""
            atype = annot.type[1] if annot.type else str(annot.type)
            annots_all.append(
                {
                    "page": pno + 1,
                    "type": atype,
                    "author": title,
                    "content": content,
                }
            )
    doc.close()
    return {
        "file": pdf_path.name,
        "pages": doc.page_count if False else fitz.open(pdf_path).page_count,
        "annotations": annots_all,
    }


def main():
    results = []
    for pdf in sorted(FOLDER.glob("*.pdf")):
        doc = fitz.open(pdf)
        annots_all = []
        for pno in range(doc.page_count):
            page = doc[pno]
            for annot in page.annots() or []:
                info = annot.info or {}
                content = (info.get("content") or "").strip()
                title = info.get("title") or info.get("subject") or ""
                atype = annot.type[1] if annot.type else str(annot.type)
                annots_all.append(
                    {
                        "page": pno + 1,
                        "type": atype,
                        "author": title,
                        "content": content,
                    }
                )
        results.append(
            {
                "file": pdf.name,
                "pages": doc.page_count,
                "annotation_count": len(annots_all),
                "annotations": annots_all,
            }
        )
        doc.close()

    out_json = OUT / "pdf_audit_comments.json"
    out_md = OUT / "pdf_audit_comments.md"
    out_json.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")

    lines = ["# Comentarios de auditoría en PDFs (Abril-Emprendipaz)\n"]
    for item in results:
        lines.append(f"## {item['file']} ({item['pages']} páginas, {item['annotation_count']} comentarios)\n")
        if not item["annotations"]:
            lines.append("_Sin anotaciones detectadas._\n")
            continue
        for i, a in enumerate(item["annotations"], 1):
            lines.append(f"### Comentario {i} — página {a['page']} ({a['type']})")
            if a["author"]:
                lines.append(f"- **Autor/revisor:** {a['author']}")
            lines.append(f"- **Texto:** {a['content'] or '(vacío)'}\n")
    out_md.write_text("\n".join(lines), encoding="utf-8")

    for item in results:
        print(f"{item['file']}: {item['annotation_count']} comentarios en {item['pages']} páginas")
    print(f"Guardado: {out_json}")
    print(f"Guardado: {out_md}")


if __name__ == "__main__":
    main()
