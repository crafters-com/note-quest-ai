# en notes/views.py
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db import models

from ai_tools.summarizer import summarize_text
from ai_tools.quiz_generator import generate_quiz
from ai_tools.note_improver import improve_note

from .models import Note
from .serializers import NoteSerializer
from notebooks.models import Notebook
from friendships.models import Friendship

User = get_user_model()

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

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def share_note(request, note_id):
    """Comparte una nota con un amigo creando una copia en su notebook."""
    try:
        # Verificar que la nota existe y pertenece al usuario actual
        note = Note.objects.get(id=note_id, notebook__user=request.user)
        
        # Obtener el ID del amigo del request
        friend_id = request.data.get('friend_id')
        if not friend_id:
            return Response({"error": "friend_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar que son amigos
        friend = get_object_or_404(User, id=friend_id)
        friendship_exists = Friendship.objects.filter(
            models.Q(sender=request.user, receiver=friend, status='accepted') |
            models.Q(sender=friend, receiver=request.user, status='accepted')
        ).exists()
        
        if not friendship_exists:
            return Response({"error": "You can only share notes with friends"}, status=status.HTTP_403_FORBIDDEN)
        
        # Buscar o crear el notebook "Shared Notes" del amigo
        shared_notebook, created = Notebook.objects.get_or_create(
            user=friend,
            name="Shared Notes",
            defaults={'subject': 'Shared'}
        )
        
        # Crear una copia de la nota en el notebook del amigo
        shared_note = Note.objects.create(
            notebook=shared_notebook,
            title=f"{note.title} (shared by {request.user.username})",
            content=note.content,
            summary=note.summary,
            quiz_data=note.quiz_data
        )
        
        return Response({
            "message": "Note shared successfully",
            "shared_note_id": shared_note.id
        }, status=status.HTTP_201_CREATED)
        
    except Note.DoesNotExist:
        return Response({"error": "Note not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def improve_note_view(request, note_id):
    """
    Mejora/expande/corrige el contenido de una nota usando la función improve_note().
    - Si en el body viene {"apply": true}, se sobrescribe note.content con la versión mejorada.
    - Devuelve improved_markdown, changelog y warnings.
    """
    try:
        note = Note.objects.get(id=note_id, notebook__user=request.user)
    except Note.DoesNotExist:
        return Response({"error": "Nota no encontrada."}, status=status.HTTP_404_NOT_FOUND)

    try:
        # Llamar a la función de IA con el contenido actual de la nota
        res = improve_note(note.content)

        improved_md = res.get("improved_markdown", "")
        changelog = res.get("changelog", {})
        warnings = res.get("warnings", [])

        # Si el cliente pide aplicar el cambio, actualizamos note.content
        apply_changes = request.data.get("apply", False)
        saved = False
        if apply_changes and improved_md:
            try:
                note.content = improved_md
                # Intentamos guardar el changelog en un campo opcional 'improvement_log' si existe
                if hasattr(note, "improvement_log"):
                    try:
                        note.improvement_log = changelog
                    except Exception:
                        # si el campo no acepta dicts, lo ignoramos para no romper
                        pass
                note.save(update_fields=["content"] + (["improvement_log"] if hasattr(note, "improvement_log") else []))
                saved = True
            except Exception as e:
                logger.exception("No se pudo guardar la nota mejorada: %s", e)
                return Response({"error": "No se pudo guardar la nota mejorada.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            "improved_markdown": improved_md,
            "changelog": changelog,
            "warnings": warnings,
            "saved": saved
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.exception("Error en improve_note_view: %s", e)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)