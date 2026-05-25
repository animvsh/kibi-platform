"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuizPlayer, type QuizResults } from "@/components/quiz/quiz-player";
import {
  ArrowLeft,
  Clock,
  HelpCircle,
  Trophy,
  XCircle,
} from "lucide-react";
import type { Quiz, QuizQuestion } from "@/types";
import { useProgressStore, XP_REWARDS } from "@/lib/stores/progress-store";

// Mock data
const mockQuiz: Quiz = {
  id: "quiz-1",
  courseId: "1",
  unitId: "unit-2",
  title: "Components and Props Quiz",
  description: "Test your understanding of React components and how to pass data between them using props.",
  passingScore: 70,
  createdAt: "2024-01-15T10:00:00Z",
};

const mockQuestions: (QuizQuestion & { options: string[] })[] = [
  {
    id: "q1",
    quizId: "quiz-1",
    questionType: "multiple_choice",
    question: "What is the correct way to pass a prop called 'name' to a component?",
    optionsJson: [
      "<Component name='John' />",
      "<Component {name}='John' />",
      "<Component props.name='John' />",
      "<Component name:{John} />",
    ],
    options: ["<Component name='John' />", "<Component {name}='John' />", "<Component props.name='John' />", "<Component name:{John} />"],
    correctAnswerJson: "<Component name='John' />",
    explanation: "Props are passed to React components as attributes, just like HTML attributes. The value can be a string or an expression in curly braces.",
    difficulty: "beginner",
    conceptTags: ["props", "jsx"],
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "q2",
    quizId: "quiz-1",
    questionType: "true_false",
    question: "React components must always return JSX.",
    optionsJson: ["True", "False"],
    options: ["True", "False"],
    correctAnswerJson: "True",
    explanation: "React components are functions that return JSX (or null). This JSX describes what should be rendered on the screen.",
    difficulty: "beginner",
    conceptTags: ["components", "jsx"],
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "q3",
    quizId: "quiz-1",
    questionType: "multiple_choice",
    question: "What happens when a prop changes in a parent component?",
    optionsJson: [
      "The child component re-renders",
      "Nothing happens automatically",
      "The entire app reloads",
      "Only the parent re-renders",
    ],
    options: [
      "The child component re-renders",
      "Nothing happens automatically",
      "The entire app reloads",
      "Only the parent re-renders",
    ],
    correctAnswerJson: "The child component re-renders",
    explanation: "When props change in a parent component, React will re-render the child components that receive those props. This is how data flows down the component tree.",
    difficulty: "intermediate",
    conceptTags: ["props", "rendering", "state"],
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "q4",
    quizId: "quiz-1",
    questionType: "multiple_choice",
    question: "Which naming convention should React components follow?",
    optionsJson: [
      "lowercase with dashes",
      "PascalCase",
      "camelCase",
      "UPPERCASE",
    ],
    options: ["lowercase with dashes", "PascalCase", "camelCase", "UPPERCASE"],
    correctAnswerJson: "PascalCase",
    explanation: "React components must be named with PascalCase (capitalized first letter) so React can distinguish them from HTML elements and other components.",
    difficulty: "beginner",
    conceptTags: ["naming", "components"],
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "q5",
    quizId: "quiz-1",
    questionType: "multiple_choice",
    question: "What is the purpose of the 'children' prop?",
    optionsJson: [
      "To pass content between opening and closing tags",
      "To define child components",
      "To access child state",
      "To render nested arrays",
    ],
    options: [
      "To pass content between opening and closing tags",
      "To define child components",
      "To access child state",
      "To render nested arrays",
    ],
    correctAnswerJson: "To pass content between opening and closing tags",
    explanation: "The children prop allows you to pass JSX between the opening and closing tags of a component. This is useful for creating reusable layouts and wrapper components.",
    difficulty: "intermediate",
    conceptTags: ["props", "children", "composition"],
    createdAt: "2024-01-15T10:00:00Z",
  },
];

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<(QuizQuestion & { options: string[] })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<QuizResults | null>(null);

  const { addXp } = useProgressStore();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));

      setQuiz(mockQuiz);
      setQuestions(mockQuestions);
      setIsLoading(false);
    };

    fetchData();
  }, [courseId, quizId]);

  const handleQuizComplete = async (quizResults: QuizResults) => {
    setResults(quizResults);
    setShowResults(true);

    // Award XP based on performance
    const xpEarned = quizResults.passed
      ? quizResults.score === 100
        ? XP_REWARDS.QUIZ_COMPLETE + XP_REWARDS.QUIZ_PERFECT_SCORE
        : XP_REWARDS.QUIZ_COMPLETE
      : Math.floor(XP_REWARDS.QUIZ_COMPLETE * (quizResults.score / 100));

    addXp(xpEarned);

    // Save attempt to database
    try {
      await fetch(`/api/lessons/${quizId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          quizId,
          score: quizResults.score,
          passed: quizResults.passed,
        }),
      });
    } catch (error) {
      console.error("Failed to save quiz attempt:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <XCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-muted-foreground">Quiz not found</p>
        <Link href={`/courses/${courseId}`}>
          <Button variant="link" className="mt-2">
            Back to Course
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Course
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <HelpCircle className="w-3 h-3" />
              Quiz
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Clock className="w-3 h-3" />
              {questions.length * 2} min
            </Badge>
            <Badge variant="secondary">
              Passing: {quiz.passingScore}%
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{quiz.title}</h1>
          <p className="text-muted-foreground">{quiz.description}</p>
        </div>
      </div>

      {/* Quiz Player */}
      {!showResults ? (
        <QuizPlayer
          quizId={quizId}
          questions={questions}
          onComplete={handleQuizComplete}
          passingScore={quiz.passingScore}
        />
      ) : (
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <div
                className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  results?.passed ? "bg-green-100" : "bg-orange-100"
                }`}
              >
                {results?.passed ? (
                  <Trophy className="w-10 h-10 text-green-600" />
                ) : (
                  <XCircle className="w-10 h-10 text-orange-600" />
                )}
              </div>

              <h2 className="text-2xl font-bold mb-2">
                {results?.passed ? "Congratulations!" : "Keep Practicing!"}
              </h2>

              <p className="text-muted-foreground mb-6">
                {results?.passed
                  ? "You've passed the quiz!"
                  : `You need ${quiz.passingScore}% to pass.`}
              </p>

              <div className="flex items-center justify-center gap-8 mb-6">
                <div>
                  <p className="text-4xl font-bold">{results?.score}%</p>
                  <p className="text-sm text-muted-foreground">Your Score</p>
                </div>
                <div>
                  <p className="text-4xl font-bold">
                    {results?.correctAnswers}/{results?.totalQuestions}
                  </p>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Link href={`/courses/${courseId}`}>
                  <Button variant="outline">Back to Course</Button>
                </Link>
                {!results?.passed && (
                  <Button
                    onClick={() => {
                      setShowResults(false);
                      setResults(null);
                    }}
                  >
                    Try Again
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
