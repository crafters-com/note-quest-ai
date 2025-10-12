# files/serializers.py
from rest_framework import serializers
from .models import File

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
