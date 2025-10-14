from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FriendshipViewSet

router = DefaultRouter()
router.register(r'', FriendshipViewSet, basename='friendship')

urlpatterns = [
    path('', include(router.urls)),
]