from django.db import models


class Note(models.Model):
    # Relación con Notebook (NO con User, se accede por notebook.user)
    notebook = models.ForeignKey('notebooks.Notebook', on_delete=models.CASCADE)
    
    # Campos básicos
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True)
    
    # Fechas automáticas  
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title