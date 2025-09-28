import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useData } from "@/hooks/useData";
import { noteService } from "@/services/noteService";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useDebounce } from "@/hooks/useDebounce";

const NoteEditorPage = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const numericId = parseInt(noteId!, 10);

  // Carga los datos iniciales de la nota
  const { data: initialNote, loading, error } = useData(
    () => noteService.getNote(numericId),
    [numericId]
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1000);

  // 4. Configura el editor TipTap
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    // 5. Conecta el editor al estado local 'content'
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert focus:outline-none max-w-full min-h-[50vh]',
      },
    },
  });

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content || "");
      editor?.commands.setContent(initialNote.content || "");
    }
  }, [initialNote, editor]);

  useEffect(() => {
    // No hacer nada si los datos iniciales aún no han cargado
    if (!initialNote) return;
    
    // Comprueba si el título o el contenido han cambiado realmente
    if (debouncedTitle !== initialNote.title || debouncedContent !== initialNote.content) {
      console.log("Guardando cambios...");
      noteService.updateNote(numericId, {
        title: debouncedTitle,
        content: debouncedContent,
        notebook: initialNote.notebook, // El notebook no cambia
      }).catch(err => console.error("Error al auto-guardar:", err));
    }
  }, [debouncedTitle, debouncedContent]); // Se ejecuta solo cuando los valores "debounceados" cambian


  if (loading) return <div>Cargando nota...</div>;
  if (error) return <div className="text-destructive">{error}</div>;

  return (
    <div className="p-4 md:p-8">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-4xl font-bold bg-transparent focus:outline-none w-full mb-4"
        placeholder="Título de la nota"
      />
      <EditorContent editor={editor} />
    </div>
  );
};

export default NoteEditorPage;