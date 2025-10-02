import { MobileSidebar, Sidebar } from "@/components/ui/Sidebar";
import { Outlet } from "react-router-dom";

// --- Sub-componente para la cabecera en móviles ---

const MobileHeader = () => (
  <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-card px-4 shadow-sm xl:hidden">
    <MobileSidebar />
    <div className="flex-1 text-sm font-semibold leading-6 text-foreground">
      NoteQuest-AI
    </div>
  </header>
);

// --- Sub-componente para el contenido principal ---

const MainContent = () => (
  <main className="flex-1">
    <div className="px-4 py-6 lg:px-8">
      <Outlet />
    </div>
  </main>
);

// --- El Layout Principal (ahora más declarativo) ---

const MainLayout = () => {
  return (
    <div className="min-h-screen w-full bg-background">
      {/* Sidebar para escritorio (siempre visible) */}
      <Sidebar />

      {/* Contenido principal con desplazamiento izquierdo en escritorio */}
      <div className="xl:pl-64">
        <MobileHeader />
        <MainContent />
      </div>
    </div>
  );
};

export default MainLayout;