from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser, Note

class CustomUserCreationForm(UserCreationForm):
    full_name = forms.CharField(
        max_length=100,
        widget=forms.TextInput(attrs={
            'placeholder': 'ej: Juan Carlos Muñoz',
            'class': 'form-control'
        }),
        label='Nombre completo'
    )
    
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={
            'placeholder': 'ej: jucacmu@gmail.com',
            'class': 'form-control'
        }),
        label='Correo electrónico'
    )
    
    birth_date = forms.DateField(
        widget=forms.DateInput(attrs={
            'type': 'date',
            'class': 'form-control'
        }),
        label='Fecha de nacimiento',
        required=False
    )
    
    password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'placeholder': '••••••••••',
            'class': 'form-control'
        }),
        label='Contraseña'
    )
    
    password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'placeholder': '••••••••••',
            'class': 'form-control'
        }),
        label='Confirmar contraseña'
    )
    
    class Meta:
        model = CustomUser
        fields = ['full_name', 'email', 'birth_date', 'username', 'password1', 'password2']
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs.update({
            'placeholder': 'ej: juancmu',
            'class': 'form-control'
        })
        self.fields['username'].label = 'Nombre de usuario'

class NoteForm(forms.ModelForm):
    class Meta:
        model = Note
        fields = ['title', 'content']
        widgets = {
            'title': forms.TextInput(attrs={
                'placeholder': 'Título de la nota',
                'class': 'form-control'
            }),
            'content': forms.Textarea(attrs={
                'placeholder': 'Contenido de la nota...',
                'class': 'form-control',
                'rows': 10
            })
        }
        labels = {
            'title': 'Título',
            'content': 'Contenido'
        }