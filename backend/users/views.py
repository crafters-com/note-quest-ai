from rest_framework import generics, permissions, status, filters
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q

from .serializers import UserSignupSerializer
from .serializers import UserSerializer

User = get_user_model()

class SignupView(generics.CreateAPIView):
    serializer_class = UserSignupSerializer
    permission_classes = [permissions.AllowAny]

    # Sobrescribimos el método 'create' para personalizar la respuesta
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save() # Llama al método .create() de tu serializador
        token = Token.objects.get(user=user)
        
        headers = self.get_success_headers(serializer.data)
        
        # Devolvemos tanto los datos del usuario como el token
        return Response(
            {
                "user": serializer.data,
                "token": token.key
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )

# Login
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        if not user:
            return Response({"error": "Credenciales inválidas"}, status=400)
        
        token, created = Token.objects.get_or_create(user=user)
        serializer = UserSerializer(user)

        return Response({
            "token": token.key,
            "user": serializer.data
        })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_users(request):
    from friendships.models import Friendship  # Importación local para evitar dependencias circulares
    
    query = request.GET.get('q', '').strip()
    if not query:
        return Response([])
    
    # Obtener los IDs de usuarios que ya son amigos o tienen solicitudes pendientes
    friendship_user_ids = Friendship.objects.filter(
        (Q(sender=request.user) | Q(receiver=request.user)),
        Q(status=Friendship.ACCEPTED) | Q(status=Friendship.PENDING)
    ).values_list('sender_id', 'receiver_id').distinct()
    
    # Convertir la lista de tuplas en una lista plana de IDs únicos
    excluded_ids = set()
    for sender_id, receiver_id in friendship_user_ids:
        excluded_ids.add(sender_id)
        excluded_ids.add(receiver_id)
    
    # Asegurarse de excluir al usuario actual
    excluded_ids.add(request.user.id)
    
    # Filtrar usuarios excluyendo amigos y solicitudes pendientes
    users = User.objects.filter(
        Q(username__icontains=query) | 
        Q(email__icontains=query)
    ).exclude(
        id__in=excluded_ids
    )[:5]  # Limitamos a 5 resultados
    
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


# Logout
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response({"success": "Sesión cerrada"})

class UserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated] # Solo usuarios con token pueden acceder

    def get(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        """Allow partial updates to the authenticated user's basic fields.

        Only the fields defined in `UserSerializer` will be accepted.
        """
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        """Allow full update (replace) of the authenticated user's basic fields."""
        serializer = UserSerializer(request.user, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)