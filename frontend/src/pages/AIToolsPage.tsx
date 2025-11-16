import React, { useState, useEffect } from "react";
import axios from "axios";
import { generateSummary, generateQuiz } from "@/apiAITools";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { QuizCard } from "@/components/features/ai/QuizCard";
import { Sparkles, FileText, Brain, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

// Importar los componentes del select correctamente
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

export default function AIToolsPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>("");
  const [summary, setSummary] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<any[] | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // 🔹 Cargar notas del usuario al iniciar
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setErrorMessage("User not authenticated.");
          setLoadingNotes(false);
          return;
        }

        const res = await axios.get("http://34.192.63.231:8000/api/notes/", {
          headers: { Authorization: `Token ${token}` },
        });

        // Manejar respuesta paginada
        if (res.data && Array.isArray(res.data.results)) {
          setNotes(res.data.results); // Extraer las notas del campo `results`
        } else {
          console.error("Unexpected response:", res.data);
          setErrorMessage("Unexpected response format from server.");
        }
      } catch (err) {
        console.error("Error fetching notes:", err);
        setErrorMessage("Error loading notes. Please refresh.");
      } finally {
        setLoadingNotes(false);
      }
    };

    fetchNotes();
  }, []);

  // 🔹 Generar resumen
  const handleGenerateSummary = async () => {
    if (!selectedNoteId) return;
    setLoadingSummary(true);
    setErrorMessage("");
    setSummary(null);

    try {
      const result = await generateSummary(selectedNoteId);
      // Si el backend devuelve { summary: "texto" }
      setSummary(result.summary || result);
    } catch (err) {
      console.error("Error generating summary:", err);
      setErrorMessage("Error generating summary. Please try again.");
    } finally {
      setLoadingSummary(false);
    }
  };

  // 🔹 Generar quiz
  const handleGenerateQuiz = async () => {
    if (!selectedNoteId) return;
    setLoadingQuiz(true);
    setErrorMessage("");
    setQuiz(null);

    try {
      const result = await generateQuiz(selectedNoteId);
      // Si el backend devuelve { quiz: [...] }
      setQuiz(result.quiz || result);
    } catch (err) {
      console.error("Error generating quiz:", err);
      setErrorMessage("Error generating quiz. Please try again.");
    } finally {
      setLoadingQuiz(false);
    }
  };

  // 🔹 Render principal
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Tools</h1>
            <p className="text-muted-foreground text-sm">
              Generate summaries and quizzes from your notes using AI
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Note Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select a Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingNotes ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading notes...
              </span>
            </div>
          ) : notes.length > 0 ? (
            <div className="space-y-4">
              <Select
                value={selectedNoteId}
                onValueChange={(value) => setSelectedNoteId(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a note to analyze" />
                </SelectTrigger>
                <SelectContent>
                  {notes.map((note) => (
                    <SelectItem key={note.id} value={note.id.toString()}>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span>{note.title || `Note ${note.id}`}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={handleGenerateSummary}
                  disabled={loadingSummary || !selectedNoteId}
                  className="w-full gap-2"
                  size="lg"
                >
                  {loadingSummary ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Generate Summary
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleGenerateQuiz}
                  disabled={loadingQuiz || !selectedNoteId}
                  className="w-full gap-2"
                  variant="outline"
                  size="lg"
                >
                  {loadingQuiz ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      Generate Quiz
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">
                No notes available. Create a note first!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Section */}
      {summary && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Summary
              </CardTitle>
              <Badge variant="secondary">AI Generated</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-line">
                {summary}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz Section */}
      {quiz && Array.isArray(quiz) && quiz.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold text-foreground">Quiz</h2>
            </div>
            <Badge variant="secondary">{quiz.length} Questions</Badge>
          </div>

          <div className="space-y-4">
            {quiz.map((q, i) => (
              <QuizCard key={i} question={q} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
