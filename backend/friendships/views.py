from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Friendship
from .serializers import FriendshipSerializer


class FriendshipViewSet(viewsets.ModelViewSet):
    serializer_class = FriendshipSerializer
    
    def get_queryset(self):
        user = self.request.user
        return Friendship.objects.filter(
            models.Q(sender=user) | models.Q(receiver=user)
        )

    @action(detail=False, methods=['get'])
    def pending_requests(self):
        user = self.request.user
        pending = Friendship.objects.filter(receiver=user, status=Friendship.PENDING)
        serializer = self.get_serializer(pending, many=True)
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