import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import NotePage from './pages/NotePage/NotePage';
import LoginPage from './pages/LoginPage/LoginPage';
import SignupPage from './pages/SignupPage/SignupPage';

// --- Componentes de ejemplo para las páginas sin Layout ---
const Login = () => <h1 style={{ textAlign: 'center', marginTop: '5rem' }}>Página de Login</h1>;
const Signup = () => <h1 style={{ textAlign: 'center', marginTop: '5rem' }}>Página de Signup</h1>;
const Profile = () => <h1>Página de Perfil</h1>; // Otro ejemplo de página con Layout

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="home" element={<Home />} />
          <Route path="notes" element={<NotePage/>} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
