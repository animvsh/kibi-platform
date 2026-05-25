import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  Users,
  BarChart3,
  BookOpen,
  Play,
  Copy,
  Star,
  Globe,
  Lock,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

interface SharedCoursePageProps {
  params: Promise<{ token: string }>;
}

// Mock shared course data (in production, fetch from API)
const mockSharedCourse = {
  id: "demo-1",
  ownerId: "user-1",
  owner: {
    name: "Sarah Chen",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
  },
  title: "React Fundamentals",
  slug: "react-fundamentals",
  description:
    "Master the fundamentals of React including components, state, props, and hooks. Build real-world applications with modern React patterns.",
  difficulty: "beginner" as const,
  estimatedDurationMinutes: 180,
  thumbnailUrl:
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200",
  visibility: "unlisted" as const,
  remixable: true,
  status: "ready" as const,
  learnerCount: 1247,
  remixCount: 342,
  rating: 4.8,
  modules: [
    { id: "mod-1", title: "Introduction to React", type: "article", estimatedMinutes: 15 },
    { id: "mod-2", title: "Components and Props", type: "video", estimatedMinutes: 25 },
    { id: "mod-3", title: "State Management", type: "quiz", estimatedMinutes: 20 },
  ],
};

export async function generateMetadata({
  params,
}: SharedCoursePageProps): Promise<Metadata> {
  const { token } = await params;
  const course = mockSharedCourse; // In production, fetch by token

  return {
    title: `${course.title} | Kibi`,
    description: course.description,
    robots: "noindex", // Don't index shared links
  };
}

export default async function SharedCoursePage({
  params,
}: SharedCoursePageProps) {
  const { token } = await params;

  // In production, validate token and fetch course
  // const shareData = await validateAndFetchShare(token);
  // if (!shareData) notFound();
  // const course = shareData.course;

  const course = mockSharedCourse;

  if (!course) {
    notFound();
  }

  const difficultyColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-blue-100 text-blue-800",
    advanced: "bg-purple-100 text-purple-800",
    expert: "bg-red-100 text-red-800",
  };

  const moduleTypeIcons: Record<string, typeof BookOpen> = {
    article: BookOpen,
    video: Play,
    quiz: BarChart3,
    flashcard: Star,
    project: Star,
    case_study: BookOpen,
    ai_tutor: Star,
    mastery_check: Star,
    final_assessment: Star,
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">K</span>
            </div>
            <span className="font-bold text-xl">Kibi</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Course Content */}
      <div className="container px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <Badge className={difficultyColors[course.difficulty]} variant="secondary">
              {course.difficulty}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight mt-4 mb-4">
              {course.title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {course.description}
            </p>

            {/* Creator */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <Avatar className="h-10 w-10">
                <AvatarImage src={course.owner.avatarUrl} />
                <AvatarFallback>{course.owner.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium">Created by</p>
                <p className="text-sm text-muted-foreground">
                  {course.owner.name}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(course.estimatedDurationMinutes)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{course.learnerCount.toLocaleString()} learners</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{course.rating} rating</span>
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center py-8">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  Preview Course Content
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  This is a preview of the course content. Sign up or log in to
                  start learning and track your progress.
                </p>

                {/* Module Preview */}
                <div className="w-full max-w-md space-y-3 mb-8">
                  {course.modules.slice(0, 3).map((module, index) => {
                    const Icon = moduleTypeIcons[module.type] || BookOpen;
                    return (
                      <div
                        key={module.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">{module.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {module.estimatedMinutes} min
                          </p>
                        </div>
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    );
                  })}
                </div>

                {/* CTA */}
                <div className="space-y-3 w-full max-w-sm">
                  <Link href={`/signup?redirect=/courses/${course.id}`}>
                    <Button className="w-full" size="lg">
                      <Play className="w-4 h-4 mr-2" />
                      Start This Course
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Free account required to track your progress
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What You Get */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Personalized Learning
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                AI adapts to your pace and focuses on areas where you need most
                practice.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Spaced Repetition
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Mastery tracking ensures you retain knowledge with
                scientifically-proven methods.
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Real-time Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Track your progress with detailed insights into your learning
                journey.
              </CardContent>
            </Card>
          </div>

          {/* Remixing Option */}
          {course.remixable && (
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Copy className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Want to personalize this?</h3>
                      <p className="text-sm text-muted-foreground">
                        Remix this course with your own preferences and goals
                      </p>
                    </div>
                  </div>
                  <Link href={`/remix/${course.id}`}>
                    <Button variant="outline">
                      <Copy className="w-4 h-4 mr-2" />
                      Remix Course
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
