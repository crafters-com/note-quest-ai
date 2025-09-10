from django.db import models
from django.conf import settings


class Notebook(models.Model):
    # Relación con User
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    # Campos básicos
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    subject = models.CharField(max_length=100)
    
    # Fechas automáticas
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.subject}"