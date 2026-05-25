"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Users,
  TrendingUp,
  Brain,
  Star,
  Globe,
  Lock,
  Copy,
  BarChart3,
  MoreVertical,
  ExternalLink,
} from "lucide-react";

// Mock creator data
const mockCreatorStats = {
  totalCourses: 8,
  totalLearners: 1247,
  averageCompletionRate: 68,
  totalRemixes: 23,
  publicCourses: 5,
  privateCourses: 3,
};

const mockCourses = [
  {
    id: "1",
    title: "React Fundamentals",
    description: "Learn the basics of React including components, state, and props",
    learners: 342,
    completionRate: 72,
    remixes: 8,
    status: "public" as const,
    difficulty: "Intermediate",
  },
  {
    id: "2",
    title: "TypeScript Essentials",
    description: "Master TypeScript from basics to advanced patterns",
    learners: 287,
    completionRate: 65,
    remixes: 5,
    status: "public" as const,
    difficulty: "Advanced",
  },
  {
    id: "3",
    title: "Python for Data Science",
    description: "Introduction to Python programming for data analysis",
    learners: 421,
    completionRate: 78,
    remixes: 12,
    status: "public" as const,
    difficulty: "Beginner",
  },
  {
    id: "4",
    title: "Advanced Machine Learning",
    description: "Deep dive into ML algorithms and neural networks",
    learners: 156,
    completionRate: 45,
    remixes: 3,
    status: "public" as const,
    difficulty: "Advanced",
  },
  {
    id: "5",
    title: "Web Security Basics",
    description: "Learn essential web security practices and common vulnerabilities",
    learners: 198,
    completionRate: 58,
    remixes: 4,
    status: "private" as const,
    difficulty: "Intermediate",
  },
  {
    id: "6",
    title: "Docker & Containers",
    description: "Master containerization with Docker and Kubernetes",
    learners: 89,
    completionRate: 52,
    remixes: 2,
    status: "private" as const,
    difficulty: "Advanced",
  },
];

const mockDifficultConcepts = [
  { concept: "React Hooks", struggleRate: 35, course: "React Fundamentals" },
  { concept: "Type Generics", struggleRate: 42, course: "TypeScript Essentials" },
  { concept: "Neural Networks", struggleRate: 48, course: "Advanced Machine Learning" },
  { concept: "Principal Component Analysis", struggleRate: 38, course: "Python for Data Science" },
  { concept: "XSS Prevention", struggleRate: 28, course: "Web Security Basics" },
];

const mockPopularCourses = [
  { id: "3", title: "Python for Data Science", learners: 421, trend: "+12%" },
  { id: "1", title: "React Fundamentals", learners: 342, trend: "+8%" },
  { id: "2", title: "TypeScript Essentials", learners: 287, trend: "+5%" },
];

export default function CreatorDashboardPage() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Creator Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Analytics and insights for your courses
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Courses Created</p>
                <p className="text-2xl font-bold">{mockCreatorStats.totalCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Learners</p>
                <p className="text-2xl font-bold">{mockCreatorStats.totalLearners.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Completion</p>
                <p className="text-2xl font-bold">{mockCreatorStats.averageCompletionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Copy className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Remixes</p>
                <p className="text-2xl font-bold">{mockCreatorStats.totalRemixes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Public/Private Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Public Courses</p>
                <p className="text-2xl font-bold">{mockCreatorStats.publicCourses}</p>
              </div>
              <Badge variant="default" className="bg-green-600">
                <Globe className="mr-1 h-3 w-3" />
                Public
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center">
                <Lock className="h-6 w-6 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Private Courses</p>
                <p className="text-2xl font-bold">{mockCreatorStats.privateCourses}</p>
              </div>
              <Badge variant="secondary">
                <Lock className="mr-1 h-3 w-3" />
                Private
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="popular">Most Popular</TabsTrigger>
        </TabsList>

        {/* My Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {mockCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </div>
                    <Badge variant={course.status === "public" ? "default" : "secondary"}>
                      {course.status === "public" ? (
                        <>
                          <Globe className="mr-1 h-3 w-3" />
                          Public
                        </>
                      ) : (
                        <>
                          <Lock className="mr-1 h-3 w-3" />
                          Private
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats Row */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{course.learners} learners</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Copy className="h-4 w-4 text-muted-foreground" />
                      <span>{course.remixes} remixes</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {course.difficulty}
                    </Badge>
                  </div>

                  {/* Completion Rate */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completion Rate</span>
                      <span className="font-medium">{course.completionRate}%</span>
                    </div>
                    <Progress value={course.completionRate} className="h-2" />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Analytics
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab - Most Difficult Concepts */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Most Difficult Concepts
              </CardTitle>
              <CardDescription>
                Concepts where learners struggle the most across your courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDifficultConcepts.map((item, index) => (
                  <div key={item.concept} className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-medium text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <p className="font-medium">{item.concept}</p>
                          <p className="text-sm text-muted-foreground">{item.course}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-red-600">{item.struggleRate}%</p>
                          <p className="text-xs text-muted-foreground">struggle rate</p>
                        </div>
                      </div>
                      <Progress value={item.struggleRate} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Course Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
              <CardDescription>
                Completion rates across all your courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCourses.map((course) => (
                  <div key={course.id} className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{course.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {course.learners} learners
                      </p>
                    </div>
                    <div className="w-32">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Completion</span>
                        <span className="font-medium">{course.completionRate}%</span>
                      </div>
                      <Progress value={course.completionRate} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Most Popular Tab */}
        <TabsContent value="popular" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Most Popular Courses
              </CardTitle>
              <CardDescription>
                Your courses with the highest number of learners
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPopularCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-slate-50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{course.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {course.learners.toLocaleString()} learners
                      </p>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      {course.trend}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
