from django.db import models
from django.core.exceptions import ValidationError
from django.conf import settings


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

    # Campos para procesamiento/IA
    processing_status = models.CharField(max_length=20, choices=PROCESSING_STATUS, default='queued')
    processing_error = models.TextField(blank=True, null=True)
    md_content = models.TextField(blank=True, null=True)  # texto convertido a markdown
    language = models.CharField(max_length=10, blank=True, null=True)
    checksum = models.CharField(max_length=64, blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.file:
            # Guardar información del archivo automáticamente
            # file.name normalmente incluye la ruta relative, usamos basename
            self.filename = self.file.name.split('/')[-1]
            self.file_size = self.file.size
            # Extraer extensión del archivo
            self.file_type = self.file.name.split('.')[-1].lower()
        super().save(*args, **kwargs)

    def __str__(self):
        # Mostrar título de la nota si existe para más contexto
        note_title = getattr(self.note, 'title', str(self.note_id)) if self.note_id else 'No note'
        return f"{self.filename} (note: {note_title})"
