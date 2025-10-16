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
import FriendsPage from '@/pages/FriendsPage';
import AIToolsPage from "@/pages/AIToolsPage";
import UploadPage from "./pages/UploadPage";
import { NotebookProvider } from "@/context/NotebookContext";
import { Toaster } from "@/components/ui/toaster";
import UserProfilePage from "@/pages/UserProfilePage";

function App() {
  return (
    <>
      <Toaster />
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
          <Route path="friends" element={<FriendsPage />} />
          <Route path="notebooks" element={<NotebooksPage />} />
          <Route path="notebooks/:notebookId/notes" element={<NoteListPage />} />
          <Route path="notes/:noteId" element={<NoteEditorPage />} />
<<<<<<< HEAD
          <Route path="upload" element={<UploadPage />} />
          <Route path="quizzes" element={<AIToolsPage />} />
          <Route path="profile" element={<UserProfilePage />} />
=======
          <Route path="upload" element={<div>upload works</div>} />
          <Route path="quizzes" element={<div>Quizzes works</div>} />
          <Route path="profile" element={<UserProfilePage />} />
>>>>>>> 7f536ac (WIP: integrate local profile/notebooks changes)
          
        </Route>
      </Route>
    </Routes>
    </>
  );
}

export default App;