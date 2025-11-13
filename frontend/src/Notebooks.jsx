import React, { useEffect, useState } from 'react';
import { getNotebooks, createNotebook } from './apiNotebooks';

function Notebooks({ token, onLogout, onEnterNotebook, onEditNotebook }) {
  const [notebooks, setNotebooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getNotebooks(token);
        // DRF paginación: data.results es el array de notebooks
        if (Array.isArray(data?.results)) {
          setNotebooks(data.results);
        } else if (Array.isArray(data)) {
          setNotebooks(data);
        } else {
          setNotebooks([]);
        }
      } catch (err) {
        setError('Error loading notebooks');
        setNotebooks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async e => {
    e.preventDefault();
    setError('');
    try {
      const newNotebook = await createNotebook(form, token);
      setNotebooks([...notebooks, newNotebook]);
      setForm({ name: '', subject: '' });
      setShowForm(false);
    } catch (err) {
      setError('Error creating notebook');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2em auto', position: 'relative' }}>
      <button className="logout" onClick={onLogout}>Logout</button>
      <h2 style={{ color: 'var(--green)' }}>My Notebooks</h2>
      {loading ? (
        <div className="empty-message">Loading...</div>
      ) : notebooks.length === 0 ? (
        <div>
          <div className="empty-message">No notebooks yet.</div>
          <button onClick={() => setShowForm(true)}>Create Notebook</button>
        </div>
      ) : (
        <div>
          <button onClick={() => setShowForm(true)}>Create Notebook</button>
          {notebooks.map(nb => (
            <div className="card" key={nb.id}>
              <div className="card-title">{nb.name}</div>
              <div className="card-subtitle">{nb.subject}</div>
              <button className="secondary" onClick={() => onEditNotebook(nb)}>Edit</button>
              <button className="secondary" onClick={() => onEnterNotebook(nb)}>Enter</button>
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <form className="form-container" onSubmit={handleCreate}>
          <h3 style={{ color: 'var(--black)' }}>Create Notebook</h3>
          {error && <div className="error-message">{error}</div>}
          <label htmlFor="name">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required />
          <label htmlFor="subject">Subject</label>
          <input name="subject" value={form.subject} onChange={handleChange} required />
          <button type="submit">Create</button>
          <button type="button" className="secondary" onClick={() => setShowForm(false)}>Cancel</button>
        </form>
      )}
    </div>
  );
}

export default Notebooks;