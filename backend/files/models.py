from django.db import models
from django.core.exceptions import ValidationError
from django.conf import settings
import hashlib

def validate_file_size(file):
    """Validar que el archivo no sea mayor a 10MB"""
    max_size = 10 * 1024 * 1024  # 10MB en bytes
    if file.size > max_size:
        raise ValidationError('El archivo no puede ser mayor a 10MB')


def validate_file_type(file):
    """Validar que el archivo sea de un tipo permitido"""
    allowed_types = ['pdf', 'docx', 'xlsx', 'pptx', 'png', 'jpg', 'jpeg', 'txt', 'md']
    file_extension = file.name.split('.')[-1].lower()
    if file_extension not in allowed_types:
        raise ValidationError(f'Tipo de archivo no permitido. Solo: {", ".join(allowed_types)}')


class File(models.Model):
    FILE_TYPE_CHOICES = [
        ('pdf', 'PDF'),
        ('docx', 'Word'),
        ('xlsx', 'Excel'),
        ('pptx', 'PowerPoint'),
        ('png', 'PNG Image'),
        ('jpg', 'JPEG Image'),
        ('jpeg', 'JPEG Image'),
        ('txt', 'Text File'),
        ('md', 'Markdown'),
    ]

    PROCESSING_STATUS = [
        ('queued', 'Queued'),
        ('processing', 'Processing'),
        ('done', 'Done'),
        ('error', 'Error'),
    ]

    # Relación con Note (tu modelo Note está en la app "notes")
    note = models.ForeignKey('notes.Note', on_delete=models.CASCADE, related_name='files')

    # Archivo con validaciones
    file = models.FileField(
        upload_to='files/',
        validators=[validate_file_size, validate_file_type]
    )

    # Información básica del archivo
    filename = models.CharField(max_length=255, blank=True)
    file_type = models.CharField(max_length=10, choices=FILE_TYPE_CHOICES, blank=True)
    file_size = models.PositiveIntegerField(null=True, blank=True)  # en bytes

    # Fecha de subida
    uploaded_at = models.DateTimeField(auto_now_add=True)

    # Campos de procesamiento
    processing_status = models.CharField(max_length=20, choices=PROCESSING_STATUS, default='queued')
    processing_error = models.TextField(blank=True, null=True)
    md_content = models.TextField(blank=True, null=True)   # contenido extraído/convertido a markdown
    checksum = models.CharField(max_length=64, blank=True, null=True)  # sha256
    language = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        ordering = ['-uploaded_at']

    def compute_checksum(self):
        """Calcula SHA256 del archivo (no del path)."""
        try:
            h = hashlib.sha256()
            # file.path puede no estar disponible en todos los storage; usamos .file
            f = self.file
            if not f:
                return None
            # mueve el puntero al inicio
            file_obj = f.open(mode='rb')  # asegura abierto
            try:
                # leer por chunks para archivos grandes
                for chunk in iter(lambda: file_obj.read(8192), b''):
                    h.update(chunk)
            finally:
                file_obj.close()
            return h.hexdigest()
        except Exception:
            return None

    def save(self, *args, **kwargs):
        is_new = self._state.adding  # True si es un nuevo archivo

        # Primero guarda normalmente (esto guarda el archivo en disco)
        super().save(*args, **kwargs)

        # Luego, una vez guardado, extraemos metadatos y actualizamos
        if is_new and self.file:
            try:
                self.filename = self.file.name.split('/')[-1]
                self.file_type = self.file.name.split('.')[-1].lower()
                self.file_size = getattr(self.file, 'size', None)
                if not self.checksum:
                    self.checksum = self.compute_checksum()
                # Guardamos solo los metadatos (sin volver a escribir el archivo)
                super().save(update_fields=['filename', 'file_type', 'file_size', 'checksum'])
            except Exception as e:
                import logging
                logging.getLogger(__name__).warning(f"Error actualizando metadatos del archivo {self.id}: {e}")


    def __str__(self):
        note_title = getattr(self.note, 'title', str(self.note_id)) if getattr(self, 'note_id', None) else 'No note'
        return f"{self.filename} (note: {note_title})"
