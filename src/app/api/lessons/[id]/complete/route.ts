import { NextRequest, NextResponse } from "next/server";
import { lessonService } from "@/lib/api/lesson-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lessonId } = await params;

    // Get user ID from cookie/header (simplified - use auth in production)
    const userId = request.headers.get("X-User-Id") || "demo-user";

    // Get courseId from request body
    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Validate input
    if (!lessonId || typeof lessonId !== "string") {
      return NextResponse.json(
        { error: "Invalid lesson ID" },
        { status: 400 }
      );
    }

    const result = await lessonService.completeLesson(userId, courseId, lessonId);

    return NextResponse.json({
      success: result.success,
      xpAwarded: result.xpAwarded,
      progress: result.newProgress,
    });
  } catch (error) {
    console.error("Error completing lesson:", error);
    return NextResponse.json(
      { error: "Failed to complete lesson" },
      { status: 500 }
    );
  }
}
