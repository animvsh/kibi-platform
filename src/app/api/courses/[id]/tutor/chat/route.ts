/**
 * Tutor Chat API
 * POST /api/courses/[id]/tutor/chat
 * Accepts message and current context, returns AI response
 */

import { NextRequest, NextResponse } from "next/server";
import { buildTutorContext, formatContextForPrompt } from "@/lib/tutor/context-builder";
import { executeTutorAction, getQuickActions, type TutorAction } from "@/lib/tutor/actions";
import { recordTutorInteraction, updateConceptStability } from "@/lib/tutor/learning-updater";
import { chatCompletion, type MiniMaxMessage } from "@/lib/ai/minimax";

interface ChatRequest {
  message: string;
  currentLessonId?: string;
  action?: TutorAction;
  userId?: string;
}

interface ChatResponse {
  response: string;
  action?: TutorAction;
  suggestedActions?: { action: TutorAction; label: string; icon: string }[];
  context?: {
    currentLesson?: string;
    progress?: number;
    mastery?: number;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Detect action from user message
 */
function detectActionFromMessage(message: string): TutorAction | null {
  const lower = message.toLowerCase();

  const actionPatterns: { pattern: RegExp; action: TutorAction }[] = [
    { pattern: /simpler|easier|basic|beginner|simplify/, action: "explain_simpler" },
    { pattern: /example|demo|illustration|show me/, action: "give_example" },
    { pattern: /quiz|test|question|check my/, action: "quiz_me" },
    { pattern: /practice|exercise|drill|more/, action: "create_practice" },
    { pattern: /flashcard|card|study/, action: "make_flashcards" },
    { pattern: /next|what to study|recommend|study plan/, action: "what_to_study_next" },
    { pattern: /ready|next unit|can i move on|proceed/, action: "am_i_ready" },
    { pattern: /cram|quick review|review plan|intense/, action: "cram_plan" },
  ];

  for (const { pattern, action } of actionPatterns) {
    if (pattern.test(lower)) {
      return action;
    }
  }

  return null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const body: ChatRequest = await request.json();

    const { message, currentLessonId, action: requestedAction, userId: providedUserId } = body;

    // Get user ID from header or use provided
    const userId = request.headers.get("X-User-Id") || providedUserId || "demo-user";

    if (!message && !requestedAction) {
      return NextResponse.json(
        { error: "Message or action is required" },
        { status: 400 }
      );
    }

    // Build tutor context
    const context = await buildTutorContext({
      userId,
      courseId,
      lessonId: currentLessonId,
    });

    // Determine action to take
    const action = requestedAction || detectActionFromMessage(message) || "general_help";

    // Record the interaction for learning tracking
    if (context.currentLesson) {
      // Extract concept from current lesson for tracking
      const conceptId = currentLessonId || "current";
      recordTutorInteraction(userId, courseId, conceptId, "question");
    }

    // Execute the action
    const result = await executeTutorAction({
      userId,
      courseId,
      lessonId: currentLessonId,
      action,
      message,
      context,
    });

    // Update concept stability
    if (context.currentLesson) {
      const conceptId = currentLessonId || "current";
      const stability = updateConceptStability(userId, courseId, conceptId);

      if (stability.isUnstable) {
        result.metadata = {
          ...result.metadata,
          conceptStabilityWarning: true,
          recommendedAction: stability.recommendedAction,
        };
      }
    }

    // Get quick action buttons
    const quickActions = getQuickActions();
    const suggestedActions = (result.suggestedActions || ["general_help"])
      .map((action) => {
        const config = quickActions.find((qa) => qa.action === action);
        return config
          ? { action: config.action, label: config.label, icon: config.icon }
          : null;
      })
      .filter(Boolean) as { action: TutorAction; label: string; icon: string }[];

    const response: ChatResponse = {
      response: result.response,
      action: result.action,
      suggestedActions: suggestedActions.slice(0, 4),
      context: {
        currentLesson: context.currentLesson?.title,
        progress: context.progress.overallProgress,
        mastery: context.progress.overallMastery,
      },
      metadata: result.metadata,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Tutor chat error:", error);

    // Fallback response
    return NextResponse.json({
      response: "I'm here to help you learn! Based on your course, I can explain concepts, give examples, quiz you, or recommend what to study next. What would you like?",
      suggestedActions: getQuickActions()
        .slice(0, 4)
        .map((qa) => ({ action: qa.action, label: qa.label, icon: qa.icon })),
    });
  }
}

/**
 * GET endpoint for initial tutor context
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const userId = request.headers.get("X-User-Id") || "demo-user";
    const lessonId = request.nextUrl.searchParams.get("lessonId") || undefined;

    const context = await buildTutorContext({
      userId,
      courseId,
      lessonId,
    });

    const quickActions = getQuickActions();

    return NextResponse.json({
      context: {
        course: context.course,
        currentLesson: context.currentLesson,
        progress: context.progress,
        concepts: {
          weak: context.concepts.weak,
          strong: context.concepts.strong,
        },
        suggestedTopics: context.suggestedTopics,
      },
      quickActions: quickActions.map((qa) => ({
        action: qa.action,
        label: qa.label,
        icon: qa.icon,
        description: qa.description,
      })),
    });
  } catch (error) {
    console.error("Tutor context error:", error);
    return NextResponse.json(
      { error: "Failed to load tutor context" },
      { status: 500 }
    );
  }
}
