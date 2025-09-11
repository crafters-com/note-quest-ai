import React, { useState, useEffect } from 'react';
import * as noteService from '../../services/noteService';
import NoteEditor from '../../components/NoteEditor/NoteEditor';
import styles from './NotePage.module.css';

function NotePage() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Efecto para cargar las notas iniciales desde la API
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await noteService.getAllNotes();
        setNotes(response.data);
      } catch (err) {
        setError('Error al cargar las notas. Asegúrate de haber iniciado sesión.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []); // El array vacío [] asegura que se ejecute solo una vez

  // Función para manejar la selección de una nota de la lista
  const handleSelectNote = (note) => {
    setActiveNote(note);
  };

  // Función que se pasa al editor para actualizar el estado local tras un auto-guardado
  const handleNoteUpdate = (updatedNote) => {
    const newNotes = notes.map(n => (n.id === updatedNote.id ? updatedNote : n));
    setNotes(newNotes);
    // También actualizamos la nota activa para que el editor tenga la última versión
    setActiveNote(updatedNote);
  };

  if (loading) {
    return <p>Cargando notas...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div className={styles.notesLayout}>
      {/* Columna Izquierda: Lista de Notas */}
      <div className={styles.noteListSidebar}>
        <div className={styles.sidebarHeader}>
            <h3>Todas las Notas</h3>
            {/* Aquí podrías añadir un botón para crear una nueva nota */}
            <button className={styles.newNoteButton}>+</button>
        </div>
        <div className={styles.noteList}>
            {notes.map((note) => (
            <div 
                key={note.id} 
                className={`${styles.noteListItem} ${activeNote?.id === note.id ? styles.activeItem : ''}`}
                onClick={() => handleSelectNote(note)}
            >
                {note.title || 'Nota sin título'}
            </div>
            ))}
        </div>
      </div>

      {/* Columna Derecha: Editor de Texto */}
      <div className={styles.editorArea}>
        {activeNote ? (
          <NoteEditor 
            note={activeNote} 
            onUpdate={handleNoteUpdate}
          />
        ) : (
          <div className={styles.noNoteSelected}>
            <p>Selecciona o crea una nota para empezar a editar.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotePage;