from rest_framework import generics, permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, get_user_model

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