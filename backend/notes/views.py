# en notes/views.py
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db import models
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def share_note(request, note_id):
    """
    Comparte una copia de una nota con un amigo.
    El amigo puede elegir en qué notebook guardarla.
    """
    # Obtener la nota original
    try:
        original_note = Note.objects.get(id=note_id, notebook__user=request.user)
    except Note.DoesNotExist:
        return Response(
            {"error": "Nota no encontrada o no tienes permiso"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Obtener datos de la solicitud
    friend_id = request.data.get('friend_id')
    notebook_id = request.data.get('notebook_id')  # Notebook del amigo donde se guardará
    
    if not friend_id:
        return Response(
            {"error": "Se requiere friend_id"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verificar que son amigos
    try:
        friend = User.objects.get(id=friend_id)
    except User.DoesNotExist:
        return Response(
            {"error": "Usuario no encontrado"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Verificar amistad
    friendship_exists = Friendship.objects.filter(
        status=Friendship.ACCEPTED
    ).filter(
        models.Q(sender=request.user, receiver=friend) |
        models.Q(sender=friend, receiver=request.user)
    ).exists()
    
    if not friendship_exists:
        return Response(
            {"error": "Solo puedes compartir notas con tus amigos"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Si se especifica un notebook, verificar que pertenezca al amigo
    if notebook_id:
        try:
            target_notebook = Notebook.objects.get(id=notebook_id, user=friend)
        except Notebook.DoesNotExist:
            return Response(
                {"error": "Notebook no encontrado o no pertenece al usuario"},
                status=status.HTTP_404_NOT_FOUND
            )
    else:
        # Si no se especifica, usar el primer notebook del amigo o crear uno
        target_notebook = Notebook.objects.filter(user=friend).first()
        if not target_notebook:
            target_notebook = Notebook.objects.create(
                user=friend,
                name="Notas Compartidas",
                subject="General"
            )
    
    # Crear copia de la nota para el amigo
    shared_note = Note.objects.create(
        notebook=target_notebook,
        title=f"{original_note.title} (compartida por {request.user.username})",
        content=original_note.content
    )
    
    serializer = NoteSerializer(shared_note)
    
    return Response({
        "message": "Nota compartida exitosamente",
        "note": serializer.data
    }, status=status.HTTP_201_CREATED)