import { Play, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import {   } from "../ui/Button";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { friendshipService } from "@/services/friendshipService";

// Scores are based on daily streak; mock questions removed.

// Helper to get initials
const getInitials = (name: string) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
};

export const KahootResult = () => {
  const { user } = useAuth();
  const fullName = useMemo(() => {
    const fn = [user?.first_name, user?.last_name].filter(Boolean).join(" ");
    return fn || user?.username || "Invitado";
  }, [user]);

  const [players, setPlayers] = useState<Array<{ id: number; name: string; avatar: string; joinedAt: number; streak_count?: number; best_streak?: number }>>([]);

  // Seed players with the real, logged-in user
  useEffect(() => {
    if (!user) return;
    const me = {
      id: user.id,
      name: fullName,
      avatar: getInitials(fullName || "?"),
      joinedAt: Date.now(),
      streak_count: user?.stats?.streak_count ?? 0,
      best_streak: user?.stats?.best_streak ?? 0,
    };
    setPlayers([me]);
  }, [user, fullName]);

  // Load accepted friends as players as well
  useEffect(() => {
    if (!user) return;
    const loadFriends = async () => {
      try {
        const res = await friendshipService.getFriends();
        const friends = (res.data || []).map((fr: any) => fr.friend);
        const playersFromFriends = friends.map((f: any) => {
          const name = [f?.first_name, f?.last_name].filter(Boolean).join(" ") || f?.username || "Usuario";
          return {
            id: f.id as number,
            name,
            avatar: getInitials(name || f?.username || "?"),
            joinedAt: Date.now(),
            streak_count: f?.stats?.streak_count ?? 0,
            best_streak: f?.stats?.best_streak ?? 0,
          };
        });
        // Deduplicate by id and merge with current players
        setPlayers((prev) => {
          const byId = new Map<number, { id: number; name: string; avatar: string; joinedAt: number }>();
          [...prev, ...playersFromFriends].forEach((p) => byId.set(p.id, p as any));
          return Array.from(byId.values()) as any;
        });
      } catch (e) {
        console.warn("No se pudo cargar la lista de amigos para KahootResult:", e);
      }
    };
    loadFriends();
  }, [user]);

  const calculateScores = () => {
    const scores: { [key: number]: number } = {};
    players.forEach((player) => {
      const streak = player.streak_count ?? 0;
      // Simple formula: 1000 points per day in current streak
      scores[player.id] = streak * 1000;
    });
    return scores;
  };

  const getTopPlayers = () => {
    const scores = calculateScores();
    return players
      .map((player) => ({
        ...player,
        score: scores[player.id] || 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  const topPlayers = getTopPlayers();
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Best scores</h1>
        <p className="text-xl text-muted-foreground">Here are the best students</p>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-4 py-8">
        {/* Second Place */}
        {topPlayers[1] && (
          <div className="flex flex-col items-center">
            <Trophy className="h-12 w-12 text-gray-400 mb-2" />
            <div className="text-center mb-4">
              <div className="text-2xl font-bold">{topPlayers[1].name}</div>
              <div className="text-xl text-gray-600">
                {topPlayers[1].score.toLocaleString()} pts
              </div>
            </div>
            <div className="w-48 h-32 bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-xl flex items-center justify-center">
              <div className="text-6xl font-bold text-white">2</div>
            </div>
          </div>
        )}

        {/* First Place */}
        {topPlayers[0] && (
          <div className="flex flex-col items-center -mt-8">
            <Trophy className="h-16 w-16 text-yellow-500 mb-2 animate-bounce" />
            <div className="text-center mb-4">
              <div className="text-3xl font-bold">{topPlayers[0].name}</div>
              <div className="text-2xl text-yellow-600">
                {topPlayers[0].score.toLocaleString()} pts
              </div>
            </div>
            <div className="w-48 h-48 bg-gradient-to-t from-yellow-400 to-yellow-500 rounded-t-xl flex items-center justify-center shadow-2xl">
              <div className="text-7xl font-bold text-white">1</div>
            </div>
          </div>
        )}

        {/* Third Place */}
        {topPlayers[2] && (
          <div className="flex flex-col items-center">
            <Trophy className="h-10 w-10 text-orange-600 mb-2" />
            <div className="text-center mb-4">
              <div className="text-xl font-bold">{topPlayers[2].name}</div>
              <div className="text-lg text-orange-600">
                {topPlayers[2].score.toLocaleString()} pts
              </div>
            </div>
            <div className="w-48 h-24 bg-gradient-to-t from-orange-400 to-orange-500 rounded-t-xl flex items-center justify-center">
              <div className="text-5xl font-bold text-white">3</div>
            </div>
          </div>
        )}
      </div>

      {/* All Players Rankings */}
      <Card>
        <CardHeader>
          <CardTitle>Full Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {players
              .map((player) => ({
                ...player,
                score: calculateScores()[player.id] || 0,
              }))
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index < 3
                      ? "bg-primary/10 border-2 border-primary/20"
                      : "bg-accent"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                        index < 3
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="font-semibold text-lg">{player.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl text-primary">
                      {player.score.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">points</div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {/* <div className="flex gap-4">
        <Button variant="outline" className="flex-1 bg-transparent" asChild>
          <Link to="/quizzes">View All Quizzes</Link>
        </Button>
        <Button className="flex-1" asChild>
          <Link to="/quizzes/live">
            <Play className="mr-2 h-4 w-4" />
            New Game
          </Link>
        </Button>
      </div> */}
    </div>
  );
};