---
name: document-word-enhancement
description: Lee documentos Word (.docx) con sus imágenes, extrae contenido, crea/recorta imágenes, añade gráficas (diagramas, tablas) y genera documentos Word mejorados. Usar cuando el usuario pida mejorar informes, complementar documentos, añadir diagramas de arquitectura, graficar contenido, o generar/actualizar documentos Word con imágenes.
---

# Document Word Enhancement

## Objetivo

Permitir al agente leer documentos Word (.docx), analizar su contenido e imágenes, crear o modificar imágenes (recortes, diagramas, gráficas) y generar un documento Word final mejorado.

## Workflow principal

```
1. Extraer → 2. Analizar → 3. Crear/Modificar → 4. Generar Word
```

### Paso 1: Extraer contenido del .docx

Un .docx es un ZIP. Extraer texto e imágenes:

```python
import zipfile
import xml.etree.ElementTree as ET

# Texto
with zipfile.ZipFile("documento.docx", "r") as z:
    xml_content = z.read("word/document.xml")
root = ET.fromstring(xml_content)
for p in root.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p"):
    for t in p.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t"):
        if t.text: print(t.text)

# Imágenes (guardar en carpeta temporal para poder leerlas)
with zipfile.ZipFile("documento.docx", "r") as z:
    for name in z.namelist():
        if name.startswith("word/media/"):
            z.extract(name, "temp_images")
```

Las imágenes extraídas en `temp_images/word/media/` pueden leerse con la herramienta Read para analizarlas.

### Paso 2: Analizar y decidir mejoras

- Revisar el texto extraído y las imágenes.
- Identificar: qué actualizar, qué gráficas añadir, qué imágenes recortar o reemplazar.
- Para diagramas de arquitectura: usar Mermaid o ASCII (ver reference.md).

### Paso 3: Crear/modificar imágenes

**Diagramas Mermaid** → PNG:
- Ir a [mermaid.live](https://mermaid.live), pegar código, exportar PNG.
- O usar `@mermaid-cli` si está instalado: `mmdc -i diagram.mmd -o diagram.png`

**Recortar/redimensionar** (Pillow):
```python
from PIL import Image
img = Image.open("imagen.jpeg")
cropped = img.crop((left, top, right, bottom))
cropped.save("imagen_recortada.png")
```

**Generar gráficas** (matplotlib, si hay datos):
```python
import matplotlib.pyplot as plt
plt.figure()
# ... crear gráfica
plt.savefig("grafica.png", dpi=150)
```

**Generar imagen con IA**: Usar la herramienta GenerateImage cuando el usuario pida ilustraciones o diagramas conceptuales.

### Paso 4: Generar documento Word

Usar `python-docx`:

```python
from docx import Document
from docx.shared import Inches, Cm

doc = Document()
doc.add_heading("Título", 0)
doc.add_paragraph("Texto del párrafo.")
doc.add_heading("Sección con imagen", level=1)
doc.add_picture("diagrama.png", width=Inches(5))
doc.add_paragraph()
doc.add_picture("grafica.png", width=Cm(12))
doc.save("documento_mejorado.docx")
```

## Checklist de mejora típica

- [ ] Extraer texto e imágenes del .docx original
- [ ] Leer/analizar las imágenes extraídas
- [ ] Identificar secciones que requieren diagramas (ej. arquitectura)
- [ ] Crear diagramas (Mermaid → PNG) o gráficas (matplotlib)
- [ ] Recortar imágenes si es necesario (Pillow)
- [ ] Generar nuevo .docx con python-docx
- [ ] Insertar imágenes con tamaño apropiado (Inches o Cm)

## Dependencias

```bash
pip install python-docx Pillow
```

Para Mermaid: usar mermaid.live (online) o instalar `@mermaid-cli` globalmente.

## MCP opcional

Si el usuario tiene configurado **Office Word MCP Server** ([mcpmarket.com/server/office-word](https://mcpmarket.com/server/office-word)):
- Usar sus herramientas para crear/editar documentos Word directamente.
- El servidor soporta: añadir texto, encabezados, tablas, imágenes, estilos, buscar/reemplazar.

Configuración en Cursor: añadir el servidor en la configuración MCP del proyecto.

## Scripts de utilidad

**Extraer contenido de un .docx:**
```bash
python .cursor/skills/document-word-enhancement/scripts/extract_docx.py documento.docx -o temp_images
```

**Crear Word desde contenido:**
```bash
python .cursor/skills/document-word-enhancement/scripts/create_docx_from_content.py -o salida.docx -H "Título" -t "Párrafo 1" -t "Párrafo 2" -i diagrama.png -i grafica.png
```

## Recursos adicionales

- Detalles de MCP y librerías: [reference.md](reference.md)
