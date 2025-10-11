# en notes/views.py
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Note
from .serializers import NoteSerializer

class NoteListCreateView(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Note.objects.filter(notebook__user=self.request.user)
        notebook_id = self.request.query_params.get('notebook')
        if notebook_id is not None:
            queryset = queryset.filter(notebook_id=notebook_id)
        return queryset.order_by('-updated_at')
    
class NoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Un usuario solo puede acceder/modificar las notas de sus propios notebooks
        return Note.objects.filter(notebook__user=self.request.user)