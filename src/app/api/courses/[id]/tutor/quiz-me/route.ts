/**
 * Quiz Me API
 * POST /api/courses/[id]/tutor/quiz-me
 * Generates quiz questions for the current lesson or specified topic
 */

import { NextRequest, NextResponse } from "next/server";
import { buildTutorContext } from "@/lib/tutor/context-builder";
import { executeTutorAction } from "@/lib/tutor/actions";
import { recordTutorInteraction, processQuizResponse } from "@/lib/tutor/learning-updater";

interface QuizMeRequest {
  lessonId?: string;
  conceptId?: string;
  topic?: string;
  questionCount?: number;
  userId?: string;
}

interface QuizAnswerRequest {
  conceptId: string;
  questionIndex: number;
  answer: string;
  responseTimeMs?: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const body: QuizMeRequest = await request.json();

    const { lessonId, conceptId, topic, questionCount = 3, userId: providedUserId } = body;

    const userId = request.headers.get("X-User-Id") || providedUserId || "demo-user";

    // Build context
    const context = await buildTutorContext({
      userId,
      courseId,
      lessonId,
    });

    // Determine the topic to quiz on
    const quizTopic = topic || conceptId || context.currentLesson?.title || "the current topic";

    // Record interaction
    recordTutorInteraction(userId, courseId, conceptId || lessonId || "current", "question");

    const message = `Generate ${questionCount} quiz questions about "${quizTopic}"`;

    const result = await executeTutorAction({
      userId,
      courseId,
      lessonId,
      action: "quiz_me",
      message,
      context,
    });

    return NextResponse.json({
      success: true,
      quiz: result.response,
      topic: quizTopic,
      questionCount,
      metadata: result.metadata,
      suggestedActions: result.suggestedActions,
    });
  } catch (error) {
    console.error("Quiz me error:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}

/**
 * Submit quiz answer
 * POST /api/courses/[id]/tutor/quiz-me/answer
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const body: QuizAnswerRequest = await request.json();

    const { conceptId, questionIndex, answer, responseTimeMs = 5000 } = body;
    const userId = request.headers.get("X-User-Id") || "demo-user";

    // Process the answer
    // In a real implementation, we'd check the answer against stored correct answers
    // For now, we'll use a simple heuristic and let the tutor evaluate
    const isCorrect = answer.toLowerCase().includes("b"); // Mock - real implementation would check

    const result = processQuizResponse(
      userId,
      courseId,
      conceptId,
      isCorrect,
      responseTimeMs
    );

    return NextResponse.json({
      success: true,
      isCorrect,
      feedback: isCorrect
        ? "Correct! Well done."
        : "Not quite. Let's review this concept.",
      masteryDelta: result.masteryDelta,
      newMasteryScore: result.newMasteryScore,
      isUnstable: result.isUnstable,
      newPracticeRecommended: result.newPracticeRecommended,
    });
  } catch (error) {
    console.error("Quiz answer error:", error);
    return NextResponse.json(
      { error: "Failed to process answer" },
      { status: 500 }
    );
  }
}
