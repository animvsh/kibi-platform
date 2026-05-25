import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, Flame, Trophy, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

// Mock data for dashboard - in production this would come from API
const mockCourses = [
  {
    id: "1",
    title: "React Fundamentals",
    description: "Learn the basics of React including components, state, and props",
    progress: 65,
    status: "in_progress",
    unitCount: 5,
    lessonCount: 24,
  },
  {
    id: "2",
    title: "TypeScript Essentials",
    description: "Master TypeScript from basics to advanced patterns",
    progress: 30,
    status: "in_progress",
    unitCount: 4,
    lessonCount: 18,
  },
  {
    id: "3",
    title: "Python for Data Science",
    description: "Introduction to Python programming for data analysis",
    progress: 0,
    status: "not_started",
    unitCount: 6,
    lessonCount: 30,
  },
];

const mockStats = {
  totalXp: 2450,
  level: 12,
  currentStreak: 7,
  longestStreak: 14,
  coursesInProgress: 2,
  coursesCompleted: 3,
  lessonsCompleted: 42,
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user = token ? verifyToken(token) : null;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back{user ? `, ${user.email.split("@")[0]}` : ""}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Continue your learning journey. You&apos;re doing great!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-2xl font-bold">{mockStats.totalXp.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{mockStats.currentStreak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lessons Done</p>
                <p className="text-2xl font-bold">{mockStats.lessonsCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Courses</p>
                <p className="text-2xl font-bold">
                  {mockStats.coursesCompleted} <span className="text-sm text-muted-foreground">completed</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Continue Learning</h2>
            <Link href="/courses">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={course.status === "in_progress" ? "default" : "secondary"}
                    >
                      {course.status === "in_progress" ? "In Progress" : "Not Started"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{course.unitCount} units</span>
                    <span>{course.lessonCount} lessons</span>
                  </div>

                  <Link href={`/courses/${course.id}`} className="block">
                    <Button className="w-full" variant={course.progress > 0 ? "default" : "outline"}>
                      {course.progress > 0 ? "Continue" : "Start"} Learning
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}

            {/* Create New Course Card */}
            <Link href="/create">
              <Card className="border-dashed h-full min-h-[280px] flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer">
                <CardContent className="text-center space-y-2">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                    <Plus className="h-6 w-6 text-slate-500" />
                  </div>
                  <p className="font-medium">Create New Course</p>
                  <p className="text-sm text-muted-foreground">
                    Generate a course from any topic
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">
                Recent activity will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">
                Achievements will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
