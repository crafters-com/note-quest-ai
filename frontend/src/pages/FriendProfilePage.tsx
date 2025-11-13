import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Calendar, Clock, Flame, MapPin, Trophy, BookOpen } from "lucide-react";
import { friendshipService } from "@/services/friendshipService";

type FriendUser = {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  bio?: string | null;
  university?: string | null;
  location?: string | null;
  career?: string | null;
  academic_year?: string | null;
  created_at?: string | null;
  stats?: {
    streak_count: number;
    best_streak: number;
    last_active_date: string | null;
  } | null;
};

const FriendProfilePage: React.FC = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const location = useLocation();
  const initialFriend = (location.state as any)?.friend as FriendUser | undefined;
  const [friend, setFriend] = useState<FriendUser | null>(initialFriend ?? null);

  useEffect(() => {
    if (initialFriend) return; // already have data
    // Fallback: load friends and find by id
    const load = async () => {
      try {
        const res = await friendshipService.getFriends();
        const list: any[] = res.data || [];
        const match = list.map((fr: any) => fr.friend).find((f) => String(f.id) === String(friendId));
        if (match) setFriend(match);
      } catch (e) {
        console.warn("Could not fetch friend profile:", e);
      }
    };
    if (friendId && !friend) load();
  }, [friendId, initialFriend]);

  const fullName = useMemo(() => {
    if (!friend) return "";
    return `${friend.first_name ?? ""} ${friend.last_name ?? ""}`.trim() || friend.username;
  }, [friend]);

  const memberSince = useMemo(() => {
    const raw = friend?.created_at || null;
    if (!raw) return "—";
    const d = new Date(raw);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [friend]);

  const currentStreak = friend?.stats?.streak_count || 0;
  const bestStreak = friend?.stats?.best_streak || 0;
  const lastActiveDate = friend?.stats?.last_active_date || null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (!friend) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">View user information</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card (read-only) */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="relative mx-auto">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src={"/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(fullName || "")}
                  </AvatarFallback>
                </Avatar>
                {/* No edit button on public profile */}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">{fullName}</h2>
                <p className="text-sm text-muted-foreground">{friend.email}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{friend.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Member since {memberSince}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{friend.career}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {friend.bio}
                </p>
              </div>

              {/* Stats */}
              <div className="pt-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="flex flex-col items-center">
                    <Flame className="h-5 w-5 text-orange-500 mb-1" />
                    <div className="text-xl font-bold">{currentStreak}</div>
                    <div className="text-xs text-muted-foreground">Current Streak</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <Trophy className="h-5 w-5 text-yellow-500 mb-1" />
                    <div className="text-xl font-bold">{bestStreak}</div>
                    <div className="text-xs text-muted-foreground">Best Streak</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <Clock className="h-5 w-5 text-primary mb-1" />
                    <div className="text-sm font-medium">
                      {lastActiveDate
                        ? new Date(lastActiveDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">Last Active</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column reserved for future public info (read-only) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">About</h3>
                <p className="text-sm text-muted-foreground">
                  {friend.university || friend.academic_year || friend.location
                    ? "Basic information"
                    : "No additional information"}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {friend.university && (
                <div>
                  <span className="text-muted-foreground">University: </span>
                  <span className="font-medium">{friend.university}</span>
                </div>
              )}
              {friend.academic_year && (
                <div>
                  <span className="text-muted-foreground">Academic year: </span>
                  <span className="font-medium">{friend.academic_year}</span>
                </div>
              )}
              {friend.location && (
                <div>
                  <span className="text-muted-foreground">Location: </span>
                  <span className="font-medium">{friend.location}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FriendProfilePage;