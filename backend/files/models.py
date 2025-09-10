from django.db import models
from django.core.exceptions import ValidationError


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
    # Opciones para tipos de archivo
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
    
    # Relación con Note
    note = models.ForeignKey('notes.Note', on_delete=models.CASCADE)
    
    # Archivo con validaciones
    file = models.FileField(
        upload_to='files/',
        validators=[validate_file_size, validate_file_type]
    )
    
    # Información básica del archivo
    filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=10, choices=FILE_TYPE_CHOICES)
    file_size = models.PositiveIntegerField()  # en bytes
    
    # Fecha de subida
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if self.file:
            # Guardar información del archivo automáticamente
            self.filename = self.file.name
            self.file_size = self.file.size
            # Extraer extensión del archivo
            self.file_type = self.file.name.split('.')[-1].lower()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.filename