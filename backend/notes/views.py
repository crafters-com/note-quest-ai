# en notes/views.py
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from ai_tools.summarizer import summarize_text
from ai_tools.quiz_generator import generate_quiz

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
    
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_summary(request, note_id):
    """Genera y guarda el resumen de una nota."""
    try:
        note = Note.objects.get(id=note_id, notebook__user=request.user)
        summary = summarize_text(note.content)
        note.summary = summary
        note.save(update_fields=["summary"])
        return Response({"summary": summary})
    except Note.DoesNotExist:
        return Response({"error": "Nota no encontrada."}, status=404)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_quiz_view(request, note_id):
    """Genera y guarda un quiz sencillo basado en una nota."""
    try:
        note = Note.objects.get(id=note_id, notebook__user=request.user)
        quiz = generate_quiz(note.content)
        note.quiz_data = quiz
        note.save(update_fields=["quiz_data"])
        return Response({"quiz": quiz})
    except Note.DoesNotExist:
        return Response({"error": "Nota no encontrada."}, status=404)