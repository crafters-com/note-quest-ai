import React, { useEffect, useState } from 'react';
import { getNotes, createNote, updateNote, deleteNote } from './apiNotes';

function Notes({ token, notebookId, onBack }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getNotes(token);
        // Filtra las notas por notebookId si es necesario
        const filtered = notebookId ? data.filter(n => n.notebook === notebookId) : data;
        setNotes(filtered);
      } catch (err) {
        setError('Error loading notes');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token, notebookId]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateOrUpdate = async e => {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        const updated = await updateNote(editId, form, token);
        setNotes(notes.map(n => (n.id === editId ? updated : n)));
        setEditId(null);
      } else {
        const newNote = await createNote({ ...form, notebook: notebookId }, token);
        setNotes([...notes, newNote]);
      }
      setForm({ title: '', content: '' });
      setShowForm(false);
    } catch (err) {
      setError('Error saving note');
    }
  };

  const handleEdit = note => {
    setForm({ title: note.title, content: note.content });
    setEditId(note.id);
    setShowForm(true);
  };

  const handleDelete = async id => {
    setError('');
    try {
      await deleteNote(id, token);
      setNotes(notes.filter(n => n.id !== id));
    } catch (err) {
      setError('Error deleting note');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2em auto' }}>
      <button className="secondary" onClick={onBack}>Back to Notebooks</button>
      <h2 style={{ color: 'var(--green)' }}>Notes</h2>
      {loading ? (
        <div className="empty-message">Loading...</div>
      ) : notes.length === 0 ? (
        <div>
          <div className="empty-message">No notes yet.</div>
          <button onClick={() => setShowForm(true)}>Create Note</button>
        </div>
      ) : (
        <div>
          <button onClick={() => setShowForm(true)}>Create Note</button>
          {notes.map(note => (
            <div className="card" key={note.id}>
              <div className="card-title">{note.title}</div>
              <div className="card-subtitle">{note.content}</div>
              <button className="secondary" onClick={() => handleEdit(note)}>Edit</button>
              <button className="secondary" onClick={() => handleDelete(note.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <form className="form-container" onSubmit={handleCreateOrUpdate}>
          <h3 style={{ color: 'var(--black)' }}>{editId ? 'Edit Note' : 'Create Note'}</h3>
          {error && <div className="error-message">{error}</div>}
          <label htmlFor="title">Title</label>
          <input name="title" value={form.title} onChange={handleChange} required />
          <label htmlFor="content">Content</label>
          <textarea name="content" value={form.content} onChange={handleChange} required />
          <button type="submit">{editId ? 'Update' : 'Create'}</button>
          <button type="button" className="secondary" onClick={() => { setShowForm(false); setEditId(null); setForm({ title: '', content: '' }); }}>Cancel</button>
        </form>
      )}
    </div>
  );
}

export default Notes;