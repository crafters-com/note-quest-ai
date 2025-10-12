# files/processing_helpers.py
import re
import logging

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

def ocr_image_to_md(path: str, lang: str = 'spa') -> str:
    """OCR de imágenes (PNG/JPG) usando pytesseract. Requiere Tesseract instalado en sistema."""
    try:
        from PIL import Image
        import pytesseract
    except Exception as e:
        logger.warning("Pillow o pytesseract no instalado: %s", e)
        return ''
    try:
        img = Image.open(path)
        text = pytesseract.image_to_string(img, lang=lang)
        return text_to_md(text)
    except Exception as e:
        logger.exception("Error haciendo OCR a imagen: %s", e)
        return ''
