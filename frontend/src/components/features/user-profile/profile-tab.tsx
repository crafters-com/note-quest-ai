import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Calendar, Camera, Edit3, MapPin, Save } from "lucide-react";
import type React from "react";
import { useState } from "react";

export interface ProfileTabProps {
  handleCancel: (event: any) => void;
  handleSave: (event: any) => void;
}

// Mock user data
const mockUserData = {
  id: 1,
  name: "Paula Arroyave",
  email: "paula.arroyave@ejemplo.com",
  avatar: "",
  bio: "Estudiante de Ingeniería en Sistemas apasionada por la tecnología y el aprendizaje continuo.",
  location: "Colombia",
  joinDate: "2024-01-01",
  university: "EAFIT",
  career: "Ingeniería en Sistemas",
  year: "4er año",
  stats: {
    totalNotes: 24,
    totalQuizzes: 12,
    averageScore: 87,
    studyStreak: 15,
    totalStudyTime: 145,
    completedQuizzes: 12,
    favoriteSubject: "Programación",
  },
  achievements: [
    {
      id: 1,
      name: "Primer Quiz",
      description: "Completaste tu primer quiz",
      icon: "🎯",
      earned: true,
      date: "2024-01-02",
    },
    {
      id: 2,
      name: "Estudiante Dedicado",
      description: "15 días consecutivos estudiando",
      icon: "🔥",
      earned: true,
      date: "2024-01-15",
    },
    {
      id: 3,
      name: "Experto en IA",
      description: "Puntuación perfecta en quiz de IA",
      icon: "🤖",
      earned: true,
      date: "2024-01-10",
    },
    {
      id: 4,
      name: "Coleccionista",
      description: "Sube 50 apuntes",
      icon: "📚",
      earned: false,
      progress: 24,
    },
    {
      id: 5,
      name: "Maestro Quiz",
      description: "Completa 25 quizzes",
      icon: "🏆",
      earned: false,
      progress: 12,
    },
  ],
  preferences: {
    notifications: {
      email: true,
      push: true,
      quizReminders: true,
      studyReminders: false,
    },
    privacy: {
      profilePublic: false,
      showStats: true,
      showAchievements: true,
    },
    study: {
      defaultQuizDifficulty: "Intermedio",
      studyReminders: true,
      reminderTime: "18:00",
    },
  },
};

const ProfileTab: React.FC<ProfileTabProps> = (props) => {
  const { handleCancel, handleSave } = props;
  const [userData, setUserData] = useState(mockUserData);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userData.name,
    bio: userData.bio,
    location: userData.location,
    university: userData.university,
    career: userData.career,
    year: userData.year,
  });
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Profile Card */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader className="text-center">
            <div className="relative mx-auto">
              <Avatar className="h-24 w-24 mx-auto">
                <AvatarImage src={userData.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">
                  {getInitials(userData.name)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-transparent"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{userData.name}</h2>
              <p className="text-sm text-muted-foreground">{userData.email}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{userData.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Miembro desde{" "}
                  {new Date(userData.joinDate).toLocaleDateString("es-ES", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>{userData.career}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {userData.bio}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Resumen Rápido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {userData.stats.totalNotes}
                </div>
                <div className="text-xs text-muted-foreground">Apuntes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {userData.stats.completedQuizzes}
                </div>
                <div className="text-xs text-muted-foreground">Quizzes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {userData.stats.averageScore}%
                </div>
                <div className="text-xs text-muted-foreground">Promedio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {userData.stats.studyStreak}
                </div>
                <div className="text-xs text-muted-foreground">
                  Días seguidos
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Form */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Actualiza tu información de perfil
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografía</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bio: e.target.value,
                  }))
                }
                disabled={!isEditing}
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="university">Universidad</Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      university: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Año académico</Label>
                <Input
                  id="year"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      year: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="career">Carrera</Label>
              <Input
                id="career"
                value={formData.career}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    career: e.target.value,
                  }))
                }
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
