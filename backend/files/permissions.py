# files/permissions.py
from rest_framework import permissions
from notes.models import Note

class IsOwnerOfNote(permissions.BasePermission):
    """
    Permite acciones solo si la nota a la que pertenece el archivo es del request.user.
    """

    def has_permission(self, request, view):
        # Para acciones de lista/crear, tomamos note_id de kwargs o del body
        note_id = view.kwargs.get('note_id') or request.data.get('note')
        if note_id:
            try:
                note = Note.objects.get(pk=note_id)
            except Note.DoesNotExist:
                return False
            # notebook.user es el owner según tus modelos
            return getattr(note.notebook, 'user', None) == request.user
        # Si no se especifica note (ej: listado global), permitimos pasar y dejarlo al queryset
        return True

    def has_object_permission(self, request, view, obj):
        # obj es File -> obj.note.notebook.user
        return getattr(obj.note.notebook, 'user', None) == request.user
