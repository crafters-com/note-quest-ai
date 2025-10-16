import React, { useState, useEffect } from "react";
import axios from "axios";
import { generateSummary, generateQuiz } from "@/apiAITools";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

// Importar los componentes del select correctamente
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

        const res = await axios.get("http://localhost:8000/api/notes/", {
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
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-primary">AI Tools</h1>

      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

      {/* Selección de nota + botones */}
      <Card className="p-4 bg-muted/30 border border-border">
        <CardContent className="flex flex-col sm:flex-row items-center gap-6">
          {loadingNotes ? (
            <p className="text-sm text-muted-foreground">Loading notes...</p>
          ) : notes.length > 0 ? (
            <Select
              value={selectedNoteId}
              onValueChange={(value) => setSelectedNoteId(value)}
            >
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select a note" />
              </SelectTrigger>
              <SelectContent>
                {notes.map((note) => (
                  <SelectItem key={note.id} value={note.id.toString()}>
                    {note.title || `Note ${note.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-muted-foreground">
              No notes available.
            </p>
          )}

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleGenerateSummary}
              disabled={loadingSummary || !selectedNoteId}
              className="flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              {loadingSummary ? "Generating..." : "Generate Summary"}
            </Button>

            <Button
              onClick={handleGenerateQuiz}
              disabled={loadingQuiz || !selectedNoteId}
              className="flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              {loadingQuiz ? "Generating..." : "Generate Quiz"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      {summary && (
        <div>
          <h2 className="text-xl font-medium text-foreground mb-2">Summary</h2>
          <p className="text-muted-foreground text-sm whitespace-pre-line">
            {summary}
          </p>
        </div>
      )}

      {/* Quiz */}
      {quiz && Array.isArray(quiz) && (
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-foreground">Quiz</h2>
          {quiz.map((q, i) => (
            <Card key={i} className="p-4">
              <p className="font-semibold">
                {i + 1}. {q.question}
              </p>
              {q.type === "multiple_choice" && (
                <ul className="list-disc pl-5 mt-2">
                  {q.options?.map((opt: string, j: number) => (
                    <li key={j} className="text-sm text-muted-foreground">
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
              {q.type === "open" && (
                <p className="text-sm italic text-muted-foreground mt-2">
                  (Pregunta abierta — respuesta esperada: {q.answer})
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
