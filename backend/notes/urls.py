# en notes/urls.py
from django.urls import path
from .views import NoteListCreateView, NoteDetailView, generate_summary, generate_quiz_view, share_note

urlpatterns = [
    # Ruta para listar y crear notas (ej. /api/notes/)
    path('', NoteListCreateView.as_view(), name='note-list-create'),
    
    # Ruta para una nota específica (ej. /api/notes/5/)
    path('<int:pk>/', NoteDetailView.as_view(), name='note-detail'),

    path('<int:note_id>/summarize/', generate_summary, name='generate-summary'),
    path('<int:note_id>/quiz/', generate_quiz_view, name='generate-quiz'),

    path('<int:note_id>/share/', share_note, name='note-share'),
]