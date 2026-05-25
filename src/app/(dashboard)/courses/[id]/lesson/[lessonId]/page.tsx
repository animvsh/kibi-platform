"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Play,
  Target,
  Lightbulb,
  Video,
  RotateCcw,
} from "lucide-react";
import type { Course, Lesson, CourseUnit, CourseModule } from "@/types";
import { useProgressStore, XP_REWARDS } from "@/lib/stores/progress-store";

interface MiniCheckQuestion {
  question: string;
  correctAnswer: string;
  explanation: string;
}

interface LessonContentJson {
  title: string;
  content: string;
  keyTakeaways: string[];
  miniCheckQuestions: MiniCheckQuestion[];
  videoUrl?: string;
  estimatedMinutes: number;
}

/**
 * Extracts YouTube video ID from URLs.
 * Supports: youtube.com/watch?v=VIDEO_ID and youtu.be/VIDEO_ID
 */
function extractYouTubeId(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes("youtube.com")) {
      return urlObj.searchParams.get("v");
    }
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1) || null;
    }
    return null;
  } catch {
    return null;
  }
}

// Mock data
const mockCourse: Course = {
  id: "1",
  ownerId: "user-1",
  title: "React Fundamentals",
  slug: "react-fundamentals",
  description: "Master the fundamentals of React",
  sourceType: "prompt",
  difficulty: "beginner",
  estimatedDurationMinutes: 180,
  visibility: "private",
  remixable: false,
  status: "ready",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-20T15:30:00Z",
};

const mockLesson: Omit<Lesson, "contentJson"> & { contentJson: LessonContentJson } = {
  id: "lesson-1",
  courseId: "1",
  unitId: "unit-2",
  moduleId: "mod-1",
  title: "What are Components?",
  lessonType: "article",
  contentJson: {
    title: "What are Components?",
    content: `# Understanding React Components

React components are the building blocks of any React application. They are reusable, self-contained pieces of UI that can contain their own structure, styling, and logic.

## Why Components?

Components allow you to:

- **Reuse code**: Write once, use everywhere
- **Maintainability**: Easy to update and debug
- **Organization**: Clean separation of concerns
- **Testing**: Components can be tested in isolation

## Types of Components

### Functional Components

The modern way to write React components. They are JavaScript functions that return JSX:

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
\`\`\`

### Class Components (Legacy)

The older way to create components using ES6 classes. While still supported, functional components are now recommended.

## Key Concepts

1. **Props**: Data passed from parent to child
2. **State**: Internal data that can change
3. **Return**: Components must return JSX
4. **Capitalization**: Component names must start with a capital letter

## Best Practices

- Keep components small and focused
- Use meaningful names
- Extract reusable logic into custom hooks
- Separate concerns using multiple components`,
    keyTakeaways: [
      "Components are reusable UI building blocks",
      "Functional components are the modern standard",
      "Props allow data flow between components",
      "Components should be small and focused",
    ],
    miniCheckQuestions: [
      {
        question: "What is the main benefit of using components?",
        correctAnswer: "Reusability",
        explanation: "Components allow you to write code once and reuse it throughout your application.",
      },
      {
        question: "What is the correct way to name a React component?",
        correctAnswer: "With a capital letter (e.g., Welcome)",
        explanation: "React requires component names to start with a capital letter to distinguish them from HTML elements.",
      },
    ],
    estimatedMinutes: 10,
  },
  orderIndex: 0,
  estimatedMinutes: 10,
  status: "published",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-20T15:30:00Z",
};

const mockUnits: CourseUnit[] = [
  { id: "unit-1", courseId: "1", title: "Introduction", description: "", orderIndex: 0, requiredMasteryScore: 0, status: "completed", createdAt: "" },
  { id: "unit-2", courseId: "1", title: "Components", description: "", orderIndex: 1, requiredMasteryScore: 70, status: "available", createdAt: "" },
  { id: "unit-3", courseId: "1", title: "State", description: "", orderIndex: 2, requiredMasteryScore: 70, status: "locked", createdAt: "" },
];

const mockModules: CourseModule[] = [
  { id: "mod-1", courseId: "1", unitId: "unit-2", title: "What are Components?", description: "", moduleType: "article", orderIndex: 0, estimatedMinutes: 10, createdAt: "" },
  { id: "mod-2", courseId: "1", unitId: "unit-2", title: "Your First Component", description: "", moduleType: "video", orderIndex: 1, estimatedMinutes: 15, createdAt: "" },
  { id: "mod-3", courseId: "1", unitId: "unit-2", title: "Understanding Props", description: "", moduleType: "article", orderIndex: 2, estimatedMinutes: 12, createdAt: "" },
];

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<(Omit<Lesson, "contentJson"> & { contentJson: LessonContentJson }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showMiniCheck, setShowMiniCheck] = useState(false);
  const [miniCheckAnswers, setMiniCheckAnswers] = useState<Record<number, string>>({});
  const [miniCheckSubmitted, setMiniCheckSubmitted] = useState(false);

  const { addXp, updateStreak } = useProgressStore();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));

      setCourse(mockCourse);
      setLesson(mockLesson);
      setIsLoading(false);
    };

    fetchData();
  }, [courseId, lessonId]);

  const content = lesson?.contentJson as LessonContentJson | undefined;
  const keyTakeaways = content?.keyTakeaways || [];
  const miniCheckQuestions = content?.miniCheckQuestions || [];

  const handleMarkComplete = async () => {
    if (miniCheckQuestions.length > 0 && !showMiniCheck) {
      setShowMiniCheck(true);
      return;
    }

    // Award XP
    addXp(XP_REWARDS.LESSON_COMPLETE);
    updateStreak();

    // Mark as completed
    setIsCompleted(true);

    // Call API to mark complete
    try {
      await fetch(`/api/lessons/${lessonId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
    } catch (error) {
      console.error("Failed to mark lesson complete:", error);
    }

    // Show success and redirect
    setTimeout(() => {
      router.push(`/courses/${courseId}`);
    }, 1500);
  };

  const handleMiniCheckSubmit = () => {
    setMiniCheckSubmitted(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course || !lesson) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Lesson not found</p>
        <Link href={`/courses/${courseId}`}>
          <Button variant="link" className="mt-2">
            Back to Course
          </Button>
        </Link>
      </div>
    );
  }

  // Find next and prev modules
  const currentModuleIndex = mockModules.findIndex((m) => m.id === lesson.moduleId);
  const nextModule = mockModules[currentModuleIndex + 1];
  const prevModule = mockModules[currentModuleIndex - 1];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            href={`/courses/${courseId}/unit/${lesson.unitId}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Unit
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {lesson.lessonType}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Clock className="w-3 h-3" />
              {lesson.estimatedMinutes} min
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
        </div>

        {/* Progress indicator */}
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Module 1 of 5</p>
          <Progress value={20} className="w-24 h-2 mt-1" />
        </div>
      </div>

      {/* Video Embed (if applicable) */}
      {(lesson.lessonType === "video" || content?.videoUrl) && (
        <Card>
          <CardContent className="p-0 aspect-video">
            {(() => {
              const videoId = extractYouTubeId(content?.videoUrl);
              if (videoId) {
                return (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="Lesson video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                );
              }
              return (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground">Video content would play here</p>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        <CardContent className="pt-6 prose prose-slate max-w-none">
          {/* Render markdown content - simplified for demo */}
          <div
            dangerouslySetInnerHTML={{
              __html: (content?.content as string || "")
                .split("\n")
                .map((line: string) => {
                  if (line.startsWith("# ")) return `<h1 class="text-3xl font-bold mt-6 mb-4">${line.slice(2)}</h1>`;
                  if (line.startsWith("## ")) return `<h2 class="text-2xl font-semibold mt-5 mb-3">${line.slice(3)}</h2>`;
                  if (line.startsWith("### ")) return `<h3 class="text-xl font-medium mt-4 mb-2">${line.slice(4)}</h3>`;
                  if (line.startsWith("```")) return line.startsWith("```js") || line.startsWith("```jsx") ? `<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm">` : `<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm">`;
                  if (line.startsWith("1. ") || line.startsWith("- ")) return `<li class="ml-4">${line.slice(2)}</li>`;
                  if (line.startsWith("- **")) {
                    const match = line.match(/^- \*\*(.+?)\*\*:?\s*(.*)$/);
                    if (match) return `<li><strong>${match[1]}</strong>: ${match[2]}</li>`;
                  }
                  if (line.trim() === "") return "<br/>";
                  if (!line.startsWith("<")) return `<p class="my-2">${line}</p>`;
                  return line;
                })
                .join("")
                .replace(/<\/code><\/pre>/g, "</code></pre>"),
            }}
          />
        </CardContent>
      </Card>

      {/* Key Takeaways */}
      {keyTakeaways.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-800">
              <Lightbulb className="w-5 h-5" />
              Key Takeaways
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {keyTakeaways.map((takeaway, index) => (
                <li key={index} className="flex items-start gap-2 text-amber-900">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Mini Check Questions */}
      {showMiniCheck && miniCheckQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-5 h-5" />
              Quick Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {miniCheckQuestions.map((q, index) => (
              <div key={index} className="space-y-2">
                <p className="font-medium">{q.question}</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={miniCheckAnswers[index] || ""}
                    onChange={(e) =>
                      setMiniCheckAnswers((prev) => ({
                        ...prev,
                        [index]: e.target.value,
                      }))
                    }
                    disabled={miniCheckSubmitted}
                    placeholder="Type your answer..."
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                {miniCheckSubmitted && (
                  <div className="text-sm">
                    {miniCheckAnswers[index]?.toLowerCase().trim() ===
                    q.correctAnswer.toLowerCase().trim() ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Correct! {q.explanation}
                      </span>
                    ) : (
                      <span className="text-orange-600 flex items-center gap-1">
                        <RotateCcw className="w-4 h-4" />
                        The correct answer is: {q.correctAnswer}. {q.explanation}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {!miniCheckSubmitted && (
              <Button onClick={handleMiniCheckSubmit} className="w-full">
                Check Answers
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Completion Button */}
      <Card>
        <CardContent className="pt-6">
          {isCompleted ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-green-600">
                Lesson Complete!
              </h3>
              <p className="text-muted-foreground mt-1">
                +{XP_REWARDS.LESSON_COMPLETE} XP earned
              </p>
            </div>
          ) : (
            <Button
              onClick={handleMarkComplete}
              className="w-full"
              size="lg"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              {showMiniCheck ? "Complete Lesson" : "Mark as Complete"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        {prevModule ? (
          <Link href={`/courses/${courseId}/lesson/${prevModule.id}`}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
          </Link>
        ) : (
          <div />
        )}

        {nextModule && (
          <Link href={`/courses/${courseId}/lesson/${nextModule.id}`}>
            <Button variant="outline" className="gap-2">
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
