# files/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import File
from .serializers import FileSerializer
from .permissions import IsOwnerOfNote

# task: intenta encolar si existe, si no deja queued (no rompe)
try:
    from .tasks import process_file_task
except Exception:
    process_file_task = None

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated, IsOwnerOfNote]

    def get_queryset(self):
        # Solo devolver archivos de notas del usuario
        user = self.request.user
        return File.objects.filter(note__notebook__user=user).select_related('note')

    def list(self, request, note_id=None, *args, **kwargs):
        # Lista archivos de una nota específica (ruta anidada)
        if note_id is None:
            return Response({"detail": "note_id is required in URL."}, status=status.HTTP_400_BAD_REQUEST)
        qs = self.get_queryset().filter(note_id=note_id)
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    def create(self, request, note_id=None, *args, **kwargs):
        if note_id is None:
            return Response({'detail': 'note_id is required in URL.'}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data.copy()
        data['note'] = note_id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        instance = serializer.instance

        # Asegurar estado queued y guardar
        instance.processing_status = 'queued'
        instance.save(update_fields=['processing_status'])

        # Intentar encolar task si está disponible (Celery)
        if process_file_task:
            try:
                process_file_task.delay(instance.id)
            except Exception:
                # no romper, dejar en queued para procesar manualmente
                pass

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    # retrieve and destroy usan permisos de objeto por defecto (IsOwnerOfNote)
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
