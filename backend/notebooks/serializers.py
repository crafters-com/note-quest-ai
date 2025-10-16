from rest_framework import serializers
from .models import Notebook
from notes.models import Note

class NotebookSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.id')
    note_count = serializers.SerializerMethodField()

    class Meta:
        model = Notebook
        fields = [
            'id',
            'user',
            'note_count',
            'name',
            'description',
            'subject',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_note_count(self, obj):
        return Note.objects.filter(notebook=obj).count()
