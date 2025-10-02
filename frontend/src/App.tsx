import { Route, Routes, Navigate } from "react-router-dom";
import AuthLayout from "@/components/features/layouts/AuthLayout";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import NotesPage from "@/pages/NotesPage";
import NotebooksPage from "@/pages/NotebooksPage";
import DashboardPage from "@/pages/DashboardPage";
import MainLayout from "@/components/features/layouts/MainLayout";
import ProtectedRoute from "@/router/ProtectedRoute";
import NoteListPage from "@/pages/NoteListPage";
import NoteEditorPage from "@/pages/NoteEditorPage";
import { NotebookProvider } from "@/context/NotebookContext";

function App() {
  // El div wrapper se ha eliminado para que los layouts controlen todo el estilo
  return (
    <Routes>

      {/* Rutas de Autenticación */}
      <Route index element={<Navigate to="/login" replace />} />
      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
      </Route>

      {/* Rutas Principales de la App */}
      <Route element={<ProtectedRoute />}>
        <Route element={<NotebookProvider><MainLayout /></NotebookProvider>}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="notebooks" element={<NotebooksPage />} />
          <Route path="notebooks/:notebookId/notes" element={<NoteListPage />} />
          <Route path="notes/:noteId" element={<NoteEditorPage />} />
          <Route path="upload" element={<div>upload works</div>} />
          <Route path="quizzes" element={<div>Quizzes works</div>} />
          <Route path="profile" element={<div>Profile works</div>} />
          
        </Route>
      </Route>
    </Routes>
  );
}

export default App;