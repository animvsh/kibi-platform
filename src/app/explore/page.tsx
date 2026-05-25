"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Search,
  Copy,
  Loader2,
} from "lucide-react";

interface ExploreCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  estimatedDurationMinutes: number;
  thumbnailUrl?: string;
  ownerId: string;
  owner?: {
    name: string;
    avatarUrl?: string;
  };
  learnerCount: number;
  rating: number;
  remixCount: number;
}

interface ExploreResponse {
  data: ExploreCourse[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters: {
    search: string;
    difficulty: string;
    maxDuration: string;
    sortBy: string;
  };
}

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [courses, setCourses] = useState<ExploreCourse[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );

  // Filter states
  const [difficulty, setDifficulty] = useState(
    searchParams.get("difficulty") || "all"
  );
  const [maxDuration, setMaxDuration] = useState(
    searchParams.get("maxDuration") || ""
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "popular");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (difficulty !== "all") params.set("difficulty", difficulty);
      if (maxDuration) params.set("maxDuration", maxDuration);
      params.set("sortBy", sortBy);
      params.set("page", page.toString());

      try {
        const response = await fetch(`/api/explore?${params.toString()}`);
        const data: ExploreResponse = await response.json();

        setCourses(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [searchQuery, difficulty, maxDuration, sortBy, page]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (difficulty !== "all") params.set("difficulty", difficulty);
    if (maxDuration) params.set("maxDuration", maxDuration);
    if (sortBy !== "popular") params.set("sortBy", sortBy);
    if (page > 1) params.set("page", page.toString());

    const queryString = params.toString();
    router.replace(queryString ? `/explore?${queryString}` : "/explore", {
      scroll: false,
    });
  }, [searchQuery, difficulty, maxDuration, sortBy, page, router]);

  const difficultyColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-blue-100 text-blue-800",
    advanced: "bg-purple-100 text-purple-800",
    expert: "bg-red-100 text-red-800",
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Explore Courses
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover courses created by the community, or remix them to make
              them your own.
            </p>
          </div>
        </div>
      </header>

      <div className="container px-4 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>

            <Select value={maxDuration} onValueChange={setMaxDuration}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Duration</SelectItem>
                <SelectItem value="60">Under 1 hour</SelectItem>
                <SelectItem value="180">Under 3 hours</SelectItem>
                <SelectItem value="300">Under 5 hours</SelectItem>
                <SelectItem value="600">Under 10 hours</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="shortest">Shortest</SelectItem>
                <SelectItem value="longest">Longest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${total} courses found`}
          </p>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">No courses found</h2>
            <p className="text-muted-foreground">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="group overflow-hidden transition-colors hover:border-primary/50"
              >
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BookOpen className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <Badge
                    className={`absolute top-3 right-3 ${difficultyColors[course.difficulty]}`}
                    variant="secondary"
                  >
                    {course.difficulty}
                  </Badge>
                </div>

                <CardContent className="pt-4">
                  <h3 className="font-semibold mb-2 line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(course.estimatedDurationMinutes)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{course.learnerCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Copy className="h-3 w-3" />
                      <span>{course.remixCount}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <div className="flex items-center justify-between w-full">
                    {course.owner && (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={course.owner.avatarUrl} />
                          <AvatarFallback className="text-xs">
                            {course.owner.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {course.owner.name}
                        </span>
                      </div>
                    )}
                    <Link href={`/course/${course.slug}`}>
                      <Button variant="ghost" size="sm">
                        View Course
                      </Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ExploreLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreLoading />}>
      <ExploreContent />
    </Suspense>
  );
}
