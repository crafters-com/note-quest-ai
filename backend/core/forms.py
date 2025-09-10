from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser, Note

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ['full_name', 'username', 'email', 'password1', 'password2']

class NoteForm(forms.ModelForm):
    class Meta:
        model = Note
        fields = ['title', 'content']