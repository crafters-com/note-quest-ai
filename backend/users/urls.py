from django.urls import path
from .views import SignupView, LoginView, LogoutView, UserDetailView, search_users

urlpatterns = [
    path("signup/", SignupView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path('user/', UserDetailView.as_view(), name='user-detail'),
    path('search/', search_users, name='search-users'),
]
