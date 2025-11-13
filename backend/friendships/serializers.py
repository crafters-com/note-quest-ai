from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Friendship
from users.serializers import UserSerializer as FullUserSerializer

User = get_user_model()

class BasicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class FriendshipSerializer(serializers.ModelSerializer):
    sender = BasicUserSerializer(read_only=True)
    receiver = BasicUserSerializer(read_only=True)
    receiver_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        queryset=User.objects.all(),
        source='receiver'
    )
    friend = serializers.SerializerMethodField()

    class Meta:
        model = Friendship
        fields = ['id', 'sender', 'receiver', 'receiver_id', 'status', 'created_at', 'friend']

    def get_friend(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            if obj.sender == request.user:
                # Use the full user serializer to include nested stats
                return FullUserSerializer(obj.receiver, context={'request': request}).data
            return FullUserSerializer(obj.sender, context={'request': request}).data
        return None

    def validate(self, data):
        request = self.context.get('request')
        if not request or not request.user:
            raise serializers.ValidationError("Usuario no autenticado")
            
        receiver = data.get('receiver')  # Esto viene del source='receiver' en receiver_id
        if not receiver:
            raise serializers.ValidationError("Se requiere un receptor")
                
        if receiver == request.user:
            raise serializers.ValidationError("No puedes enviarte una solicitud a ti mismo")
            
        # Verificar si ya existe una amistad
        existing = Friendship.objects.filter(
            (Q(sender=request.user, receiver=receiver) |
            Q(sender=receiver, receiver=request.user))
        ).first()
        
        if existing:
            if existing.status == Friendship.PENDING:
                raise serializers.ValidationError("Ya existe una solicitud de amistad pendiente")
            elif existing.status == Friendship.ACCEPTED:
                raise serializers.ValidationError("Ya son amigos")
                
        return data

    def create(self, validated_data):
        sender = self.context['request'].user
        receiver = validated_data.get('receiver')
        
        friendship = Friendship.objects.create(
            sender=sender,
            receiver=receiver,
            status=Friendship.PENDING
        )
        return friendship