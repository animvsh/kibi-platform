"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Clock,
  Flame,
  Star,
  Trophy,
  Share2,
  MoreVertical,
  Brain,
  Zap,
  Target,
  TrendingUp,
  ArrowRight,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { CoursePathMap } from "@/components/course/course-path-map";
import type { Course, CourseUnit, UserCourseProgress } from "@/types";

// Mock data for demonstration
const mockCourse: Course = {
  id: "1",
  ownerId: "user-1",
  title: "React Fundamentals",
  slug: "react-fundamentals",
  description: "Master the fundamentals of React including components, state, props, and hooks. Build real-world applications with modern React patterns.",
  sourceType: "prompt",
  difficulty: "beginner",
  estimatedDurationMinutes: 180,
  visibility: "private",
  remixable: false,
  status: "ready",
  thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-20T15:30:00Z",
};

const mockUnits: CourseUnit[] = [
  {
    id: "unit-1",
    courseId: "1",
    title: "Introduction to React",
    description: "Learn what React is and why it's powerful for building user interfaces.",
    orderIndex: 0,
    requiredMasteryScore: 0,
    status: "completed",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "unit-2",
    courseId: "1",
    title: "Components and Props",
    description: "Understanding React components and how to pass data between them using props.",
    orderIndex: 1,
    requiredMasteryScore: 70,
    status: "available",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "unit-3",
    courseId: "1",
    title: "State and Hooks",
    description: "Managing component state and using React hooks like useState and useEffect.",
    orderIndex: 2,
    requiredMasteryScore: 70,
    status: "available",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "unit-4",
    courseId: "1",
    title: "Building a Real Project",
    description: "Apply everything you've learned to build a complete React application.",
    orderIndex: 3,
    requiredMasteryScore: 80,
    status: "locked",
    createdAt: "2024-01-15T10:00:00Z",
  },
];

const mockProgress: UserCourseProgress = {
  id: "progress-1",
  userId: "user-1",
  courseId: "1",
  currentUnitId: "unit-2",
  currentLessonId: "lesson-3",
  overallProgress: 35,
  overallMastery: 42,
  status: "in_progress",
  startedAt: "2024-01-16T09:00:00Z",
  lastActiveAt: "2024-01-20T14:30:00Z",
};

const mockWeakAreas = [
  { conceptId: "c1", name: "useEffect dependencies", masteryScore: 25 },
  { conceptId: "c2", name: "State updates", masteryScore: 30 },
  { conceptId: "c3", name: "Component composition", masteryScore: 35 },
];

const mockStrongAreas = [
  { conceptId: "c4", name: "Props drilling", masteryScore: 85 },
  { conceptId: "c5", name: "Functional components", masteryScore: 80 },
  { conceptId: "c6", name: "JSX syntax", masteryScore: 90 },
];

export default function CourseDashboardPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [units, setUnits] = useState<CourseUnit[]>([]);
  const [progress, setProgress] = useState<UserCourseProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const fetchData = async () => {
      setIsLoading(true);
      // In production, fetch from API
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if course is still generating
      if (course?.status === "generating") {
        return;
      }

      setCourse(mockCourse);
      setUnits(mockUnits);
      setProgress(mockProgress);
      setIsLoading(false);
    };

    fetchData();
  }, [courseId]);

  if (isLoading || !course) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    {
      label: "Overall Progress",
      value: `${progress?.overallProgress ?? 0}%`,
      icon: Target,
      color: "text-blue-600",
    },
    {
      label: "Mastery Score",
      value: `${progress?.overallMastery ?? 0}%`,
      icon: Brain,
      color: "text-purple-600",
    },
    {
      label: "Current Streak",
      value: "5 days",
      icon: Flame,
      color: "text-orange-500",
    },
    {
      label: "Total XP",
      value: "1,250",
      icon: Zap,
      color: "text-yellow-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {course.difficulty}
            </Badge>
            <Badge variant="secondary">
              <BookOpen className="w-3 h-3 mr-1" />
              {course.estimatedDurationMinutes} min
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
          <p className="text-muted-foreground max-w-2xl">{course.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger className="h-9 w-9 p-0">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Course</DropdownMenuItem>
              <DropdownMenuItem>Export</DropdownMenuItem>
              <DropdownMenuItem>Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Course Path */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Your Learning Path
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CoursePathMap
                courseId={courseId}
                units={units}
                currentUnitId={progress?.currentUnitId}
                userProgress={{
                  overallProgress: progress?.overallProgress ?? 0,
                  completedUnitIds: units
                    .filter((u) => u.status === "completed")
                    .map((u) => u.id),
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions & Info */}
        <div className="space-y-6">
          {/* Recommended Next Activity */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Recommended Next
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">Understanding Props</p>
                <p className="text-sm text-muted-foreground">
                  Continue learning how to pass data between React components.
                </p>
              </div>
              <Link href={`/courses/${courseId}/lesson/lesson-3`}>
                <Button className="w-full gap-2">
                  Continue Learning
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* AI Tutor */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">AI Tutor</p>
                  <p className="text-sm text-muted-foreground">
                    Get help with {course.title} from your personal AI tutor.
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4 gap-2">
                <MessageSquare className="w-4 h-4" />
                Ask AI Tutor
              </Button>
            </CardContent>
          </Card>

          {/* Knowledge Summary */}
          <Tabs defaultValue="weak" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="weak" className="flex-1 text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                Weak Areas
              </TabsTrigger>
              <TabsTrigger value="strong" className="flex-1 text-xs">
                <Trophy className="w-3 h-3 mr-1" />
                Strong Areas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weak" className="mt-4 space-y-3">
              {mockWeakAreas.map((area) => (
                <div
                  key={area.conceptId}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-sm">{area.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Mastery: {area.masteryScore}%
                    </p>
                  </div>
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${area.masteryScore}%` }}
                    />
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full text-xs">
                Practice More
              </Button>
            </TabsContent>

            <TabsContent value="strong" className="mt-4 space-y-3">
              {mockStrongAreas.map((area) => (
                <div
                  key={area.conceptId}
                  className="flex items-center justify-between p-3 rounded-lg bg-green-50/50"
                >
                  <div>
                    <p className="font-medium text-sm">{area.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Mastery: {area.masteryScore}%
                    </p>
                  </div>
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${area.masteryScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
