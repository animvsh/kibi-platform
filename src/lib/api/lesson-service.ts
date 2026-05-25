import { NextResponse } from "next/server";
import type { Lesson, Quiz, QuizQuestion, XpEvent, UserCourseProgress } from "@/types";
import { XP_REWARDS } from "@/lib/stores/progress-store";

// In-memory progress store (would be database in production)
const userProgressStore = new Map<string, UserCourseProgress>();
const xpEventsStore = new Map<string, XpEvent[]>();

export const lessonService = {
  /**
   * Mark a lesson as complete and update progress
   */
  async completeLesson(
    userId: string,
    courseId: string,
    lessonId: string
  ): Promise<{
    success: boolean;
    xpAwarded: number;
    newProgress: UserCourseProgress;
  }> {
    const progressKey = `${userId}:${courseId}`;
    const existingProgress = userProgressStore.get(progressKey);

    const now = new Date().toISOString();

    let newProgress: UserCourseProgress;

    if (existingProgress) {
      newProgress = {
        ...existingProgress,
        lastActiveAt: now,
        overallProgress: Math.min(100, existingProgress.overallProgress + 5), // Simplified progress calc
        status: "in_progress",
      };
    } else {
      newProgress = {
        id: crypto.randomUUID(),
        userId,
        courseId,
        currentLessonId: lessonId,
        overallProgress: 5,
        overallMastery: 0,
        status: "in_progress",
        startedAt: now,
        lastActiveAt: now,
      };
    }

    userProgressStore.set(progressKey, newProgress);

    // Create XP event
    const xpEvent: XpEvent = {
      id: crypto.randomUUID(),
      userId,
      courseId,
      eventType: "lesson_complete",
      xpAmount: XP_REWARDS.LESSON_COMPLETE,
      metadataJson: { lessonId },
      createdAt: now,
    };

    const userEvents = xpEventsStore.get(userId) || [];
    userEvents.push(xpEvent);
    xpEventsStore.set(userId, userEvents);

    return {
      success: true,
      xpAwarded: XP_REWARDS.LESSON_COMPLETE,
      newProgress,
    };
  },

  /**
   * Get user progress for a course
   */
  async getCourseProgress(
    userId: string,
    courseId: string
  ): Promise<UserCourseProgress | null> {
    const progressKey = `${userId}:${courseId}`;
    return userProgressStore.get(progressKey) || null;
  },

  /**
   * Get user's XP events
   */
  async getXpEvents(userId: string): Promise<XpEvent[]> {
    return xpEventsStore.get(userId) || [];
  },

  /**
   * Calculate mastery based on quiz performance
   */
  async updateMastery(
    userId: string,
    courseId: string,
    conceptId: string,
    correct: boolean,
    difficulty: number = 1
  ): Promise<number> {
    // Simplified mastery calculation
    // In production, use spaced repetition algorithms like SM-2
    const baseChange = correct ? 10 * difficulty : -5;
    return Math.max(0, Math.min(100, baseChange));
  },
};

/**
 * Lesson content types for rendering
 */
export interface LessonContentData {
  title: string;
  content: string; // Markdown content
  keyTakeaways: string[];
  miniCheckQuestions: {
    question: string;
    correctAnswer: string;
    explanation: string;
  }[];
  videoUrl?: string;
  estimatedMinutes: number;
}

/**
 * Parse lesson content from JSON format
 */
export function parseLessonContent(contentJson?: Record<string, unknown>): LessonContentData | null {
  if (!contentJson) return null;

  return {
    title: (contentJson.title as string) || "",
    content: (contentJson.content as string) || "",
    keyTakeaways: (contentJson.keyTakeaways as string[]) || [],
    miniCheckQuestions: (contentJson.miniCheckQuestions as LessonContentData["miniCheckQuestions"]) || [],
    videoUrl: contentJson.videoUrl as string | undefined,
    estimatedMinutes: (contentJson.estimatedMinutes as number) || 15,
  };
}

/**
 * Parse quiz questions from JSON
 */
export function parseQuizQuestions(
  questions: QuizQuestion[]
): (QuizQuestion & { options: string[] })[] {
  return questions.map((q) => ({
    ...q,
    options: q.optionsJson || [],
  }));
}
