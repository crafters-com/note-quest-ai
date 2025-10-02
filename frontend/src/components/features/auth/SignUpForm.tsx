import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "@/services/authService";
import axios from "axios";

// --- Importamos todos tus componentes de UI ---
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
import { Mail, Lock, EyeOff, Eye, User } from "lucide-react";

const SignUpForm = () => {
  // 1. Estado interno para el formulario
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    birth_date: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 2. Manejador para actualizar el estado del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // 3. Lógica para manejar el envío del formulario
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    // Validación de contraseñas
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      await authService.signup({
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        birth_date: formData.birth_date || undefined,
        
      });
      // Si el registro es exitoso, redirigir a login
      navigate("/login");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const errorData = err.response.data;
        // Extrae el primer mensaje de error de la respuesta del backend
        const firstErrorKey = Object.keys(errorData)[0];
        const errorMessage = errorData[firstErrorKey][0];
        setError(errorMessage || "Ocurrió un error. Por favor, revisa los datos.");
      } else {
        setError("No se pudo conectar con el servidor. Inténtalo más tarde.");
      }
      console.error("Fallo el registro:", err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md border-0 bg-card/95 shadow-xl backdrop-blur-sm">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
        <CardDescription className="text-muted-foreground">
          Únete a NoteQuest-AI y comienza tu viaje
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre</Label>
              <Input
                id="first_name"
                placeholder="Tu nombre"
                value={formData.first_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Apellidos</Label>
              <Input
                id="last_name"
                placeholder="Tus apellidos"
                value={formData.last_name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Nombre de usuario</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="Tu nombre de usuario"
                value={formData.username}
                onChange={handleInputChange}
                className="h-11 border-border bg-input pl-10" required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                value={formData.email}
                onChange={handleInputChange}
                className="h-11 border-border bg-input pl-10" required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="birth_date">Fecha de Nacimiento (Opcional)</Label>
            <Input
              id="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={handleInputChange}
                className="h-11 border-border bg-input pl-10 pr-10" required minLength={8}
              />
              <Button type="button" variant="outline" size="sm" className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 p-0" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirma tu contraseña"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="h-11 border-border bg-input pl-10 pr-10" required
              />
               <Button type="button" variant="outline" size="sm" className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 p-0" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          
          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">O regístrate con</span>
          </div>
        </div>

        {/* ... Botón de Google ... */}
        
        <div className="text-center text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login" className="font-medium text-primary hover:text-primary/80">
            Iniciar sesión
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignUpForm;