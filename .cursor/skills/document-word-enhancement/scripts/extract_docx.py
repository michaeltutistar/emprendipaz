#!/usr/bin/env python3
"""
Extrae texto e imágenes de un documento Word (.docx).
Uso: python extract_docx.py <documento.docx> [--output-dir DIR] [--text-only]
"""
import argparse
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


def extract_text(docx_path: str) -> str:
    """Extrae todo el texto del documento."""
    with zipfile.ZipFile(docx_path, "r") as z:
        xml_content = z.read("word/document.xml")
    root = ET.fromstring(xml_content)
    paragraphs = []
    for p in root.iter(f"{NS}p"):
        texts = []
        for t in p.iter(f"{NS}t"):
            if t.text:
                texts.append(t.text)
            if t.tail:
                texts.append(t.tail)
        if texts:
            paragraphs.append("".join(texts))
    return "\n".join(paragraphs)


def extract_images(docx_path: str, output_dir: str) -> list[str]:
    """Extrae imágenes a output_dir. Retorna lista de rutas guardadas."""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    saved = []
    with zipfile.ZipFile(docx_path, "r") as z:
        for name in z.namelist():
            if name.startswith("word/media/"):
                z.extract(name, output_dir)
                saved.append(str(Path(output_dir) / name))
    return saved


def main():
    parser = argparse.ArgumentParser(description="Extrae texto e imágenes de un .docx")
    parser.add_argument("docx", help="Ruta al archivo .docx")
    parser.add_argument("--output-dir", "-o", default="temp_docx_extract",
                        help="Carpeta para imágenes (default: temp_docx_extract)")
    parser.add_argument("--text-only", action="store_true", help="Solo extraer texto")
    args = parser.parse_args()

    if not Path(args.docx).exists():
        print(f"Error: no existe {args.docx}", file=sys.stderr)
        sys.exit(1)

    text = extract_text(args.docx)
    print("=== TEXTO EXTRAÍDO ===\n")
    print(text)

    if not args.text_only:
        images = extract_images(args.docx, args.output_dir)
        print(f"\n=== IMÁGENES EXTRAÍDAS ({len(images)}) ===")
        for img in images:
            print(img)


if __name__ == "__main__":
    main()
