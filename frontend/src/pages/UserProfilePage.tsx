import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Progress } from "@/components/ui/Progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tab";
import { Textarea } from "@/components/ui/TextArea";
import {
  Award,
  Bell,
  BookOpen,
  Brain,
  Calendar,
  Camera,
  Flame,
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
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import apiClient from '@/services/api';

const UserProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [totalNotebooks, setTotalNotebooks] = useState<number | null>(null);
  const [totalNotesAcrossNotebooks, setTotalNotesAcrossNotebooks] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    university: "",
    career: "",
    academic_year: "",
  });

  const fullName = useMemo(() => {
    return `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() || user?.username || "";
  }, [user]);

  const memberSince = useMemo(() => {
    const raw = user?.created_at || (user as any)?.date_joined || null;
    if (!raw) return "—";
    const d = new Date(raw);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [user]);

  // Obtener usuario desde el contexto de autenticación
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // racha desde user.stats (nuevo backend)
  const currentStreak = user?.stats?.streak_count || 0;
  const bestStreak = user?.stats?.best_streak || 0;
  const lastActiveDate = user?.stats?.last_active_date || null;
  // Sincronizar datos locales con el usuario autenticado cuando esté disponible
  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      name: fullName,
      bio: user.bio ?? "",
      university: (user as any).university ?? "",
      location: (user as any).location ?? "",
      career: (user as any).career ?? "",
      academic_year: (user as any).academic_year ?? "",
    }));
  }, [user, fullName]);

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
        bio: formData.bio,
        university: formData.university,
        location: formData.location,
        career: formData.career,
        academic_year: formData.academic_year,
      });

      const fullName = `${updated.first_name ?? ''} ${updated.last_name ?? ''}`.trim() || updated.username;

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
      name: user?.first_name ? `${user.first_name} ${user.last_name}`.trim() : user?.username || "",
      bio: user?.bio ? user.bio : "",
      location: user?.location ? user.location : "",
      university: user?.university ? user.university : "",
      career: user?.career ? user.career : "",
      academic_year: user?.academic_year ? user.academic_year : "",
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

  // const earnedAchievements = user.achievements.filter((a) => a.earned);
  // const pendingAchievements = user.achievements.filter((a) => !a.earned);
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
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-1">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          {/** Disabled for now: stats/achievements/settings */}
          {/**
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          */}
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
                        src={"/placeholder.svg"}
                      />
                      <AvatarFallback className="text-2xl">
                        {getInitials(fullName || "")}
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
                    <h2 className="text-xl font-semibold">{fullName}</h2>
                    <p className="text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Member since {memberSince}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.career}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {user?.bio}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/** Quick Stats disabled until backend provides these fields reliably
              <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-lg">Quick Summary</CardTitle>
                  </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {totalNotesAcrossNotebooks ?? user.stats.totalNotes}
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
                        {user?.stats.averageScore}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Average
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {user?.stats.studyStreak}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Streak Days
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              */}
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
                      <Label htmlFor="academic_year">Academic academic_year</Label>
                      <Input
                        id="academic_year"
                        value={formData.academic_year}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            academic_year: e.target.value,
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

        {/** Stats Tab disabled */}
        {/**
        <TabsContent value="stats" className="space-y-6">
          ...
        </TabsContent>
        */}

        {/** Achievements Tab disabled */}
        {/**
        <TabsContent value="achievements" className="space-y-6">
          ...
        </TabsContent>
        */}

        {/** Settings Tab disabled */}
        {/**
        <TabsContent value="settings" className="space-y-6">
          ...
        </TabsContent>
        */}
      </Tabs>
    </div>
  );
};

export default UserProfilePage;
