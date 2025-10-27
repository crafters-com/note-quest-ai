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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tab";
import { Textarea } from "@/components/ui/textarea";
import {
  Award,
  Bell,
  BookOpen,
  Brain,
  Calendar,
  Camera,
  Clock,
  Edit3,
  FileText,
  HelpCircle,
  Mail,
  MapPin,
  Save,
  Settings,
  Shield,
  Target,
  Trash2,
  Trophy,
  User,
} from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import apiClient from '@/services/api';

// Mock user data
const mockUserData = {
  id: 1,
  name: "Paula Arroyave",
  email: "paula.arroyave@ejemplo.com",
  avatar: "",
  bio: "Systems Engineering student passionate about technology and continuous learning.",
  location: "Medellín, Colombia",
  joinDate: "2024-01-01",
  university: "EAFIT",
  career: "Systems Engineering",
  year: "3rd year",
  stats: {
    totalNotes: 24,
    totalQuizzes: 12,
    averageScore: 87,
    studyStreak: 15,
    totalStudyTime: 145,
    completedQuizzes: 12,
  favoriteSubject: "Programming",
  },
  achievements: [
    {
      id: 1,
  name: "First Quiz",
  description: "You completed your first quiz",
      icon: "🎯",
      earned: true,
      date: "2024-01-02",
    },
    {
      id: 2,
  name: "Dedicated Student",
  description: "15 consecutive days of studying",
      icon: "🔥",
      earned: true,
      date: "2024-01-15",
    },
    {
      id: 3,
  name: "AI Expert",
  description: "Perfect score on AI quiz",
      icon: "🤖",
      earned: true,
      date: "2024-01-10",
    },
    {
      id: 4,
  name: "Collector",
  description: "Upload 50 notes",
      icon: "📚",
      earned: false,
      progress: 24,
    },
    {
      id: 5,
  name: "Quiz Master",
  description: "Complete 25 quizzes",
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
  defaultQuizDifficulty: "Intermediate",
      studyReminders: true,
      reminderTime: "18:00",
    },
  },
};

const UserProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(mockUserData);
  const [totalNotebooks, setTotalNotebooks] = useState<number | null>(null);
  const [totalNotesAcrossNotebooks, setTotalNotesAcrossNotebooks] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: userData.name,
    bio: userData.bio,
    location: userData.location,
    university: userData.university,
    career: userData.career,
    year: userData.year,
  });

  // Obtener usuario desde el contexto de autenticación
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sincronizar datos locales con el usuario autenticado cuando esté disponible
  useEffect(() => {
    if (!user) return;
    const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.username;
    setUserData((prev) => ({
      ...prev,
      name: fullName,
      email: user.email ?? prev.email,
      // Mantener resto de campos locales (bio, stats, etc.) hasta que el backend los exponga
      university: (user as any).university ?? prev.university,
      location: (user as any).location ?? prev.location,
      career: (user as any).career ?? prev.career,
      year: (user as any).academic_year ?? prev.year,
    }));
    setFormData((prev) => ({
      ...prev,
      name: fullName,
      university: (user as any).university ?? prev.university,
      location: (user as any).location ?? prev.location,
      career: (user as any).career ?? prev.career,
      year: (user as any).academic_year ?? prev.year,
    }));
  }, [user]);

  // Fetch user's notebooks and compute totals (use apiClient so token is included)
  useEffect(() => {
    if (!user) return;
    const fetchNotebooks = async () => {
      try {
        const res = await apiClient.get('/notebooks/');
        let data = res.data;
        // Support both list responses and paginated responses (DRF: { count, next, previous, results })
        const notebooksList = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.items)
          ? data.items
          : [];
        // Assuming the API returns a list of notebooks with `user` id field and `note_count`
        const myNotebooks = notebooksList.filter((nb: any) => nb.user === user.id);
        const notebooksCount = myNotebooks.length;
        const notesSum = myNotebooks.reduce((acc: number, nb: any) => acc + (nb.note_count || 0), 0);
        setTotalNotebooks(notebooksCount);
        setTotalNotesAcrossNotebooks(notesSum);
      } catch (err: any) {
        // If backend returns HTML (e.g., because of redirect or missing auth), log status/text when possible
        console.error('Error fetching notebooks:', err);
        if (err.response && err.response.data) {
          console.error('Response data:', err.response.data);
        }
        setTotalNotebooks(null);
        setTotalNotesAcrossNotebooks(null);
      }
    };

    fetchNotebooks();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      // Split full name into first_name and last_name (simple heuristic)
      const parts = formData.name.trim().split(/\s+/);
      const first_name = parts.slice(0, -1).join(' ') || parts[0] || '';
      const last_name = parts.length > 1 ? parts[parts.length - 1] : '';

      const updated = await updateUser({
        first_name,
        last_name,
        university: formData.university,
        location: formData.location,
        career: formData.career,
        academic_year: formData.year,
      });

      const fullName = `${updated.first_name ?? ''} ${updated.last_name ?? ''}`.trim() || updated.username;

      setUserData((prev) => ({
        ...prev,
        ...formData,
        name: fullName,
        email: updated.email ?? prev.email,
      }));
      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to save user:', err);
      setSaveError(err?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: userData.name,
      bio: userData.bio,
      location: userData.location,
      university: userData.university,
      career: userData.career,
      year: userData.year,
    });
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const earnedAchievements = userData.achievements.filter((a) => a.earned);
  const pendingAchievements = userData.achievements.filter((a) => !a.earned);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="relative mx-auto">
                    <Avatar className="h-24 w-24 mx-auto">
                      <AvatarImage
                        src={userData.avatar || "/placeholder.svg"}
                      />
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
                    <p className="text-sm text-muted-foreground">
                      {userData.email}
                    </p>
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
                        Member since {" "}
                        {new Date(userData.joinDate).toLocaleDateString(
                          "en-US",
                          { month: "long", year: "numeric" }
                        )}
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
                    <CardTitle className="text-lg">Quick Summary</CardTitle>
                  </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {totalNotesAcrossNotebooks ?? userData.stats.totalNotes}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total Notes
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {totalNotebooks ?? 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Notebooks
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {userData.stats.averageScore}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Average
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {userData.stats.studyStreak}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Streak Days
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
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your profile information
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full name</Label>
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
                      <Label htmlFor="location">Location</Label>
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
                    <Label htmlFor="bio">Biography</Label>
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
                      <Label htmlFor="university">University</Label>
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
                      <Label htmlFor="year">Academic year</Label>
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
                    <Label htmlFor="career">Major</Label>
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
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {userData.stats.totalNotes}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Notes uploaded
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <HelpCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {userData.stats.completedQuizzes}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Completed quizzes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {userData.stats.averageScore}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Average score
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {userData.stats.totalStudyTime}h
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Study time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                <CardTitle>Study Progress</CardTitle>
                <CardDescription>
                  Your activity in the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current streak</span>
                    <span className="font-semibold">
                      {userData.stats.studyStreak} days
                    </span>
                  </div>
                  <Progress
                    value={(userData.stats.studyStreak / 30) * 100}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Monthly quizzes goal</span>
                    <span className="font-semibold">
                      {userData.stats.completedQuizzes}/20
                    </span>
                  </div>
                  <Progress
                    value={(userData.stats.completedQuizzes / 20) * 100}
                    className="h-2"
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-primary" />
                    <span>
                      Favorite subject: {" "}
                      <strong>{userData.stats.favoriteSubject}</strong>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance by Subject</CardTitle>
                <CardDescription>
                  Average scores by study area
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { subject: "Programming", score: 92, color: "bg-blue-500" },
                  { subject: "Mathematics", score: 88, color: "bg-green-500" },
                  { subject: "Chemistry", score: 85, color: "bg-purple-500" },
                  { subject: "Art", score: 82, color: "bg-pink-500" },
                ].map((item) => (
                  <div key={item.subject} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.subject}</span>
                      <span className="font-semibold">{item.score}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Earned Achievements */}
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Earned Achievements ({earnedAchievements.length})
                </CardTitle>
                <CardDescription>
                  Celebrate your successes and milestones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {earnedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200"
                  >
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-800">
                        {achievement.name}
                      </h4>
                      <p className="text-sm text-yellow-700">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Earned on {" "}
                        {new Date(achievement.date!).toLocaleDateString("en-US")}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Pending Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-muted-foreground" />
                  Upcoming Achievements ({pendingAchievements.length})
                </CardTitle>
                <CardDescription>
                  Goals to reach and your current progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-start gap-3 p-3 rounded-lg border"
                  >
                    <div className="text-2xl opacity-50">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{achievement.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                      {achievement.progress && (
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{achievement.progress}/50</span>
                          </div>
                          <Progress
                            value={(achievement.progress / 50) * 100}
                            className="h-1"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Notifications */}
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Configure how you'd like to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates by email
                    </p>
                  </div>
                  <Switch
                    defaultChecked={userData.preferences.notifications.email}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Real-time alerts
                    </p>
                  </div>
                  <Switch
                    defaultChecked={userData.preferences.notifications.push}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Quiz reminders</p>
                    <p className="text-sm text-muted-foreground">
                      We'll notify you when new quizzes are available
                    </p>
                  </div>
                  <Switch
                    defaultChecked={
                      userData.preferences.notifications.quizReminders
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Study reminders</p>
                    <p className="text-sm text-muted-foreground">
                      Keep your study streak going
                    </p>
                  </div>
                  <Switch
                    defaultChecked={
                      userData.preferences.notifications.studyReminders
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy
                </CardTitle>
                <CardDescription>
                  Control visibility of your information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Public profile</p>
                    <p className="text-sm text-muted-foreground">
                      Other users can see your profile
                    </p>
                  </div>
                  <Switch
                    defaultChecked={userData.preferences.privacy.profilePublic}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show stats</p>
                    <p className="text-sm text-muted-foreground">
                      Share your achievements and progress
                    </p>
                  </div>
                  <Switch
                    defaultChecked={userData.preferences.privacy.showStats}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show achievements</p>
                    <p className="text-sm text-muted-foreground">
                      Allow others to view your achievements
                    </p>
                  </div>
                  <Switch
                    defaultChecked={
                      userData.preferences.privacy.showAchievements
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Study Preferences */}
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Study Preferences
                </CardTitle>
                <CardDescription>
                  Personalize your learning experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default quiz difficulty</Label>
                  <Select
                    defaultValue={
                      userData.preferences.study.defaultQuizDifficulty
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Reminder time</Label>
                  <Input
                    type="time"
                    defaultValue={userData.preferences.study.reminderTime}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account
                </CardTitle>
                <CardDescription>Manage your account and data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Change password
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  <User className="mr-2 h-4 w-4" />
                  Download my data
                </Button>

                <Button variant="destructive" className="w-full justify-start">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete account
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfilePage;
