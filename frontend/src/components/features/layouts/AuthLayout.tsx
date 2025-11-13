import { Outlet } from "react-router-dom";
import LogoSvg from "@/assets/icons/logo.svg";

// --- Sub-componentes de la sección de Branding ---

const BrandLogo = () => (
  <div className="flex items-center gap-3">
    <img src={LogoSvg} alt="NoteQuest-AI Logo" className="h-12 w-12" />
    <h1 className="text-3xl font-bold text-foreground">NoteQuest-AI</h1>
  </div>
);

const WelcomeMessage = () => (
  <div className="space-y-4">
    <h2 className="text-balance text-4xl font-bold leading-tight lg:text-5xl">
      Welcome to <span className="text-primary">NoteQuest-AI</span>
    </h2>
    <p className="text-pretty max-w-md text-lg leading-relaxed">
      Now you will note the difference
    </p>
    <p className="text-pretty max-w-md text-lg leading-relaxed text-muted-foreground">
      Transform your ideas into intelligent notes with the power of artificial
      intelligence. Organize, search, and connect your knowledge like never before.
    </p>
  </div>
);

const FeatureHighlights = () => (
  <div className="flex flex-wrap gap-4 max-w-lg">
    <div className="rounded-lg bg-white/80 backdrop-blur-sm border border-white/20 p-4 text-center shadow-sm min-w-24 flex-1">
      <div className="text-2xl font-bold text-primary">AI</div>
      <div className="text-sm text-muted-foreground">Powered</div>
    </div>
    <div className="rounded-lg bg-white/80 backdrop-blur-sm border border-white/20 p-4 text-center shadow-sm min-w-24 flex-1">
      <div className="text-2xl font-bold text-primary">Smart</div>
      <div className="text-sm text-muted-foreground">Search</div>
    </div>
    <div className="rounded-lg bg-white/80 backdrop-blur-sm border border-white/20 p-4 text-center shadow-sm min-w-24 flex-1">
      <div className="text-2xl font-bold text-primary">Auto</div>
      <div className="text-sm text-muted-foreground">Organize</div>
    </div>
  </div>
);

// --- Componente que agrupa la sección de Branding ---

const AuthBranding = () => (
  <div className="space-y-8">
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