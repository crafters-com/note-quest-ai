from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from .models import UserStats

User = get_user_model()

class UserStatsSerializer(serializers.ModelSerializer):
    streak_count = serializers.IntegerField(read_only=True)
    best_streak = serializers.IntegerField(read_only=True)
    last_active_date = serializers.DateField(read_only=True)
    class Meta:
        model = UserStats
        fields = ['streak_count', 'best_streak', 'last_active_date']

class UserSerializer(serializers.ModelSerializer):
    # Prefer nested stats; use a safe getter to avoid DoesNotExist when a user lacks stats
    stats = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'birth_date',
            'university', 'location', 'career', 'academic_year', 'bio',
            'stats', 'created_at'
        ]

    def get_stats(self, obj):
        try:
            stats = obj.stats  # OneToOne related
        except Exception:
            stats = None
        if not stats:
            # Return defaults to keep frontend simple; alternatively return None
            return {
                'streak_count': 0,
                'best_streak': 0,
                'last_active_date': None,
            }
        return UserStatsSerializer(stats).data

class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "password", "birth_date", "university", "location", "career", "academic_year"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            password=validated_data["password"],
            birth_date=validated_data.get("birth_date", None),
            university=validated_data.get("university", None),
            location=validated_data.get("location", None),
            career=validated_data.get("career", None),
            academic_year=validated_data.get("academic_year", None)
        )
        Token.objects.create(user=user)  # genera token automáticamente
        return user
    
