from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("about/", views.about, name="about"),
    path("register/", views.register, name="register"),
    path("login/", auth_views.LoginView.as_view(template_name = "login.html"), name="login"),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('create/', views.create_note, name='create_note'),
    path('<int:note_id>/', views.view_note, name='view_note'),
    path('<int:note_id>/edit/', views.edit_note, name='edit_note'),
    path('<int:note_id>/delete/', views.delete_note, name='delete_note'),
]