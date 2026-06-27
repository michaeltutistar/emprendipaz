from pathlib import Path
import zipfile
import xml.etree.ElementTree as ET

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
folder = Path(r"C:\Users\USUARIO\Downloads\Abril-Emprendipaz")
for name in ["IMM ABR.docx", "INN ABR.docx", "IACC ABR.docx"]:
    with zipfile.ZipFile(folder / name) as z:
        root = ET.fromstring(z.read("word/document.xml"))
    paras = []
    for i, para in enumerate(root.iter(W + "p")):
        t = "".join(x.text or "" for x in para.iter(W + "t")).strip()
        if t:
            paras.append((i, t))
    out = Path(__file__).parent / f"{name.replace(' ', '_')}_fulltext.txt"
    out.write_text("\n".join(f"{i:04d}|{t}" for i, t in paras), encoding="utf-8")
    print(name, len(paras), "->", out)
