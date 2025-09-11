from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Note
from .serializers import NoteSerializer


# Lista todas las notas y permite crear nuevas
class NoteListCreateView(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    # permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Solo notas de notebooks del usuario autenticado
        return Note.objects.filter(notebook__user=self.request.user)


# Obtiene, actualiza y elimina una nota específica
class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NoteSerializer
    # permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Solo notas de notebooks del usuario autenticado
        return Note.objects.filter(notebook__user=self.request.user)
