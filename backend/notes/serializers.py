from rest_framework import serializers
from .models import Note


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'title', 'content', 'notebook', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
