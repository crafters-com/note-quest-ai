from django.urls import path
from .views import NoteListCreateView, NoteDetailView

urlpatterns = [
    # Ruta para listar todas las notas y crear una nueva
    # Corresponde a GET y POST en /api/notes/
    path("", NoteListCreateView.as_view(), name="note-list-create"),
    
    # Ruta para ver, actualizar o eliminar una nota específica por su ID (pk)
    # Corresponde a GET, PUT, PATCH, DELETE en /api/notes/<id>/
    path("<int:pk>/", NoteDetailView.as_view(), name="note-detail"),
]