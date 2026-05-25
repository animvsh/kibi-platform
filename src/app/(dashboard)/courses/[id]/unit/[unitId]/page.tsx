"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ModuleList } from "@/components/course/course-path-map";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Lock,
  Play,
  Target,
  Trophy,
} from "lucide-react";
import type { Course, CourseUnit, CourseModule, UserCourseProgress } from "@/types";

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

const mockUnits: CourseUnit[] = [
  {
    id: "unit-1",
    courseId: "1",
    title: "Introduction to React",
    description: "Learn what React is and why it's powerful.",
    orderIndex: 0,
    requiredMasteryScore: 0,
    status: "completed",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "unit-2",
    courseId: "1",
    title: "Components and Props",
    description: "Understanding React components and props.",
    orderIndex: 1,
    requiredMasteryScore: 70,
    status: "available",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "unit-3",
    courseId: "1",
    title: "State and Hooks",
    description: "Managing state with hooks.",
    orderIndex: 2,
    requiredMasteryScore: 70,
    status: "locked",
    createdAt: "2024-01-15T10:00:00Z",
  },
];

const mockModules: CourseModule[] = [
  {
    id: "mod-1",
    courseId: "1",
    unitId: "unit-2",
    title: "What are Components?",
    description: "Understanding the building blocks of React",
    moduleType: "article",
    orderIndex: 0,
    estimatedMinutes: 10,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "mod-2",
    courseId: "1",
    unitId: "unit-2",
    title: "Your First Component",
    description: "Create your first React component",
    moduleType: "video",
    orderIndex: 1,
    estimatedMinutes: 15,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "mod-3",
    courseId: "1",
    unitId: "unit-2",
    title: "Understanding Props",
    description: "Pass data to components with props",
    moduleType: "article",
    orderIndex: 2,
    estimatedMinutes: 12,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "mod-4",
    courseId: "1",
    unitId: "unit-2",
    title: "Props Quiz",
    description: "Test your understanding of props",
    moduleType: "quiz",
    orderIndex: 3,
    estimatedMinutes: 10,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "mod-5",
    courseId: "1",
    unitId: "unit-2",
    title: "Practice: Building a Profile Card",
    description: "Apply your knowledge of components and props",
    moduleType: "practice",
    orderIndex: 4,
    estimatedMinutes: 20,
    createdAt: "2024-01-15T10:00:00Z",
  },
];

const mockProgress: UserCourseProgress = {
  id: "progress-1",
  userId: "user-1",
  courseId: "1",
  currentUnitId: "unit-2",
  overallProgress: 35,
  overallMastery: 42,
  status: "in_progress",
  startedAt: "2024-01-16T09:00:00Z",
  lastActiveAt: "2024-01-20T14:30:00Z",
};

export default function UnitPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const unitId = params.unitId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [unit, setUnit] = useState<CourseUnit | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [progress, setProgress] = useState<UserCourseProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));

      setCourse(mockCourse);
      setUnit(mockUnits.find((u) => u.id === unitId) || null);
      setModules(mockModules.filter((m) => m.unitId === unitId));
      setProgress(mockProgress);
      setIsLoading(false);
    };

    fetchData();
  }, [courseId, unitId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course || !unit) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Unit not found</p>
        <Link href={`/courses/${courseId}`}>
          <Button variant="link" className="mt-2">
            Back to Course
          </Button>
        </Link>
      </div>
    );
  }

  const completedModuleIds = modules.slice(0, 2).map((m) => m.id); // Mock completed modules
  const completionPercentage = Math.round(
    (completedModuleIds.length / modules.length) * 100
  );

  const isUnitLocked = unit.status === "locked";
  const isUnitCompleted = unit.status === "completed";

  // Find next unit
  const currentUnitIndex = mockUnits.findIndex((u) => u.id === unitId);
  const nextUnit = mockUnits[currentUnitIndex + 1];
  const prevUnit = mockUnits[currentUnitIndex - 1];

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
            Back to {course.title}
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Unit {currentUnitIndex + 1}</Badge>
            {isUnitLocked && (
              <Badge variant="secondary" className="gap-1">
                <Lock className="w-3 h-3" />
                Locked
              </Badge>
            )}
            {isUnitCompleted && (
              <Badge variant="default" className="gap-1 bg-green-600">
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{unit.title}</h1>
          <p className="text-muted-foreground">{unit.description}</p>
        </div>
      </div>

      {/* Unit Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Unit Progress</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {completedModuleIds.length} of {modules.length} completed
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Mastery required: {unit.requiredMasteryScore}%</span>
            <span>{completionPercentage}% complete</span>
          </div>
        </CardContent>
      </Card>

      {/* Modules List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Modules in this Unit
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isUnitLocked ? (
            <div className="text-center py-8">
              <Lock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">
                Complete the previous unit to unlock this content.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Mastery score of {unit.requiredMasteryScore}% required.
              </p>
            </div>
          ) : (
            <ModuleList
              courseId={courseId}
              unitId={unitId}
              modules={modules}
              completedModuleIds={completedModuleIds}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        {prevUnit ? (
          <Link href={`/courses/${courseId}/unit/${prevUnit.id}`}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Previous Unit
            </Button>
          </Link>
        ) : (
          <div />
        )}

        {nextUnit && (
          <Link href={`/courses/${courseId}/unit/${nextUnit.id}`}>
            <Button
              variant="outline"
              className="gap-2"
              disabled={!isUnitCompleted && completionPercentage < 70}
            >
              Next Unit
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
