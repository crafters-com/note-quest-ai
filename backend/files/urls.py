# files/urls.py
from django.urls import path
from .views import FileViewSet

file_list = FileViewSet.as_view({'get': 'list', 'post': 'create'})
file_detail = FileViewSet.as_view({'get': 'retrieve', 'delete': 'destroy'})

urlpatterns = [
    path('notes/<int:note_id>/files/', file_list, name='note-files'),
    path('files/<int:pk>/', file_detail, name='file-detail'),
]
