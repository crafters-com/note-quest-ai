import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { useData } from "@/hooks/useData";
import { noteService } from "@/services/noteService";
import { useDebounce } from "@/hooks/useDebounce";
import MarkdownNoteEditor from "@/components/features/notes/MarkdownNoteEditor";
import ExportNoteMenu from "@/components/features/notes/ExportNoteMenu";
import ImportMarkdownModal from "@/components/features/notes/ImportMarkdownModal";
import { ShareNoteModal } from "@/components/features/notes/ShareNoteModal";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Save, Upload, Share2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";

const NoteEditorPage = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const numericId = parseInt(noteId!, 10);

  // Carga los datos iniciales de la nota
  const { data: initialNote, loading, error } = useData(
    () => noteService.getNote(numericId),
    [numericId]
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { toast } = useToast();
  
  const debouncedTitle = useDebounce(title, 500);
  const debouncedContent = useDebounce(content, 500);
  
  // Ref para trackear si hay cambios pendientes
  const hasUnsavedChanges = useRef(false);

  // Función para guardar la nota
  const saveNote = useCallback(async (forceTitle?: string, forceContent?: string) => {
    if (!initialNote) return;
    
    const titleToSave = forceTitle !== undefined ? forceTitle : title;
    const contentToSave = forceContent !== undefined ? forceContent : content;
    
    // Validación: no guardar si el título está vacío
    if (!titleToSave || titleToSave.trim() === '') {
      return;
    }
    
    // Solo guardar si hay cambios reales
    if (titleToSave === initialNote.title && contentToSave === initialNote.content) {
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);
    try {
      await noteService.updateNote(numericId, {
        title: titleToSave,
        content: contentToSave,
      });
      setLastSaved(new Date());
      hasUnsavedChanges.current = false;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Error al guardar";
      setSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [title, content, initialNote, numericId]);

  // Actualiza el estado local cuando se cargan los datos iniciales
  useEffect(() => {
    if (initialNote) {
      const noteTitle = initialNote.title || "Nota sin título";
      setTitle(noteTitle);
      setContent(initialNote.content || "");
      setLastSaved(new Date(initialNote.updated_at));
    }
  }, [initialNote]);

  // Trackear cambios para el flag de unsaved
  useEffect(() => {
    if (initialNote && title && content !== undefined) {
      hasUnsavedChanges.current = 
        title !== initialNote.title || content !== initialNote.content;
    }
  }, [title, content, initialNote]);

  // Auto-guardado cuando cambian los valores debouncedos
  useEffect(() => {
    if (!initialNote) return;
    
    // Validación: asegurar que el título no esté vacío
    if (!debouncedTitle || debouncedTitle.trim() === '') {
      return;
    }
    
    if (debouncedTitle !== initialNote.title || debouncedContent !== initialNote.content) {
      saveNote(debouncedTitle, debouncedContent);
    }
  }, [debouncedTitle, debouncedContent, initialNote, saveNote]);

  // Guardar antes de salir de la página
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        // Guardar inmediatamente sin debounce
        saveNote();
        
        // Mostrar advertencia al usuario
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && hasUnsavedChanges.current) {
        // Página se está ocultando, guardar inmediatamente
        saveNote();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveNote]);

  // Atajo de teclado para guardar (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges.current) {
          saveNote();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [saveNote]);

  // Función para manejar importación de archivos
  const handleImportMarkdown = async (importTitle: string, importContent: string) => {
    if (!initialNote) return;
    
    try {
      // Crear una nueva nota con el contenido importado
      const newNote = await noteService.createNote({
        title: importTitle,
        content: importContent,
        notebook: initialNote.notebook
      });
      
      // Navegar a la nueva nota
      navigate(`/notes/${newNote.id}`);
    } catch (error) {
      console.error('Error al importar nota:', error);
      throw new Error('Error al importar el archivo');
    }
  };

  // Función para manejar blur del título (guardar inmediatamente)
  const handleTitleBlur = () => {
    if (hasUnsavedChanges.current) {
      saveNote();
    }
  };

  // Función para manejar blur del editor (guardar inmediatamente)
  const handleEditorBlur = () => {
    if (hasUnsavedChanges.current) {
      saveNote();
    }
  };

  // Función para volver al notebook
  const handleGoBack = () => {
    if (initialNote) {
      navigate(`/notebooks/${initialNote.notebook}/notes`);
    } else {
      navigate('/notebooks');
    }
  };

  // Función para eliminar la nota
  const handleDeleteNote = async () => {
    if (!initialNote) return;
    
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar la nota "${title}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (!confirmed) return;
    
    try {
      await noteService.deleteNote(numericId);
      toast({
        title: "Nota eliminada",
        description: "La nota ha sido eliminada exitosamente",
        variant: "success",
      });
      // Redirigir al listado de notas del notebook
      navigate(`/notebooks/${initialNote.notebook}/notes`);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la nota",
        variant: "destructive",
      });
    }
  };

  if (loading) return (
    <div className="p-4 md:p-8 flex items-center justify-center">
      <div className="text-muted-foreground">Cargando nota...</div>
    </div>
  );
  if (error) return (
    <div className="p-4 md:p-8">
      <div className="text-destructive">Error: {error}</div>
    </div>
  );

  // No renderizar el editor hasta que los datos estén completamente cargados
  if (!initialNote || !title) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center">
        <div className="text-muted-foreground">Preparando editor...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Barra de herramientas */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            size="sm"
            onClick={handleGoBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          
          <div className="h-4 w-px bg-border" />
          
          <ImportMarkdownModal
            onImport={handleImportMarkdown}
            notebookId={initialNote?.notebook || 0}
            trigger={
              <Button variant="default" size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                Importar MD
              </Button>
            }
          />
        </div>
        
        <div className="flex items-center gap-2">
          {hasUnsavedChanges.current && !isSaving && (
            <Button
              variant="default"
              size="sm"
              onClick={() => saveNote()}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Guardar
            </Button>
          )}
          
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsShareModalOpen(true)}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            Compartir
          </Button>
          
          <ExportNoteMenu
            noteTitle={title}
            noteContent={content}
            variant="default"
            size="sm"
          />

          <div className="h-4 w-px bg-border" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteNote}
            className="gap-2 bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>
      
      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="text-4xl font-bold bg-transparent focus:outline-none w-full mb-4 border-none placeholder:text-muted-foreground"
            placeholder="Título de la nota"
          />
          
          <div onBlur={handleEditorBlur}>
            <MarkdownNoteEditor
              content={content}
              onChange={setContent}
              placeholder="Comienza a escribir tu nota en Markdown..."
              className="min-h-[60vh]"
            />
          </div>
        </div>
      </div>

      {/* Indicador de estado flotante en la esquina inferior derecha */}
      <div className="fixed bottom-4 right-4 z-50">
        {isSaving && (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg shadow-md border border-blue-200">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Guardando...</span>
          </div>
        )}
        
        {saveError && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg shadow-md border border-red-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-sm font-medium">Error al guardar</span>
          </div>
        )}
        
        {!isSaving && !saveError && hasUnsavedChanges.current && (
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg shadow-md border border-orange-200">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span className="text-sm font-medium">Sin guardar</span>
            <button
              onClick={() => saveNote()}
              className="ml-2 px-2 py-1 text-xs bg-orange-200 hover:bg-orange-300 text-orange-700 rounded transition-colors"
            >
              Guardar
            </button>
          </div>
        )}
        
        {!isSaving && !saveError && lastSaved && !hasUnsavedChanges.current && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg shadow-md border border-green-200">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">Guardado</span>
          </div>
        )}
      </div>

      {/* Modal para compartir nota */}
      {initialNote && (
        <ShareNoteModal
          open={isShareModalOpen}
          onOpenChange={setIsShareModalOpen}
          noteId={numericId}
          noteTitle={title}
        />
      )}
    </div>
  );
};

export default NoteEditorPage;