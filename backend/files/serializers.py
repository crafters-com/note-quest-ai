# backend/files/serializers.py
from rest_framework import serializers
from .models import File
import logging

logger = logging.getLogger(__name__)

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        read_only_fields = (
            'id', 'filename', 'file_size', 'uploaded_at',
            'processing_status', 'processing_error', 'md_content', 'checksum', 'language'
        )
        fields = (
            'id', 'note', 'file', 'filename', 'file_type', 'file_size',
            'uploaded_at', 'processing_status', 'processing_error', 'md_content'
        )

    def validate(self, attrs):
        # Asegurarnos que venga 'note' (puede asignarse en la view si viene por URL)
        if not attrs.get('note') and not self.initial_data.get('note'):
            raise serializers.ValidationError("Se requiere 'note' al subir un archivo.")
        return attrs
