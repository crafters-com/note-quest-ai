# backend/files/tasks.py
import logging
import os

from .models import File
from .processing_helpers import text_to_md, docx_to_md, pdf_to_md, ocr_image_to_md

logger = logging.getLogger(__name__)

def index_file_for_rag_sync(file_id: int):
    """
    Stub de indexación RAG para desarrollo.
    """
    try:
        f = File.objects.get(pk=file_id)
        logger.info("Indexing file (stub) %s", f.id)
        return True
    except File.DoesNotExist:
        return False
    except Exception:
        logger.exception("Error indexando archivo")
        return False

def _append_md_to_note_if_configured(file_obj: File, md_text: str):
    """
    Por defecto, agregamos el md_content al campo Note.content.
    Si deseas cambiar este comportamiento, modifica aquí.
    """
    if not md_text:
        return
    try:
        note = file_obj.note
        # Append with separator si no vacío
        sep = "\n\n---\n\n"
        if not getattr(note, 'content', None):
            note.content = md_text
        else:
            note.content = note.content + sep + md_text
        note.save(update_fields=['content'])
    except Exception:
        logger.exception("No se pudo anexar md_content a la nota %s", getattr(file_obj, 'note_id', None))

def process_file_sync(file_id: int):
    """
    Procesamiento síncrono del archivo: extrae texto, convierte a md, guarda en modelo
    y opcionalmente actualiza la nota con el md.
    """
    try:
        f = File.objects.get(pk=file_id)
    except File.DoesNotExist:
        logger.warning("File %s does not exist", file_id)
        return False

    try:
        f.processing_status = 'processing'
        f.processing_error = ''
        f.save(update_fields=['processing_status', 'processing_error'])

        # Determinar extensión
        try:
            ext = (f.file.name.split('.')[-1] or '').lower()
        except Exception:
            ext = ''

        md_text = ''
        # Llamadas a helpers dependiendo de ext
        if ext in ('txt', 'md'):
            try:
                with f.file.open('r', encoding='utf-8', errors='ignore') as fh:
                    raw = fh.read()
            except Exception:
                with f.file.open('rb') as fh:
                    raw = fh.read().decode('utf-8', errors='ignore')
            md_text = text_to_md(raw)

        elif ext == 'docx':
            md_text = docx_to_md(f.file.path if hasattr(f.file, 'path') else f.file)
        elif ext == 'pdf':
            md_text = pdf_to_md(f.file.path if hasattr(f.file, 'path') else f.file)
        elif ext in ('png', 'jpg', 'jpeg'):
            md_text = ocr_image_to_md(f.file.path if hasattr(f.file, 'path') else f.file)
        else:
            # Intentar leer como texto
            try:
                with f.file.open('r', encoding='utf-8', errors='ignore') as fh:
                    raw = fh.read()
                md_text = text_to_md(raw)
            except Exception:
                md_text = ''

        # Guardar resultados
        f.md_content = md_text
        f.processing_status = 'done'
        f.processing_error = ''
        f.save(update_fields=['md_content', 'processing_status', 'processing_error'])

        # (Opcional) anexar resultado a la nota asociada
        try:
            _append_md_to_note_if_configured(f, md_text)
        except Exception:
            logger.exception("Fallo anexando md a nota para file %s", f.id)

        # Indexación stub (RAG)
        try:
            index_file_for_rag_sync(f.id)
        except Exception:
            logger.exception("Index stub failed (ignored)")

        return True

    except Exception as e:
        logger.exception("Error procesando archivo %s: %s", file_id, e)
        try:
            f.processing_status = 'error'
            f.processing_error = str(e)
            f.save(update_fields=['processing_status', 'processing_error'])
        except Exception:
            pass
        return False

# Si Celery está disponible, registramos una tarea; si no, process_file_task queda None
try:
    from celery import shared_task

    @shared_task(bind=True, soft_time_limit=300)
    def process_file_task(self, file_id):
        return process_file_sync(file_id)

except Exception:
    process_file_task = None
