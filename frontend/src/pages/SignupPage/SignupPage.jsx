import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import styles from './SignupPage.module.css'; // Usaremos un CSS similar al de login
import logoImage from '../../assets/icons/logo.svg';

function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // 1. Intentamos registrar al usuario
      await authService.signup(formData);
      // 2. Si el registro es exitoso, intentamos iniciar sesión automáticamente
      await authService.login(formData.username, formData.password);
      // 3. Redirigimos al dashboard
      navigate('/');
    } catch (err) {
      setError('Error al registrar. El usuario o email podría ya existir.');
      console.error('Error de registro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.signupPage}>
      <div className={styles.brandingSection}>
        <img src={logoImage} alt="NoteQuest AI Logo" className={styles.logo} />
        <h1>Bienvenido a tu nuevo creador de notas favorito</h1>
      </div>

      <div className={styles.formSection}>
        <form onSubmit={handleSubmit} className={styles.signupForm}>
          <h2>¡Bienvenido a NoteQuest!</h2>
          {/* Campos del formulario */}
          <input name="first_name" onChange={handleChange} placeholder="Nombre completo" required />
          <input name="last_name" onChange={handleChange} placeholder="Apellidos" required />
          <input name="username" onChange={handleChange} placeholder="Nombre de usuario" required />
          <input name="email" type="email" onChange={handleChange} placeholder="Correo electrónico" required />
          <input name="password" type="password" onChange={handleChange} placeholder="Contraseña" required />
          <input name="confirmPassword" type="password" onChange={handleChange} placeholder="Confirmar contraseña" required />

          {error && <p className={styles.errorMessage}>{error}</p>}

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;