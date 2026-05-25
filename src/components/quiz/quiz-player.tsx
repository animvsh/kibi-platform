"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  Trophy,
  Target,
} from "lucide-react";
import type { QuizQuestion } from "@/types";

interface QuizPlayerProps {
  quizId: string;
  questions: (QuizQuestion & { options: string[] })[];
  onComplete?: (results: QuizResults) => void;
  passingScore?: number;
}

export interface QuizResults {
  quizId: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  passed: boolean;
  answers: QuizAnswer[];
}

interface QuizAnswer {
  questionId: string;
  question: string;
  selectedAnswer: string | string[];
  correctAnswer: string | string[];
  isCorrect: boolean;
  explanation?: string;
}

export function QuizPlayer({
  quizId,
  questions,
  onComplete,
  passingScore = 70,
}: QuizPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleSelectAnswer = (answer: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setIsSubmitted(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setIsSubmitted(false);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setIsComplete(true);

    // Calculate results
    const results: QuizResults = {
      quizId,
      totalQuestions: questions.length,
      correctAnswers: questions.filter((q) => {
        const answer = selectedAnswers[q.id];
        const correct = Array.isArray(q.correctAnswerJson)
          ? q.correctAnswerJson.includes(answer)
          : q.correctAnswerJson === answer;
        return correct;
      }).length,
      score: 0,
      passed: false,
      answers: questions.map((q) => {
        const answer = selectedAnswers[q.id];
        const correct = Array.isArray(q.correctAnswerJson)
          ? q.correctAnswerJson.includes(answer)
          : q.correctAnswerJson === answer;
        return {
          questionId: q.id,
          question: q.question,
          selectedAnswer: answer || "",
          correctAnswer: q.correctAnswerJson,
          isCorrect: correct,
          explanation: q.explanation,
        };
      }),
    };

    results.score = Math.round(
      (results.correctAnswers / questions.length) * 100
    );
    results.passed = results.score >= passingScore;

    onComplete?.(results);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
    setIsComplete(false);
  };

  const isAnswerCorrect = (question: QuizQuestion & { options: string[] }) => {
    const answer = selectedAnswers[question.id];
    if (!answer) return null;
    return Array.isArray(question.correctAnswerJson)
      ? question.correctAnswerJson.includes(answer)
      : question.correctAnswerJson === answer;
  };

  if (isComplete) {
    const correctCount = questions.filter((q) => isAnswerCorrect(q)).length;
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= passingScore;

    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <div
              className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                passed ? "bg-green-100" : "bg-orange-100"
              }`}
            >
              {passed ? (
                <Trophy className="w-10 h-10 text-green-600" />
              ) : (
                <Target className="w-10 h-10 text-orange-600" />
              )}
            </div>

            <h2 className="text-2xl font-bold mb-2">
              {passed ? "Congratulations!" : "Keep Practicing!"}
            </h2>

            <p className="text-muted-foreground mb-6">
              {passed
                ? "You've passed the quiz and demonstrated your knowledge."
                : `You need ${passingScore}% to pass. Review the material and try again.`}
            </p>

            <div className="flex items-center justify-center gap-8 mb-6">
              <div>
                <p className="text-4xl font-bold">{score}%</p>
                <p className="text-sm text-muted-foreground">Your Score</p>
              </div>
              <div>
                <p className="text-4xl font-bold">
                  {correctCount}/{questions.length}
                </p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={handleRetry} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Retry Quiz
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Review Answers */}
        <div className="mt-6 space-y-4">
          <h3 className="font-semibold text-lg">Review Your Answers</h3>
          {questions.map((question, index) => {
            const answer = selectedAnswers[question.id];
            const isCorrect = isAnswerCorrect(question);

            return (
              <Card
                key={question.id}
                className={isCorrect ? "border-green-200" : "border-orange-200"}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium mb-2">
                        {index + 1}. {question.question}
                      </p>
                      <div className="space-y-1 text-sm">
                        {question.options.map((option) => {
                          const isSelected = option === answer;
                          const isCorrectOption =
                            Array.isArray(question.correctAnswerJson)
                              ? question.correctAnswerJson.includes(option)
                              : question.correctAnswerJson === option;

                          return (
                            <div
                              key={option}
                              className={`px-3 py-2 rounded-md ${
                                isCorrectOption
                                  ? "bg-green-50 text-green-700"
                                  : isSelected && !isCorrectOption
                                  ? "bg-orange-50 text-orange-700"
                                  : "bg-muted/50"
                              }`}
                            >
                              {option}
                              {isCorrectOption && (
                                <span className="ml-2 text-green-600">(Correct)</span>
                              )}
                              {isSelected && !isCorrectOption && (
                                <span className="ml-2 text-orange-600">(Your answer)</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {question.explanation && (
                        <p className="mt-3 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="capitalize">
              {currentQuestion.questionType.replace("_", " ")}
            </Badge>
            <Badge variant="secondary">
              {currentQuestion.difficulty}
            </Badge>
          </div>
          <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestion.id] === option;
            const showCorrect = isSubmitted && option === currentQuestion.correctAnswerJson;

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(option)}
                disabled={isSubmitted}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  isSubmitted
                    ? showCorrect
                      ? "border-green-500 bg-green-50"
                      : isSelected
                      ? "border-orange-500 bg-orange-50"
                      : "border-muted opacity-60"
                    : isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-muted-foreground"
                    }`}
                  >
                    {isSelected && !isSubmitted && (
                      <div className="w-2 h-2 rounded-full bg-current" />
                    )}
                    {showCorrect && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {isSubmitted && isSelected && !showCorrect && (
                      <XCircle className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                  <span className="flex-1">{option}</span>
                </div>
              </button>
            );
          })}

          {/* Explanation (shown after submit) */}
          {isSubmitted && currentQuestion.explanation && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">
                <strong>Explanation:</strong> {currentQuestion.explanation}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {!isSubmitted && selectedAnswers[currentQuestion.id] && (
            <Button onClick={() => setIsSubmitted(true)} variant="secondary">
              Check Answer
            </Button>
          )}
          {isSubmitted && currentQuestionIndex < questions.length - 1 && (
            <Button onClick={handleNext} className="gap-2">
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
          {isSubmitted && currentQuestionIndex === questions.length - 1 && (
            <Button onClick={handleSubmit} className="gap-2">
              See Results
              <Trophy className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
