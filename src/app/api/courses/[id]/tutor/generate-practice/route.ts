/**
 * Generate Practice API
 * POST /api/courses/[id]/tutor/generate-practice
 * Generates practice questions for a concept or current lesson
 */

import { NextRequest, NextResponse } from "next/server";
import { buildTutorContext } from "@/lib/tutor/context-builder";
import { executeTutorAction } from "@/lib/tutor/actions";

interface GeneratePracticeRequest {
  lessonId?: string;
  conceptId?: string;
  difficulty?: "easy" | "medium" | "hard";
  count?: number;
  userId?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const body: GeneratePracticeRequest = await request.json();

    const { lessonId, conceptId, difficulty = "medium", count = 5, userId: providedUserId } = body;

    const userId = request.headers.get("X-User-Id") || providedUserId || "demo-user";

    // Build context
    const context = await buildTutorContext({
      userId,
      courseId,
      lessonId,
    });

    // Execute practice creation
    const topic = conceptId || context.currentLesson?.title || "the current topic";
    const message = `Create ${count} ${difficulty} difficulty practice questions about ${topic}`;

    const result = await executeTutorAction({
      userId,
      courseId,
      lessonId,
      action: "create_practice",
      message,
      context,
    });

    return NextResponse.json({
      success: true,
      practice: result.response,
      topic,
      difficulty,
      count,
      suggestedActions: result.suggestedActions,
    });
  } catch (error) {
    console.error("Generate practice error:", error);
    return NextResponse.json(
      { error: "Failed to generate practice questions" },
      { status: 500 }
    );
  }
}
