import { useNavigate, Link } from 'react-router-dom';
import { useState } from "react";
import type React from "react";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Separator } from "@/components/ui/Separator";
import { Label } from "@/components/ui/Label";
import { Mail, Lock, EyeOff, Eye } from "lucide-react";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(username, password);
      navigate("/dashboard"); // Redirige al dashboard si el login es exitoso
    } catch (err) {
      setError("Incorrect username or password. Please try again.");
      console.error("Fallo el inicio de sesión:", err);
    } finally {
      setLoading(false);
    }
  };

  // Función para el login con Google (a implementar en el futuro)
  const handleGoogleSignOn = () => {
    console.log("Iniciando sesión con Google...");
    // Aquí iría la lógica para el popup de Google
  };

  return (
    <Card className="w-full max-w-md border-0 bg-white/50 shadow-xl backdrop-blur-sm">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
        <CardDescription className="text-muted-foreground">
          Access your NoteQuest-AI account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* El 'onSubmit' ahora apunta a nuestra lógica interna */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Username or Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Your username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 border-border bg-input pl-10 focus:border-primary focus:ring-ring"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="*********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-border bg-input pl-10 pr-10 focus:border-primary focus:ring-ring"
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
          
          {/* Mostramos el mensaje de error si existe */}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-between text-sm">
            {/* ... Checkbox y link de olvidaste contraseña ... */}
          </div>

          <Button
            type="submit"
            className="h-11 w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
            <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground rounded-md">
              Or continue with
            </span>
            </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="h-11 w-full border-border bg-transparent hover:bg-[#F9DA58] hover:text-[#1B1725] transition-colors"
          onClick={handleGoogleSignOn}
        >
          {/* ... SVG de Google ... */}
          Continue with Google
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-primary hover:text-primary/80"
          >
            Create account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;