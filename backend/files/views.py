# backend/files/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import File
from .serializers import FileSerializer
from .permissions import IsOwnerOfNote

# Intentamos importar Celery task; si no está, pondremos fallback a process_file_sync
try:
    from .tasks import process_file_task, process_file_sync
except Exception:
    process_file_task = None
    try:
        from .tasks import process_file_sync
    except Exception:
        process_file_sync = None

# Para fallback asíncrono (si no hay Celery)
import threading
import logging
logger = logging.getLogger(__name__)

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.select_related('note', 'note__notebook').all()
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated, IsOwnerOfNote]

    def get_queryset(self):
        qs = super().get_queryset()
        note_id = self.kwargs.get('note_id') or self.request.query_params.get('note')
        if note_id:
            qs = qs.filter(note_id=note_id)
        qs = qs.filter(note__notebook__user=self.request.user)
        return qs.order_by('-uploaded_at')

    def _enqueue_processing(self, instance_id):
        """
        Intenta encolar con Celery; si no existe Celery, lanza en un thread.
        """
        if process_file_task:
            try:
                process_file_task.delay(instance_id)
                return True
            except Exception as e:
                logger.warning("Celery delay failed: %s. Falling back to thread. ", e)

        # Fallback: llamada asíncrona en hilo
        if process_file_sync:
            def worker():
                try:
                    process_file_sync(instance_id)
                except Exception as e:
                    logger.exception("Fallback thread processing failed for file %s: %s", instance_id, e)
            t = threading.Thread(target=worker, daemon=True)
            t.start()
            return True

        return False

    def create(self, request, *args, **kwargs):
        """
        Soporta subida múltiple: puede recibir varios campos 'file' (getlist).
        Si hay múltiples archivos, devuelve lista de objetos.
        """
        # si vienen varios files
        files = request.FILES.getlist('file')
        created = []

        # Si no viene como lista, DRF aún lo acepta como request.FILES['file']
        if not files:
            single = request.FILES.get('file')
            if single:
                files = [single]

        # Si no hay archivos en la petición, devolver error
        if not files:
            return Response({"detail": "No se encontró archivo en la petición (campo 'file')."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Determinar note: preferimos note_id de kwargs (ruta anidada)
        note_id = self.kwargs.get('note_id') or request.data.get('note') or request.POST.get('note')
        if not note_id:
            return Response({"detail": "Se requiere 'note' (id) para asociar archivos."},
                            status=status.HTTP_400_BAD_REQUEST)

        # validar nota y permisos (IsOwnerOfNote.has_permission debería cubrir esto, pero validamos explícitamente)
        from notes.models import Note
        note = get_object_or_404(Note, pk=note_id)
        if getattr(note.notebook, 'user', None) != request.user:
            return Response({"detail": "No tienes permiso sobre la nota indicada."},
                            status=status.HTTP_403_FORBIDDEN)

        responses = []
        for f in files:
            data = {'note': note.id, 'file': f}
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            instance = serializer.save()  # modelo guarda archivo

            # marcar queued y encolar procesamiento (async)
            try:
                instance.processing_status = 'queued'
                instance.save(update_fields=['processing_status'])
            except Exception:
                pass

            # Encolar o fallback thread
            self._enqueue_processing(instance.id)

            responses.append(self.get_serializer(instance).data)

        # Si solo creamos 1, devolver objeto; si muchos, devolver lista
        if len(responses) == 1:
            return Response(responses[0], status=status.HTTP_201_CREATED)
        return Response(responses, status=status.HTTP_201_CREATED)
