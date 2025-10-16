# backend/files/urls.py
from django.urls import path
from .views import FileViewSet

# Definición de vistas según acciones del ViewSet
file_list = FileViewSet.as_view({'get': 'list', 'post': 'create'})
file_detail = FileViewSet.as_view({
    'get': 'retrieve',
    'delete': 'destroy',
    'patch': 'partial_update',
    'put': 'update',
})

urlpatterns = [
    # Rutas anidadas: archivos dentro de una nota
    path('notes/<int:note_id>/files/', file_list, name='note-files-list-create'),

    # Rutas globales para acceder directamente a archivos
    path('files/', file_list, name='file-list-create'),
    path('files/<int:pk>/', file_detail, name='file-detail'),
]
