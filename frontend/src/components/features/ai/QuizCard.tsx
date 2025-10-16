import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { cn } from "@/utils/cn";

interface QuizQuestion {
  type: "open" | "multiple_choice" | "true_false";
  question: string;
  answer?: string;
  options?: string[];
  correct?: string;
  correct_index?: number;
}

interface QuizCardProps {
  question: QuizQuestion;
  index: number;
  showAnswers?: boolean;
}

export function QuizCard({ question, index, showAnswers = false }: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [openAnswer, setOpenAnswer] = useState("");
  const [showCorrect, setShowCorrect] = useState(false);

  const handleCheckAnswer = () => {
    setShowCorrect(true);
  };

  const isCorrect = () => {
    if (question.type === "multiple_choice" && selectedOption !== null) {
      return selectedOption === question.correct_index;
    }
    return false;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg">
            <div className="flex items-start gap-3">
              <Badge variant="secondary" className="mt-1 shrink-0">
                Q{index + 1}
              </Badge>
              <span className="leading-relaxed">{question.question}</span>
            </div>
          </CardTitle>
          <Badge
            variant={
              question.type === "multiple_choice"
                ? "default"
                : question.type === "open"
                ? "outline"
                : "secondary"
            }
            className="shrink-0"
          >
            {question.type === "multiple_choice" && "Multiple Choice"}
            {question.type === "open" && "Open"}
            {question.type === "true_false" && "True/False"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pregunta de opción múltiple */}
        {question.type === "multiple_choice" && question.options && (
          <div className="space-y-2">
            {question.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOption = question.correct_index === idx;
              const showResult = showCorrect || showAnswers;

              return (
                <button
                  key={idx}
                  onClick={() => !showCorrect && setSelectedOption(idx)}
                  disabled={showCorrect}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border-2 transition-all",
                    "hover:border-primary/50 hover:bg-accent/50",
                    isSelected && !showResult && "border-primary bg-accent",
                    showResult && isCorrectOption && "border-green-500 bg-green-50 dark:bg-green-950",
                    showResult && isSelected && !isCorrectOption && "border-red-500 bg-red-50 dark:bg-red-950",
                    !isSelected && !isCorrectOption && "border-border",
                    showCorrect && "cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                          isSelected && !showResult && "border-primary bg-primary",
                          showResult && isCorrectOption && "border-green-500 bg-green-500",
                          showResult && isSelected && !isCorrectOption && "border-red-500 bg-red-500"
                        )}
                      >
                        {isSelected && !showResult && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                        {showResult && isCorrectOption && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                        {showResult && isSelected && !isCorrectOption && (
                          <XCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{option}</span>
                    </div>
                    {showResult && isCorrectOption && (
                      <Badge variant="default" className="bg-green-500 text-white">
                        Correct
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}

            {!showAnswers && !showCorrect && selectedOption !== null && (
              <Button
                onClick={handleCheckAnswer}
                className="w-full mt-4"
                variant="default"
              >
                Check Answer
              </Button>
            )}

            {showCorrect && (
              <div
                className={cn(
                  "p-4 rounded-lg border-2 mt-4",
                  isCorrect()
                    ? "border-green-500 bg-green-50 dark:bg-green-950"
                    : "border-red-500 bg-red-50 dark:bg-red-950"
                )}
              >
                <div className="flex items-center gap-2">
                  {isCorrect() ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                  <span className="font-semibold text-sm">
                    {isCorrect() ? "Correct!" : "Incorrect"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pregunta abierta */}
        {question.type === "open" && (
          <div className="space-y-3">
            <textarea
              value={openAnswer}
              onChange={(e) => setOpenAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full p-3 border-2 border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none min-h-[100px]"
              disabled={showAnswers}
            />
            {(showAnswers || showCorrect) && question.answer && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">
                      Expected Answer:
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {question.answer}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {!showAnswers && !showCorrect && openAnswer.trim() && (
              <Button
                onClick={handleCheckAnswer}
                className="w-full"
                variant="default"
              >
                Show Answer
              </Button>
            )}
          </div>
        )}

        {/* Pregunta verdadero/falso */}
        {question.type === "true_false" && (
          <div className="flex gap-3">
            {["True", "False"].map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOption = question.correct === option;
              const showResult = showCorrect || showAnswers;

              return (
                <button
                  key={option}
                  onClick={() => !showCorrect && setSelectedOption(idx)}
                  disabled={showCorrect}
                  className={cn(
                    "flex-1 p-4 rounded-lg border-2 font-semibold transition-all",
                    "hover:border-primary/50 hover:bg-accent/50",
                    isSelected && !showResult && "border-primary bg-accent",
                    showResult && isCorrectOption && "border-green-500 bg-green-50 dark:bg-green-950",
                    showResult && isSelected && !isCorrectOption && "border-red-500 bg-red-50 dark:bg-red-950",
                    !isSelected && !isCorrectOption && "border-border",
                    showCorrect && "cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    {showResult && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    {showResult && isSelected && !isCorrectOption && (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
