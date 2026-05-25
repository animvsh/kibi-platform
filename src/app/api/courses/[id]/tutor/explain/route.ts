/**
 * Explain API
 * POST /api/courses/[id]/tutor/explain
 * Provides explanations at different difficulty levels
 */

import { NextRequest, NextResponse } from "next/server";
import { buildTutorContext } from "@/lib/tutor/context-builder";
import { executeTutorAction } from "@/lib/tutor/actions";

interface ExplainRequest {
  lessonId?: string;
  conceptId?: string;
  topic?: string;
  level?: "beginner" | "intermediate" | "advanced";
  userId?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const body: ExplainRequest = await request.json();

    const { lessonId, conceptId, topic, level = "beginner", userId: providedUserId } = body;

    const userId = request.headers.get("X-User-Id") || providedUserId || "demo-user";

    // Build context
    const context = await buildTutorContext({
      userId,
      courseId,
      lessonId,
    });

    // Determine the topic to explain
    const explainTopic = topic || conceptId || context.currentLesson?.title || "the current topic";

    // Build explanation request based on level
    let message = `Explain "${explainTopic}"`;
    if (level === "beginner") {
      message += " in the simplest possible terms, using everyday analogies.";
    } else if (level === "intermediate") {
      message += " at an intermediate level with some technical details.";
    } else {
      message += " at an advanced level with deep technical insights.";
    }

    // Record interaction
    import("@/lib/tutor/learning-updater").then(({ recordTutorInteraction }) => {
      recordTutorInteraction(userId, courseId, conceptId || lessonId || "current", "explanation");
    });

    const result = await executeTutorAction({
      userId,
      courseId,
      lessonId,
      action: "explain_simpler",
      message,
      context,
    });

    return NextResponse.json({
      success: true,
      explanation: result.response,
      topic: explainTopic,
      level,
      keyTakeaways: context.currentLesson?.keyTakeaways || [],
      suggestedActions: result.suggestedActions,
    });
  } catch (error) {
    console.error("Explain error:", error);
    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 500 }
    );
  }
}
