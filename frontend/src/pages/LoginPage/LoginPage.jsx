import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import styles from './LoginPage.module.css';
import logoImage from '../../assets/icons/logo.svg';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login(username, password);
      navigate('/'); // Redirige al dashboard después de un login exitoso
    } catch (err) {
      setError('El usuario o la contraseña son incorrectos.');
      console.error('Error de inicio de sesión:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.brandingSection}>
        <img src={logoImage} alt="NoteQuest AI Logo" className={styles.logo} />
        <h1>Bienvenido de nuevo</h1>
        <p>Inicia sesión para continuar creando notas.</p>
      </div>

      <div className={styles.formSection}>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <h2>¡Hola de nuevo!</h2>
          
          <div className={styles.inputGroup}>
            <label htmlFor="username">Nombre de usuario</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ej. juanperez"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;