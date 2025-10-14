import { useData } from '@/hooks/useData';
import { useParams } from "react-router-dom";
import { noteService, type Note } from "@/services/noteService";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from "@/components/ui/Button";
import { Plus, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import ImportMarkdownModal from "@/components/features/notes/ImportMarkdownModal";


const NoteListPage = () => {
  const { notebookId } = useParams<{ notebookId: string }>();
  const navigate = useNavigate();
  const numericId = parseInt(notebookId || '0', 10);
  const [isCreating, setIsCreating] = useState(false);
  
  const { data: notes, loading, error } = useData<Note[]>(
    () => noteService.getNotes(numericId),
    [numericId]
  );

  if (loading) return <div>Loading notes...</div>;
  if (error) return <div className="text-destructive">{error}</div>;

  // Función para manejar importación de archivos
  const handleImportMarkdown = async (importTitle: string, importContent: string) => {
    try {
      // Crear una nueva nota con el contenido importado
      const newNote = await noteService.createNote({
        title: importTitle,
        content: importContent,
        notebook: numericId
      });
      
      // Navegar a la nueva nota
      navigate(`/notes/${newNote.id}`);
    } catch (error) {
      console.error('Error importing note:', error);
      throw new Error('Error importing file');
    }
  };

  const handleCreateNote = async () => {
    setIsCreating(true);
    try {
      // Crea una nota con un título por defecto
      const newNoteData = {
        title: "Untitled note",
        content: "",
        notebook: numericId,
      };
      const newNote = await noteService.createNote(newNoteData);
      
      // Redirige a la página del editor para la nueva nota
      navigate(`/notes/${newNote.id}`);
    } catch (error) {
      console.error("Error creating note:", error);
      // Aquí podrías mostrar una notificación de error
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="default" 
            size="icon"
            onClick={() => navigate('/notebooks')}
            className="flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Notebook Notes</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <ImportMarkdownModal
            onImport={handleImportMarkdown}
            notebookId={numericId}
          />
          <Button onClick={handleCreateNote} disabled={isCreating} size="default">
            <Plus className="mr-2 h-4 w-4" />
            {isCreating ? "Creating..." : "Create Note"}
          </Button>
        </div>
      </div>
      
      {/* 👇 1. Añadimos 'null check'. Si notes es null, su longitud es 0. 👇 */}
      {(notes?.length ?? 0) === 0 ? (
        <p>This notebook doesn't have notes yet.</p>
      ) : (
        <div className="space-y-4">
          {notes?.map((note) => (
  <Link key={note.id} to={`/notes/${note.id}`}>
    <Card className="hover:bg-accent transition-colors cursor-pointer mb-4">
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg">{note.title}</h3>
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