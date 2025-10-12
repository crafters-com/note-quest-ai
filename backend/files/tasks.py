# files/tasks.py
import logging
import os

from .models import File
from .processing_helpers import txt_to_md, docx_to_md, pdf_to_md, ocr_image_to_md

logger = logging.getLogger(__name__)

def index_file_for_rag_sync(file_id: int):
    """
    Stub de indexación RAG para desarrollo.
    Aquí sólo registramos el evento; más adelante generaremos embeddings y guardaremos en DB/Vector store.
    """
    try:
        f = File.objects.get(pk=file_id)
        logger.info("index_file_for_rag_sync: file %s ready for indexing (user: %s, note: %s)", f.filename, f.note.notebook.user_id if f.note else None, f.note_id)
        # TODO: chunk text, generar embeddings y guardar en vector DB
        return True
    except File.DoesNotExist:
        logger.warning("index_file_for_rag_sync: file %s not found", file_id)
        return False
    except Exception as e:
        logger.exception("index_file_for_rag_sync error: %s", e)
        return False


def process_file_sync(file_id: int):
    """
    Procesamiento síncrono: convertir archivo a md_content y actualizar estado.
    Diseñado para pruebas en shell: process_file_sync(<file_id>)
    """
    try:
        f = File.objects.get(pk=file_id)
    except File.DoesNotExist:
        logger.error("process_file_sync: File %s does not exist", file_id)
        return False

    try:
        f.processing_status = 'processing'
        f.processing_error = ''
        f.save(update_fields=['processing_status', 'processing_error'])

        file_path = f.file.path
        ext = (f.file_type or '').lower()

        md_text = ''

        if ext in ['txt', 'md']:
            md_text = txt_to_md(file_path)
        elif ext in ['docx']:
            md_text = docx_to_md(file_path)
        elif ext in ['pdf']:
            md_text = pdf_to_md(file_path)
            # si pdf_to_md devolvió vacío, podríamos intentar OCR por páginas (pendiente)
        elif ext in ['png', 'jpg', 'jpeg']:
            md_text = ocr_image_to_md(file_path)
        else:
            logger.warning("process_file_sync: extensión no soportada para procesamiento: %s", ext)
            md_text = ''

        # Guardar resultado
        f.md_content = md_text if md_text is not None else ''
        f.processing_status = 'done'
        f.save(update_fields=['md_content', 'processing_status'])
        logger.info("process_file_sync: file %s processed successfully", f.id)

        # Indexar para RAG (stub)
        index_file_for_rag_sync(f.id)

        return True

    except Exception as e:
        logger.exception("process_file_sync error processing file %s: %s", file_id, e)
        try:
            f.processing_status = 'error'
            f.processing_error = str(e)
            f.save(update_fields=['processing_status', 'processing_error'])
        except Exception:
            pass
        return False

# Si Celery está disponible, registramos una tarea, si no definimos process_file_task = None
try:
    from celery import shared_task

    @shared_task(bind=True, soft_time_limit=300)
    def process_file_task(self, file_id):
        return process_file_sync(file_id)

except Exception:
    process_file_task = None
