import React, { useState } from 'react';
import { login, register, logout } from './apiUsers';

function Users({ onLoginSuccess }) {
  const [view, setView] = useState('login'); // 'login' | 'register' | 'profile'
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    first_name: '',
    last_name: ''
  });
  const [token, setToken] = useState('');
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    try {
      const data = await login(form.username, form.password);
      setToken(data.token);
      setView('profile');
      onLoginSuccess(data.token);
      // Usamos los datos del formulario como perfil básico
      setProfile({
        username: form.username,
        email: '', // No disponible desde login, puedes guardar en localStorage si lo necesitas
        first_name: '',
        last_name: ''
      });
    } catch (err) {
      setError('Login failed. Check your credentials.');
    }
  };

  const handleRegister = async e => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      setView('login');
      setForm({
        username: '',
        password: '',
        email: '',
        first_name: '',
        last_name: ''
      });
    } catch (err) {
      setError('Registration failed. Try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout(token);
    } catch (err) {
      // ignore error
    }
    setToken('');
    setProfile(null);
    setView('login');
    setForm({
      username: '',
      password: '',
      email: '',
      first_name: '',
      last_name: ''
    });
    onLoginSuccess('');
  };

  return (
    <div style={{ maxWidth: 400, margin: '2em auto' }}>
      {view === 'login' && (
        <form className="form-container" onSubmit={handleLogin}>
          <h2 style={{ color: 'var(--green)' }}>Login</h2>
          {error && <div className="error-message">{error}</div>}
          <label htmlFor="username">Username</label>
          <input name="username" value={form.username} onChange={handleChange} required />
          <label htmlFor="password">Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
          <button type="submit">Login</button>
          <button type="button" className="secondary" onClick={() => setView('register')}>Register</button>
        </form>
      )}
      {view === 'register' && (
        <form className="form-container" onSubmit={handleRegister}>
          <h2 style={{ color: 'var(--green)' }}>Register</h2>
          {error && <div className="error-message">{error}</div>}
          <label htmlFor="username">Username</label>
          <input name="username" value={form.username} onChange={handleChange} required />
          <label htmlFor="email">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
          <label htmlFor="first_name">First Name</label>
          <input name="first_name" value={form.first_name} onChange={handleChange} required />
          <label htmlFor="last_name">Last Name</label>
          <input name="last_name" value={form.last_name} onChange={handleChange} required />
          <label htmlFor="password">Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
          <button type="submit">Register</button>
          <button type="button" className="secondary" onClick={() => setView('login')}>Back to Login</button>
        </form>
      )}
      {view === 'profile' && profile && (
        <div className="form-container">
          <h2 style={{ color: 'var(--green)' }}>Welcome, {profile.username}!</h2>
          <button className="logout" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default Users;