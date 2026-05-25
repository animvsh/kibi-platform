"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  GraduationCap,
  Sparkles,
  BookOpen,
  Target,
  Lightbulb,
  Zap,
  RefreshCw,
} from "lucide-react";
import { TutorSidebar, type TutorMessage } from "@/components/tutor/tutor-sidebar";

interface TutorContext {
  course: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
  };
  currentLesson?: {
    title: string;
    keyTakeaways: string[];
  };
  progress: {
    overallProgress: number;
    overallMastery: number;
  };
  concepts: {
    weak: { conceptId: string; name: string; masteryScore: number }[];
    strong: { conceptId: string; name: string; masteryScore: number }[];
  };
  suggestedTopics: string[];
}

export default function TutorPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [context, setContext] = useState<TutorContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/tutor/chat`, {
          headers: { "X-User-Id": "demo-user" },
        });

        if (response.ok) {
          const data = await response.json();
          setContext(data.context);
        }
      } catch (error) {
        console.error("Failed to load tutor context:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContext();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Course
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Tutor</h1>
              <p className="text-muted-foreground">
                {context?.course.title || "Course Tutor"}
              </p>
            </div>
          </div>
        </div>

        <Button onClick={() => setIsSidebarOpen(true)} className="gap-2">
          <Sparkles className="w-4 h-4" />
          Open Tutor Chat
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-xl font-semibold">
                  {context?.progress.overallProgress || 0}%
                </p>
              </div>
            </div>
            <Progress
              value={context?.progress.overallProgress || 0}
              className="h-2 mt-3"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mastery</p>
                <p className="text-xl font-semibold">
                  {context?.progress.overallMastery || 0}%
                </p>
              </div>
            </div>
            <Progress
              value={context?.progress.overallMastery || 0}
              className="h-2 mt-3"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Lightbulb className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weak Areas</p>
                <p className="text-xl font-semibold">
                  {context?.concepts.weak.length || 0}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Concepts needing review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Current Lesson Context */}
      {context?.currentLesson && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Current Lesson
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold">{context.currentLesson.title}</h3>
            {context.currentLesson.keyTakeaways.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Key Takeaways:
                </p>
                <ul className="space-y-1">
                  {context.currentLesson.keyTakeaways.map((takeaway, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm"
                    >
                      <span className="text-primary">•</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Weak Concepts */}
      {context?.concepts.weak && context.concepts.weak.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-amber-800">
              <Lightbulb className="w-5 h-5" />
              Areas Needing Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {context.concepts.weak.map((concept) => (
                <Badge
                  key={concept.conceptId}
                  variant="outline"
                  className="bg-white"
                >
                  {concept.name} ({concept.masteryScore}%)
                </Badge>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-2"
              onClick={() => setIsSidebarOpen(true)}
            >
              <RefreshCw className="w-4 h-4" />
              Review with Tutor
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Suggested Topics */}
      {context?.suggestedTopics && context.suggestedTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Suggested Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {context.suggestedTopics.map((topic, index) => (
                <Badge key={index} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="text-2xl">📖</span>
              <span className="text-sm">Explain Simpler</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="text-2xl">💡</span>
              <span className="text-sm">Get Examples</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="text-2xl">❓</span>
              <span className="text-sm">Quiz Me</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => setIsSidebarOpen(true)}
            >
              <span className="text-2xl">🗂️</span>
              <span className="text-sm">Flashcards</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tutor Sidebar */}
      <TutorSidebar
        courseId={courseId}
        currentLesson={
          context?.currentLesson
            ? { title: context.currentLesson.title }
            : undefined
        }
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}
