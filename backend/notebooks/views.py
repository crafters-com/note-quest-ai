from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Notebook
from .serializers import NotebookSerializer

class NotebookViewSet(viewsets.ModelViewSet):
    serializer_class = NotebookSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Solo notebooks del usuario autenticado
        return Notebook.objects.filter(user=self.request.user).order_by('-updated_at')

    def perform_create(self, serializer):
        # Asigna automáticamente el usuario autenticado como dueño
        serializer.save(user=self.request.user)
