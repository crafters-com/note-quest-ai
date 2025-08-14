from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from .forms import CustomUserCreationForm, NoteForm
from .models import Note

# Create your views here.
def register(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect("home")
    else:
        form = CustomUserCreationForm()
    return render(request, "register.html", {"form": form})

@login_required
def home(request):
    notes = Note.objects.filter(user=request.user)
    return render(request, "home.html", {"notes": notes})

def about(request):
    return render(request, "about.html")

# Crear una nueva nota
@login_required
def create_note(request):
    if request.method == "POST":
        form = NoteForm(request.POST)
        if form.is_valid():
            note = form.save(commit=False)
            note.user = request.user  # Asignar el usuario actual
            note.save()
            return redirect('home')  # Redirige a la página de inicio después de guardar la nota
    else:
        form = NoteForm()

    return render(request, 'create_note.html', {'form': form})

# Ver una nota específica
@login_required
def view_note(request, note_id):
    note = get_object_or_404(Note, id=note_id, user=request.user)  # Solo permite ver la nota si es del usuario
    return render(request, 'view_note.html', {'note': note})

# Editar una nota
@login_required
def edit_note(request, note_id):
    note = get_object_or_404(Note, id=note_id, user=request.user)  # Solo permite editar si es del usuario
    if request.method == "POST":
        form = NoteForm(request.POST, instance=note)
        if form.is_valid():
            form.save()
            return redirect('home')  # Redirige a la página de inicio después de actualizar la nota
    else:
        form = NoteForm(instance=note)

    return render(request, 'edit_note.html', {'form': form})

# Eliminar una nota
@login_required
def delete_note(request, note_id):
    note = get_object_or_404(Note, id=note_id, user=request.user)  # Solo permite eliminar si es del usuario
    if request.method == "POST":
        note.delete()
        return redirect('home')  # Redirige a la página de inicio después de eliminar la nota
    return render(request, 'delete_note.html', {'note': note})