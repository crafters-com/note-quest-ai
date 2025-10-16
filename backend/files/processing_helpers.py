# files/processing_helpers.py
import re
import easyocr
from PIL import Image
import numpy as np
import io
import logging
import os

logger = logging.getLogger(__name__)

# Requisitos opcionales:
# pip install python-docx pdfminer.six pillow pytesseract

def text_to_md(text: str) -> str:
    """Limpieza básica y normalización para convertir texto plano a Markdown simple."""
    if not text:
        return ''
    # Normalize line endings
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    # Remove excessive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Strip leading/trailing whitespace
    return text.strip()

def txt_to_md(path: str) -> str:
    """Leer un archivo txt/md y devolver texto limpio."""
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            raw = f.read()
        return text_to_md(raw)
    except Exception as e:
        logger.exception("Error leyendo txt: %s", e)
        return ''

def docx_to_md(path: str) -> str:
    """Extraer texto de docx (usa python-docx)."""
    try:
        from docx import Document
    except Exception as e:
        logger.warning("python-docx no instalado: %s", e)
        return ''
    try:
        doc = Document(path)
        paragraphs = [p.text for p in doc.paragraphs if p.text and p.text.strip()]
        text = '\n\n'.join(paragraphs)
        return text_to_md(text)
    except Exception as e:
        logger.exception("Error procesando docx: %s", e)
        return ''

def pdf_to_md(path: str) -> str:
    """Intentar extraer texto de PDF; si falla, devolver string vacío (se puede hacer fallback a OCR)."""
    try:
        from pdfminer.high_level import extract_text
    except Exception as e:
        logger.warning("pdfminer.six no instalado: %s", e)
        return ''
    try:
        text = extract_text(path)
        if text and text.strip():
            return text_to_md(text)
        # Si no hay texto, se puede implementar fallback OCR por páginas
        logger.info("PDF sin texto detectado, se requiere fallback OCR para %s", path)
        return ''
    except Exception as e:
        logger.exception("Error procesando PDF: %s", e)
        return ''

# Define un lector global (se inicializa una sola vez)
_reader = easyocr.Reader(['es', 'en'], gpu=False)

def ocr_image_to_md(file_obj, lang='es'):
    """
    Realiza OCR sobre una imagen y devuelve texto en formato Markdown.
    Compatible con objetos FieldFile, rutas, o binarios.
    """
    try:
        # 1️⃣ Si llega como string con la ruta (lo que ocurre en tu caso)
        if isinstance(file_obj, str) and os.path.exists(file_obj):
            results = _reader.readtext(file_obj, detail=0)

        # 2️⃣ Si el archivo tiene una ruta en el sistema (FieldFile)
        elif hasattr(file_obj, 'path') and os.path.exists(file_obj.path):
            results = _reader.readtext(file_obj.path, detail=0)

        # 3️⃣ Si el archivo tiene método open() (FieldFile típico de Django)
        elif hasattr(file_obj, 'open'):
            with file_obj.open('rb') as f:
                file_bytes = f.read()
                image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
                image_np = np.array(image)
                results = _reader.readtext(image_np, detail=0)

        # 4️⃣ Si el archivo es un file-like o bytes
        elif hasattr(file_obj, 'read'):
            file_bytes = file_obj.read()
            file_obj.seek(0)
            image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
            image_np = np.array(image)
            results = _reader.readtext(image_np, detail=0)

        elif isinstance(file_obj, (bytes, bytearray)):
            image = Image.open(io.BytesIO(file_obj)).convert("RGB")
            image_np = np.array(image)
            results = _reader.readtext(image_np, detail=0)

        else:
            raise ValueError(f"Tipo de archivo no soportado para OCR: {type(file_obj)}")

        text = "\n".join(results).strip()
        if not text:
            text = "[No se detectó texto legible en la imagen]"

        return text

    except Exception as e:
        logger.error(f"Error haciendo OCR a imagen con EasyOCR: {e}")
        return f"[Error OCR: {str(e)}]"