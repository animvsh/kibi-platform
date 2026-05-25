"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, BookOpen, Clock, Users } from "lucide-react";

// Mock data
const mockCourses = [
  {
    id: "1",
    title: "React Fundamentals",
    description: "Learn the basics of React including components, state, and props",
    progress: 65,
    status: "in_progress",
    unitCount: 5,
    lessonCount: 24,
    estimatedMinutes: 180,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "TypeScript Essentials",
    description: "Master TypeScript from basics to advanced patterns",
    progress: 30,
    status: "in_progress",
    unitCount: 4,
    lessonCount: 18,
    estimatedMinutes: 120,
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    title: "Python for Data Science",
    description: "Introduction to Python programming for data analysis",
    progress: 0,
    status: "not_started",
    unitCount: 6,
    lessonCount: 30,
    estimatedMinutes: 240,
    createdAt: "2024-02-01",
  },
  {
    id: "4",
    title: "Advanced Machine Learning",
    description: "Deep dive into ML algorithms and neural networks",
    progress: 100,
    status: "completed",
    unitCount: 8,
    lessonCount: 40,
    estimatedMinutes: 300,
    createdAt: "2023-12-01",
  },
];

export default function CoursesPage() {
  const [search, setSearch] = useState("");

  const filteredCourses = mockCourses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase())
  );

  const inProgressCourses = filteredCourses.filter(
    (c) => c.status === "in_progress"
  );
  const completedCourses = filteredCourses.filter(
    (c) => c.status === "completed"
  );
  const notStartedCourses = filteredCourses.filter(
    (c) => c.status === "not_started"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground">
            Manage and continue your learning courses
          </p>
        </div>
        <Link href="/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Course
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Course Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            All ({filteredCourses.length})
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            In Progress ({inProgressCourses.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {inProgressCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {completedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CourseCard({ course }: { course: typeof mockCourses[0] }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-lg">{course.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {course.description}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant={course.status === "completed" ? "default" : "secondary"}>
            {course.status === "completed" ? "Completed" : "In Progress"}
          </Badge>
          <Badge variant="outline">
            <BookOpen className="mr-1 h-3 w-3" />
            {course.lessonCount} lessons
          </Badge>
          <Badge variant="outline">
            <Clock className="mr-1 h-3 w-3" />
            {course.estimatedMinutes} min
          </Badge>
        </div>

        {course.status !== "not_started" && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
        )}

        <Link href={`/courses/${course.id}`}>
          <Button className="w-full" variant={course.progress > 0 ? "default" : "outline"}>
            {course.status === "completed"
              ? "Review"
              : course.progress > 0
              ? "Continue"
              : "Start"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
