import { Play, Trophy } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Link } from "react-router-dom";

const mockQuestions = [
  {
    id: 1,
    question: "What is JSX in React?",
    options: [
      "A separate programming language",
      "A syntax extension for JavaScript",
      "A CSS library",
      "A backend framework",
    ],
    correctAnswer: 1,
    timeLimit: 20,
  },
  {
    id: 2,
    question: "What's the correct way to create a functional component?",
    options: [
      "function MyComponent() { return <div>Hello</div>; }",
      "const MyComponent = () => { return <div>Hello</div>; }",
      "class MyComponent extends React.Component",
      "Both A and B are correct",
    ],
    correctAnswer: 3,
    timeLimit: 20,
  },
];

const mockPlayers = [
  { id: 1, name: "Test1", avatar: "AG", joinedAt: Date.now() },
  { id: 2, name: "Test2", avatar: "CL", joinedAt: Date.now() },
  { id: 3, name: "Test3", avatar: "MT", joinedAt: Date.now() },
  { id: 4, name: "Test4", avatar: "PR", joinedAt: Date.now() },
];

export const KahootResult = () => {
  const [players, setPlayers] = useState(mockPlayers);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [playerAnswers, setPlayerAnswers] = useState<{
    [key: number]: { answer: number; time: number };
  }>({});

  const calculateScores = () => {
    const scores: { [key: number]: number } = {};
    players.forEach((player) => {
      let totalScore = 0;
      mockQuestions.forEach((q, index) => {
        if (index <= currentQuestionIndex) {
          const answer = playerAnswers[player.id];
          if (answer && answer.answer === q.correctAnswer) {
            const timeBonus = Math.floor((1 - answer.time / q.timeLimit) * 500);
            totalScore += 1000 + timeBonus;
          }
        }
      });
      scores[player.id] = totalScore;
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
        <h1 className="text-4xl font-bold">Game Over!</h1>
        <p className="text-xl text-muted-foreground">Here are the winners</p>
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
      <div className="flex gap-4">
        <Button variant="outline" className="flex-1 bg-transparent" asChild>
          <Link to="/quizzes">View All Quizzes</Link>
        </Button>
        <Button className="flex-1" asChild>
          <Link to="/quizzes/live">
            <Play className="mr-2 h-4 w-4" />
            New Game
          </Link>
        </Button>
      </div>
    </div>
  );
};