import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import * as noteService from '../../services/noteService';
import styles from './NoteEditor.module.css';

// Asumimos que tienes un componente Toolbar aquí
// const Toolbar = ({ editor }) => { ... };

const NoteEditor = ({ note, onUpdate }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: note.content,
    editorProps: {
      attributes: { class: styles.editorContent },
    },
  });

  // Efecto para auto-guardado con debounce (CORREGIDO)
  useEffect(() => {
    if (!editor) return;

    // 1. La variable del temporizador se declara aquí, fuera del handler.
    let debounceTimer;

    const handleUpdate = () => {
      // 2. Limpiamos el temporizador anterior en CADA pulsación de tecla.
      // Esta es la clave para que el debounce funcione.
      clearTimeout(debounceTimer);

      // 3. Creamos un nuevo temporizador.
      debounceTimer = setTimeout(async () => {
        const newContent = editor.getHTML();
        if (newContent !== note.content) {
          try {
            const updatedNote = await noteService.updateNote(note.id, { ...note, content: newContent });
            onUpdate(updatedNote.data);
          } catch (error) {
            console.error("Error al guardar la nota:", error);
          }
        }
      }, 1500); // Solo la última pulsación en 1.5s activará el guardado.
    };

    editor.on('update', handleUpdate);

    // La función de limpieza del useEffect se asegura de que todo quede limpio
    return () => {
      editor.off('update', handleUpdate);
      clearTimeout(debounceTimer); // Limpiamos el último temporizador si el componente se desmonta
    };
  }, [editor, note, onUpdate]);

  // Efecto para actualizar el contenido si cambiamos de nota (Este ya estaba correcto)
  useEffect(() => {
    // La comprobación previene que el contenido se resetee innecesariamente
    if (editor && editor.getHTML() !== note.content) {
      // El 'false' evita que setContent dispare otro evento 'update'
      editor.commands.setContent(note.content, false);
    }
  }, [note, editor]);

  return (
    <div className={styles.editorContainer}>
      {/* <Toolbar editor={editor} /> */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default NoteEditor;