import { Brain, FileText } from "lucide-react";
import { Outlet } from "react-router-dom"; // Es mejor usar 'react-router-dom' para web

// --- Sub-componentes de la sección de Branding ---

const BrandLogo = () => (
  <div className="flex items-center justify-center gap-3 lg:justify-start">
    <div className="relative">
      <FileText className="h-8 w-8 text-primary" />
      <Brain className="absolute -right-1 -top-1 h-5 w-5 text-secondary" />
    </div>
    <h1 className="text-3xl font-bold text-foreground">NoteQuest-AI</h1>
  </div>
);

const WelcomeMessage = () => (
  <div className="space-y-4">
    <h2 className="text-balance text-4xl font-bold leading-tight lg:text-5xl">
      Bienvenido a <span className="text-primary">NoteQuest-AI</span>
    </h2>
    <p className="text-pretty mx-auto max-w-md text-lg leading-relaxed text-muted-foreground lg:mx-0">
      Transforma tus ideas en notas inteligentes con el poder de la inteligencia
      artificial. Organiza, busca y conecta tu conocimiento como nunca antes.
    </p>
  </div>
);

const FeatureHighlights = () => (
  <div className="mx-auto grid max-w-md grid-cols-1 gap-4 sm:grid-cols-3 lg:mx-0">
    <div className="rounded-lg bg-card/50 p-4 text-center">
      <div className="text-2xl font-bold text-primary">AI</div>
      <div className="text-sm text-muted-foreground">Powered</div>
    </div>
    <div className="rounded-lg bg-card/50 p-4 text-center">
      <div className="text-2xl font-bold text-primary">Smart</div>
      <div className="text-sm text-muted-foreground">Search</div>
    </div>
    <div className="rounded-lg bg-card/50 p-4 text-center">
      <div className="text-2xl font-bold text-primary">Auto</div>
      <div className="text-sm text-muted-foreground">Organize</div>
    </div>
  </div>
);

// --- Componente que agrupa la sección de Branding ---

const AuthBranding = () => (
  <div className="space-y-8 text-center lg:text-left">
    <BrandLogo />
    <WelcomeMessage />
    <FeatureHighlights />
  </div>
);

// --- El Layout Principal (ahora mucho más limpio) ---

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 via-card to-muted">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          {/* Lado izquierdo - Branding */}
          <AuthBranding />
          {/* Lado derecho - Formulario (Login, Signup, etc.) */}
          <div className="flex justify-center lg:justify-end">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;