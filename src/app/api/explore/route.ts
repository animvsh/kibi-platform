import { NextRequest, NextResponse } from "next/server";
import { courseRepository } from "@/lib/db";
import type { CourseDifficulty } from "@/types";

// Valid difficulty levels
const VALID_DIFFICULTIES: CourseDifficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
];

// In-memory store for learner counts (in production, use database)
const learnerCountsStore = new Map<string, number>();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const search = searchParams.get("search") || "";
    const difficulty = searchParams.get("difficulty");
    const category = searchParams.get("category");
    const maxDuration = searchParams.get("maxDuration");
    const sortBy = searchParams.get("sortBy") || "popular";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "12", 10);

    // Validate difficulty
    if (difficulty && !VALID_DIFFICULTIES.includes(difficulty as CourseDifficulty)) {
      return NextResponse.json(
        { message: `Invalid difficulty. Must be one of: ${VALID_DIFFICULTIES.join(", ")}` },
        { status: 400 }
      );
    }

    // Get all courses (in production, query database with filters)
    // For now, we return empty results since we're using in-memory store
    // This would be replaced with actual database queries

    // Mock public courses for demonstration
    const mockCourses = [
      {
        id: "demo-1",
        ownerId: "user-1",
        title: "React Fundamentals",
        slug: "react-fundamentals",
        description: "Master the fundamentals of React including components, state, props, and hooks.",
        sourceType: "prompt" as const,
        difficulty: "beginner" as CourseDifficulty,
        estimatedDurationMinutes: 180,
        visibility: "public" as const,
        remixable: true,
        status: "ready" as const,
        thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-20T15:30:00Z",
      },
      {
        id: "demo-2",
        ownerId: "user-2",
        title: "Advanced TypeScript Patterns",
        slug: "advanced-typescript-patterns",
        description: "Deep dive into advanced TypeScript patterns including generics, conditional types, and decorators.",
        sourceType: "prompt" as const,
        difficulty: "advanced" as CourseDifficulty,
        estimatedDurationMinutes: 240,
        visibility: "public" as const,
        remixable: true,
        status: "ready" as const,
        thumbnailUrl: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800",
        createdAt: "2024-02-01T09:00:00Z",
        updatedAt: "2024-02-10T12:00:00Z",
      },
      {
        id: "demo-3",
        ownerId: "user-3",
        title: "Python for Data Science",
        slug: "python-data-science",
        description: "Learn Python programming with a focus on data analysis, visualization, and machine learning.",
        sourceType: "prompt" as const,
        difficulty: "intermediate" as CourseDifficulty,
        estimatedDurationMinutes: 360,
        visibility: "public" as const,
        remixable: true,
        status: "ready" as const,
        thumbnailUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800",
        createdAt: "2024-01-20T14:00:00Z",
        updatedAt: "2024-01-25T18:00:00Z",
      },
    ];

    // Filter courses
    let filteredCourses = mockCourses.filter((course) => {
      // Only public courses
      if (course.visibility !== "public") return false;

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          course.title.toLowerCase().includes(searchLower) ||
          course.description.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Difficulty filter
      if (difficulty && course.difficulty !== difficulty) return false;

      // Duration filter
      if (maxDuration) {
        const maxMinutes = parseInt(maxDuration, 10);
        if (course.estimatedDurationMinutes > maxMinutes) return false;
      }

      return true;
    });

    // Sort courses
    switch (sortBy) {
      case "popular":
        filteredCourses.sort((a, b) => {
          const countA = learnerCountsStore.get(a.id) || 0;
          const countB = learnerCountsStore.get(b.id) || 0;
          return countB - countA;
        });
        break;
      case "newest":
        filteredCourses.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "shortest":
        filteredCourses.sort(
          (a, b) => a.estimatedDurationMinutes - b.estimatedDurationMinutes
        );
        break;
      case "longest":
        filteredCourses.sort(
          (a, b) => b.estimatedDurationMinutes - a.estimatedDurationMinutes
        );
        break;
    }

    // Calculate pagination
    const total = filteredCourses.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedCourses = filteredCourses.slice(
      startIndex,
      startIndex + pageSize
    );

    // Add learner counts to response
    const coursesWithCounts = paginatedCourses.map((course) => ({
      ...course,
      learnerCount: learnerCountsStore.get(course.id) || 0,
    }));

    return NextResponse.json({
      data: coursesWithCounts,
      total,
      page,
      pageSize,
      totalPages,
      filters: {
        search,
        difficulty,
        category,
        maxDuration,
        sortBy,
      },
    });
  } catch (error) {
    console.error("Error exploring courses:", error);
    return NextResponse.json(
      { message: "Failed to explore courses" },
      { status: 500 }
    );
  }
}
