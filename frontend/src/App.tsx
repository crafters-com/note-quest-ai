import { Route, Routes } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import LoginPage from "@/pages/LoginPage/LoginPage";
import SignupPage from "@/pages/SignupPage/SignupPage";
import MainLayout from "@/layouts/MainLayout";

function App() {
  // El div wrapper se ha eliminado para que los layouts controlen todo el estilo
  return (
    <Routes>
      <Route index element={<p>Home</p>} />

      {/* Rutas de Autenticación */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="sign-up" element={<SignupPage />} />
      </Route>

      {/* Rutas Principales de la App */}
      <Route element={<MainLayout />}>
        <Route path="dashboard" element={<div>dashboard works</div>} />
        {/* <Route path="notes" element={<NotesPage />} /> */}
        <Route path="upload" element={<div>upload works</div>} />
        <Route path="quizzes" element={<div>Quizzes works</div>} />
        <Route path="profile" element={<div>Profile works</div>} />
      </Route>
    </Routes>
  );
}

export default App;