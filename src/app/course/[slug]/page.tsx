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
  Link as LinkIcon,
} from "lucide-react";

interface PublicCoursePageProps {
  params: Promise<{ slug: string }>;
}

// Mock data for public course (in production, fetch from API)
const mockPublicCourse = {
  id: "demo-1",
  ownerId: "user-1",
  owner: {
    name: "Sarah Chen",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
  },
  title: "React Fundamentals",
  slug: "react-fundamentals",
  description:
    "Master the fundamentals of React including components, state, props, and hooks. Build real-world applications with modern React patterns. This comprehensive course covers everything from JSX basics to advanced state management patterns.",
  difficulty: "beginner" as const,
  estimatedDurationMinutes: 180,
  thumbnailUrl:
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200",
  visibility: "public" as const,
  remixable: true,
  status: "ready" as const,
  learnerCount: 1247,
  remixCount: 342,
  rating: 4.8,
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-20T15:30:00Z",
  modules: [
    {
      id: "mod-1",
      title: "Introduction to React",
      type: "article",
      estimatedMinutes: 15,
      preview: true,
    },
    {
      id: "mod-2",
      title: "Components and Props",
      type: "video",
      estimatedMinutes: 25,
      preview: true,
    },
    {
      id: "mod-3",
      title: "State Management",
      type: "quiz",
      estimatedMinutes: 20,
      preview: false,
    },
    {
      id: "mod-4",
      title: "Hooks Deep Dive",
      type: "video",
      estimatedMinutes: 35,
      preview: false,
    },
    {
      id: "mod-5",
      title: "Final Assessment",
      type: "final_assessment",
      estimatedMinutes: 30,
      preview: false,
    },
  ],
  units: [
    {
      id: "unit-1",
      title: "Getting Started",
      description: "Set up your development environment and learn React basics",
      moduleCount: 3,
      completedCount: 0,
    },
    {
      id: "unit-2",
      title: "Core Concepts",
      description: "Deep dive into components, props, and state",
      moduleCount: 5,
      completedCount: 0,
    },
    {
      id: "unit-3",
      title: "Advanced Patterns",
      description: "Learn advanced state management and optimization techniques",
      moduleCount: 4,
      completedCount: 0,
    },
  ],
};

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PublicCoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = mockPublicCourse; // In production, fetch by slug

  return {
    title: `${course.title} | Kibi`,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
      images: [course.thumbnailUrl],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description: course.description,
      images: [course.thumbnailUrl],
    },
  };
}

export default async function PublicCoursePage({
  params,
}: PublicCoursePageProps) {
  const { slug } = await params;
  const course = mockPublicCourse; // In production, fetch by slug

  // Handle course not found
  if (!course || course.slug !== slug) {
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        <div
          className="h-64 md:h-80 bg-cover bg-center"
          style={{ backgroundImage: `url(${course.thumbnailUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="container relative -mt-32 px-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Course Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  className={difficultyColors[course.difficulty]}
                  variant="secondary"
                >
                  {course.difficulty}
                </Badge>
                <Badge variant="outline">
                  <Globe className="w-3 h-3 mr-1" />
                  Public
                </Badge>
                {course.remixable && (
                  <Badge variant="outline">
                    <Copy className="w-3 h-3 mr-1" />
                    Remixable
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {course.title}
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl">
                {course.description}
              </p>

              {/* Creator Info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={course.owner.avatarUrl} />
                  <AvatarFallback>
                    {course.owner.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Created by</p>
                  <p className="text-sm text-muted-foreground">
                    {course.owner.name}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                <div className="flex items-center gap-1">
                  <Copy className="w-4 h-4" />
                  <span>{course.remixCount} remixes</span>
                </div>
              </div>
            </div>

            {/* Action Cards */}
            <div className="w-full md:w-80 space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <Link href={`/signup?redirect=/courses/${course.id}`}>
                    <Button className="w-full" size="lg">
                      <Play className="w-4 h-4 mr-2" />
                      Start This Course
                    </Button>
                  </Link>
                  <Link href={`/remix/${course.id}`}>
                    <Button variant="outline" className="w-full" size="lg">
                      <Copy className="w-4 h-4 mr-2" />
                      Remix This Course
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Copy Share Link
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    What You Will Learn
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                    <span>Build modern React applications from scratch</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                    <span>Master component composition and reusability</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                    <span>Understand state management patterns</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                    <span>Apply best practices and performance optimization</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Units Overview */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Course Structure</h2>
              <div className="space-y-4">
                {course.units.map((unit, index) => (
                  <Card key={unit.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                            {index + 1}
                          </div>
                          <CardTitle className="text-base">{unit.title}</CardTitle>
                        </div>
                        <Badge variant="secondary">
                          {unit.moduleCount} modules
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {unit.description}
                      </p>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </section>

            {/* Modules Preview */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Course Modules</h2>
              <div className="space-y-3">
                {course.modules.map((module, index) => {
                  const Icon = moduleTypeIcons[module.type] || BookOpen;
                  return (
                    <Card
                      key={module.id}
                      className={module.preview ? "border-primary/30" : ""}
                    >
                      <CardContent className="flex items-center gap-4 py-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {index + 1}.
                            </span>
                            <p className="font-medium">{module.title}</p>
                            {module.preview && (
                              <Badge variant="outline" className="text-xs">
                                Preview
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {module.type.replace("_", " ")} &bull;{" "}
                            {module.estimatedMinutes} min
                          </p>
                        </div>
                        {module.preview && (
                          <Button variant="ghost" size="sm">
                            Preview
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Requirements */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                  <span>Basic JavaScript knowledge</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                  <span>Understanding of HTML and CSS</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                  <span>A computer with internet access</span>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[
                    "React",
                    "JavaScript",
                    "Web Development",
                    "Frontend",
                    "Hooks",
                    "State Management",
                  ].map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
