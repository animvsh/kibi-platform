import { NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth/jwt";

export interface CreatorAnalytics {
  totalCourses: number;
  totalLearners: number;
  averageCompletionRate: number;
  totalRemixes: number;
  publicCourses: number;
  privateCourses: number;
  mostDifficultConcepts: {
    concept: string;
    struggleRate: number;
    course: string;
  }[];
  mostPopularCourses: {
    id: string;
    title: string;
    learners: number;
    trend: string;
  }[];
  coursePerformance: {
    id: string;
    title: string;
    learners: number;
    completionRate: number;
  }[];
}

// GET /api/creator/analytics
export async function GET() {
  try {
    const user = await getUserFromCookies();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // In production, fetch real data from database
    // For now, return mock data
    const analytics: CreatorAnalytics = {
      totalCourses: 8,
      totalLearners: 1247,
      averageCompletionRate: 68,
      totalRemixes: 23,
      publicCourses: 5,
      privateCourses: 3,
      mostDifficultConcepts: [
        { concept: "React Hooks", struggleRate: 35, course: "React Fundamentals" },
        { concept: "Type Generics", struggleRate: 42, course: "TypeScript Essentials" },
        { concept: "Neural Networks", struggleRate: 48, course: "Advanced Machine Learning" },
        { concept: "Principal Component Analysis", struggleRate: 38, course: "Python for Data Science" },
        { concept: "XSS Prevention", struggleRate: 28, course: "Web Security Basics" },
      ],
      mostPopularCourses: [
        { id: "3", title: "Python for Data Science", learners: 421, trend: "+12%" },
        { id: "1", title: "React Fundamentals", learners: 342, trend: "+8%" },
        { id: "2", title: "TypeScript Essentials", learners: 287, trend: "+5%" },
      ],
      coursePerformance: [
        { id: "1", title: "React Fundamentals", learners: 342, completionRate: 72 },
        { id: "2", title: "TypeScript Essentials", learners: 287, completionRate: 65 },
        { id: "3", title: "Python for Data Science", learners: 421, completionRate: 78 },
        { id: "4", title: "Advanced Machine Learning", learners: 156, completionRate: 45 },
        { id: "5", title: "Web Security Basics", learners: 198, completionRate: 58 },
        { id: "6", title: "Docker & Containers", learners: 89, completionRate: 52 },
      ],
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching creator analytics:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}