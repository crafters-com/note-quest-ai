# en notes/urls.py
from django.urls import path
from .views import NoteListCreateView, NoteDetailView

urlpatterns = [
    # Ruta para listar y crear notas (ej. /api/notes/)
    path('', NoteListCreateView.as_view(), name='note-list-create'),
    
    # Ruta para una nota específica (ej. /api/notes/5/)
    path('<int:pk>/', NoteDetailView.as_view(), name='note-detail'),
]