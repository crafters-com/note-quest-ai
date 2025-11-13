from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.db.models import F


class CustomUser(AbstractUser):
    # Opciones para rol
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('admin', 'Admin'),
    ]
    
    # Campos básicos
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    email = models.EmailField(unique=True)
    birth_date = models.DateField(null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    # Profile fields used by UserProfilePage
    university = models.CharField(max_length=255, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    career = models.CharField(max_length=255, null=True, blank=True)
    academic_year = models.CharField(max_length=50, null=True, blank=True)
    rol = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    
    # Fechas automáticas
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Streak tracking has been moved to UserStats (OneToOne). We keep
    # property proxies below for backward compatibility in Python code.
    
    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email", "first_name", "last_name"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    # --- Backward-compatibility property proxies to related stats ---
    @property
    def streak_count(self) -> int:
        stats = getattr(self, "stats", None)
        return stats.streak_count if stats else 0

    @property
    def best_streak(self) -> int:
        stats = getattr(self, "stats", None)
        return stats.best_streak if stats else 0

    @property
    def last_active_date(self):
        stats = getattr(self, "stats", None)
        return stats.last_active_date if stats else None


class UserStats(models.Model):
    """User metrics/stats kept separate from profile fields.

    OneToOne with the custom user for clear responsibility and easier
    atomic updates and future growth of metrics.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="stats",
    )
    streak_count = models.PositiveIntegerField(default=0)
    best_streak = models.PositiveIntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Stats<{self.user_id}> streak={self.streak_count} best={self.best_streak}"

    # --- Stats domain methods (write operations live here) ---
    def increment_streak(self, step: int = 1):
        """Atomic increment of current streak."""
        type(self).objects.filter(pk=self.pk).update(
            streak_count=F("streak_count") + (step or 0)
        )
        # Optional: keep best_streak in sync when increasing
        type(self).objects.filter(pk=self.pk, best_streak__lt=F("streak_count")).update(
            best_streak=F("streak_count")
        )

    def reset_streak(self):
        type(self).objects.filter(pk=self.pk).update(streak_count=0)

    def set_best_streak(self, value: int):
        type(self).objects.filter(pk=self.pk).update(best_streak=value or 0)

    def touch_last_active(self, date=None):
        """Set last_active_date to provided date or today."""
        value = date or timezone.now().date()
        type(self).objects.filter(pk=self.pk).update(last_active_date=value)


@receiver(post_save, sender=CustomUser)
def create_user_stats(sender, instance: CustomUser, created: bool, **kwargs):
    """Ensure each user has a stats row on creation."""
    if created:
        try:
            UserStats.objects.create(user=instance)
        except Exception:
            # In case of concurrent creation, ignore if it already exists
            pass