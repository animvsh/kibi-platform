import { NextRequest, NextResponse } from "next/server";
import { lessonService } from "@/lib/api/lesson-service";

// In-memory progress store (shared with lesson-service in production)
const userProgressStore = new Map<string, {
  id: string;
  userId: string;
  courseId: string;
  currentUnitId?: string;
  currentLessonId?: string;
  overallProgress: number;
  overallMastery: number;
  status: "not_started" | "in_progress" | "completed" | "abandoned";
  startedAt: string;
  lastActiveAt: string;
  completedAt?: string;
}>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;

    // Get user ID from cookie/header (simplified - use auth in production)
    const userId = request.headers.get("X-User-Id") || "demo-user";

    const progressKey = `${userId}:${courseId}`;
    const progress = userProgressStore.get(progressKey);

    if (!progress) {
      // Return default progress for new users
      return NextResponse.json({
        data: {
          courseId,
          currentUnitId: null,
          currentLessonId: null,
          overallProgress: 0,
          overallMastery: 0,
          status: "not_started",
          startedAt: null,
          lastActiveAt: null,
        },
      });
    }

    return NextResponse.json({ data: progress });
  } catch (error) {
    console.error("Error fetching course progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const body = await request.json();
    const { userId, currentUnitId, currentLessonId, overallProgress, overallMastery } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const progressKey = `${userId}:${courseId}`;
    const now = new Date().toISOString();

    const existingProgress = userProgressStore.get(progressKey);

    const updatedProgress = {
      id: existingProgress?.id || crypto.randomUUID(),
      userId,
      courseId,
      currentUnitId: currentUnitId || existingProgress?.currentUnitId,
      currentLessonId: currentLessonId || existingProgress?.currentLessonId,
      overallProgress: overallProgress ?? existingProgress?.overallProgress ?? 0,
      overallMastery: overallMastery ?? existingProgress?.overallMastery ?? 0,
      status: (overallProgress === 100 ? "completed" : overallProgress > 0 ? "in_progress" : "not_started") as "not_started" | "in_progress" | "completed" | "abandoned",
      startedAt: existingProgress?.startedAt || now,
      lastActiveAt: now,
      completedAt: overallProgress === 100 ? now : existingProgress?.completedAt,
    };

    userProgressStore.set(progressKey, updatedProgress);

    return NextResponse.json({ data: updatedProgress });
  } catch (error) {
    console.error("Error updating course progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
