import { useData } from '@/hooks/useData';
import { useParams } from "react-router-dom";
import { noteService, type Note } from "@/services/noteService";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";


const NoteListPage = () => {
  const { notebookId } = useParams<{ notebookId: string }>();
  const navigate = useNavigate();
  const numericId = parseInt(notebookId || '0', 10);
  const [isCreating, setIsCreating] = useState(false);
  
  const { data: notes, loading, error } = useData<Note[]>(
    () => noteService.getNotes(numericId),
    [numericId]
  );

  if (loading) return <div>Cargando notas...</div>;
  if (error) return <div className="text-destructive">{error}</div>;

  const handleCreateNote = async () => {
    setIsCreating(true);
    try {
      // Crea una nota con un título por defecto
      const newNoteData = {
        title: "Nota sin título",
        content: "",
        notebook: numericId,
      };
      const newNote = await noteService.createNote(newNoteData);
      
      // Redirige a la página del editor para la nueva nota
      navigate(`/notes/${newNote.id}`);
    } catch (error) {
      console.error("Error al crear la nota:", error);
      // Aquí podrías mostrar una notificación de error
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notas del Notebook</h1>
        </div>
        <Button onClick={handleCreateNote} disabled={isCreating}>
          <Plus className="mr-2 h-4 w-4" />
          {isCreating ? "Creando..." : "Crear Nota"}
        </Button>
      </div>
      
      {/* 👇 1. Añadimos 'null check'. Si notes es null, su longitud es 0. 👇 */}
      {(notes?.length ?? 0) === 0 ? (
        <p>Este notebook aún no tiene notas.</p>
      ) : (
        <div className="space-y-3">
          {notes?.map((note) => (
  <Link key={note.id} to={`/notes/${note.id}`}>
    <Card className="hover:bg-accent transition-colors cursor-pointer">
      <CardContent className="p-4">
        <h3 className="font-semibold">{note.title}</h3>
        {/* Opcional: Aquí podrías mostrar un pequeño extracto del contenido */}
      </CardContent>
    </Card>
  </Link>
))}
        </div>
      )}
    </div>
  );
};

export default NoteListPage;