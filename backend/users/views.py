from rest_framework import generics, permissions, status, filters
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta

from .serializers import UserSignupSerializer
from .serializers import UserSerializer, UserStatsSerializer
from .models import UserStats

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
        identifier = (request.data.get("username") or request.data.get("email") or "").strip()
        password = request.data.get("password")
        if not identifier or not password:
            return Response({"error": "username/email y password son requeridos"}, status=400)

        # Permitir login tanto por username como por email
        user_obj = (
            User.objects.filter(Q(username=identifier) | Q(email__iexact=identifier)).first()
        )
        login_username = user_obj.username if user_obj else identifier

        user = authenticate(username=login_username, password=password)
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
    users = User.objects.select_related('stats').filter(
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


class StreakPingView(APIView):
    """Authenticated endpoint to update and return the user's streak.

    Logic:
    - If first activity: set streak_count=1.
    - If same day: do nothing.
    - If yesterday: increment streak_count by 1.
    - Else (gap > 1 day): reset streak_count to 1.
    Always update best_streak if surpassed.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        today = timezone.localdate()
        yesterday = today - timedelta(days=1)

        stats, _ = UserStats.objects.get_or_create(user=user)

        changed = False
        if stats.last_active_date is None:
            stats.streak_count = 1
            stats.last_active_date = today
            changed = True
        elif stats.last_active_date == today:
            # No change if already active today
            pass
        elif stats.last_active_date == yesterday:
            stats.streak_count = (stats.streak_count or 0) + 1
            stats.last_active_date = today
            changed = True
        else:
            # Missed one or more days
            stats.streak_count = 1
            stats.last_active_date = today
            changed = True

        # Update best streak if exceeded
        if (stats.best_streak or 0) < (stats.streak_count or 0):
            stats.best_streak = stats.streak_count
            changed = True

        if changed:
            stats.save(update_fields=[
                'streak_count', 'best_streak', 'last_active_date', 'updated_at'
            ])

        data = UserStatsSerializer(stats).data
        data['today'] = str(today)
        return Response(data)