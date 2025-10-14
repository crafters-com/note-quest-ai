from rest_framework import viewsets, status, permissions, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import Friendship
from .serializers import FriendshipSerializer

User = get_user_model()
class FriendshipViewSet(viewsets.ModelViewSet):
    serializer_class = FriendshipSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']
    
    def get_queryset(self):
        user = self.request.user
        action = self.action

        queryset = Friendship.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).select_related('sender', 'receiver')

        if action == 'pending_requests':
            return queryset.filter(receiver=user, status=Friendship.PENDING)
        elif action == 'accepted':
            return queryset.filter(status=Friendship.ACCEPTED)
        
        return queryset

    def create(self, request, *args, **kwargs):
        receiver_id = request.data.get('receiver_id')
        if not receiver_id:
            return Response(
                {"error": "Se requiere un ID de receptor"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Response(
                {"error": "Usuario no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar si ya existe una amistad entre estos usuarios
        existing_friendship = Friendship.objects.filter(
            (Q(sender=request.user) & Q(receiver=receiver)) |
            (Q(sender=receiver) & Q(receiver=request.user))
        ).exists()
        
        if existing_friendship:
            return Response(
                {"error": "Ya existe una solicitud de amistad con este usuario"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear los datos para el serializer usando receiver_id
        serializer = self.get_serializer(data={'receiver_id': receiver_id})
        
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except serializers.ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def pending_requests(self, request):
        user = request.user
        pending = Friendship.objects.filter(receiver=user, status=Friendship.PENDING)
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def accepted(self, request):
        user = request.user
        # Filter friendships where the current user is either sender or receiver AND status is accepted
        friendships = Friendship.objects.filter(
            (Q(sender=user) | Q(receiver=user)),
            status=Friendship.ACCEPTED
        ).select_related('sender', 'receiver').distinct()
        serializer = self.get_serializer(friendships, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        friendship = self.get_object()
        if friendship.receiver != request.user:
            return Response(status=status.HTTP_403_FORBIDDEN)
        friendship.status = Friendship.ACCEPTED
        friendship.save()
        return Response(status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        friendship = self.get_object()
        if friendship.receiver != request.user:
            return Response(status=status.HTTP_403_FORBIDDEN)
        friendship.status = Friendship.REJECTED
        friendship.save()
        return Response(status=status.HTTP_200_OK)

    def perform_destroy(self, instance):
        if instance.sender != self.request.user and instance.receiver != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("No tienes permiso para eliminar esta amistad")
        instance.delete()