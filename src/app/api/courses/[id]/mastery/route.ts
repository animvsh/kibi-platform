/**
 * GET /api/courses/[id]/mastery
 * Get overall mastery scores for a course
 */

import { NextRequest, NextResponse } from "next/server";
import { masteryCalculator } from "@/lib/mastery/calculator";
import { unlockRules } from "@/lib/mastery/unlock-rules";
import { spacedRepetition } from "@/lib/mastery/spaced-repetition";

// In-memory concept mastery storage
const conceptMasteriesStore = new Map<string, {
  conceptId: string;
  masteryScore: number;
  isCore: boolean;
}>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const userId = request.headers.get("X-User-Id") || "demo-user";

    // Get all concept masteries for this course
    const conceptMasteries: { conceptId: string; masteryScore: number; isCore: boolean }[] = [];

    for (const [key, value] of conceptMasteriesStore) {
      if (key.startsWith(`${userId}:${courseId}:`)) {
        conceptMasteries.push(value);
      }
    }

    // If no data exists, return zeros
    if (conceptMasteries.length === 0) {
      return NextResponse.json({
        data: {
          courseId,
          userId,
          overallMastery: 0,
          conceptCount: 0,
          concepts: [],
          statusCounts: {
            not_learned: 0,
            familiar: 0,
            developing: 0,
            proficient: 0,
            strong: 0,
            mastered: 0,
          },
          dueReviews: 0,
          lastCalculatedAt: new Date().toISOString(),
        },
      });
    }

    // Calculate overall mastery
    const overallMastery = masteryCalculator.calculateCourseMastery(
      conceptMasteries.map(cm => ({ score: cm.masteryScore, isCore: cm.isCore }))
    );

    // Count by status
    const statusCounts = {
      not_learned: 0,
      familiar: 0,
      developing: 0,
      proficient: 0,
      strong: 0,
      mastered: 0,
    };

    for (const cm of conceptMasteries) {
      const status = masteryCalculator.getStatus(cm.masteryScore);
      statusCounts[status]++;
    }

    // Get SM-2 stats
    const sm2Stats = spacedRepetition.getStats(userId);

    return NextResponse.json({
      data: {
        courseId,
        userId,
        overallMastery,
        conceptCount: conceptMasteries.length,
        concepts: conceptMasteries,
        statusCounts,
        dueReviews: sm2Stats.dueToday,
        lastCalculatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching mastery:", error);
    return NextResponse.json(
      { error: "Failed to fetch mastery" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/courses/[id]/mastery
 * Update concept mastery (called after quiz/activity completion)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const userId = request.headers.get("X-User-Id") || "demo-user";
    const body = await request.json();

    const { conceptId, quizScores, attemptCount, timePerQuestion, confidenceScores, flashcardRatings } = body;

    if (!conceptId) {
      return NextResponse.json(
        { error: "conceptId is required" },
        { status: 400 }
      );
    }

    // Get previous mastery
    const previousMastery = await unlockRules.getUserConceptMastery(userId, conceptId);

    // Calculate new mastery
    const result = masteryCalculator.calculate({
      conceptId,
      userId,
      quizScores: quizScores || [previousMastery.masteryScore],
      attemptCount: attemptCount || 1,
      timePerQuestion,
      confidenceScores,
      flashcardRatings,
      lastPracticedAt: previousMastery.lastPracticedAt,
      previousMasteryScore: previousMastery.masteryScore,
    });

    // Update stored mastery
    await unlockRules.updateConceptMastery(
      userId,
      courseId,
      conceptId,
      result.masteryScore,
      result.components.confidenceScore
    );

    // Update in-memory store
    conceptMasteriesStore.set(`${userId}:${courseId}:${conceptId}`, {
      conceptId,
      masteryScore: result.masteryScore,
      isCore: false, // Would be determined from concept graph
    });

    return NextResponse.json({
      data: {
        conceptId,
        previousScore: result.previousScore,
        newScore: result.masteryScore,
        delta: result.delta,
        status: result.status,
        level: result.level,
        components: result.components,
        calculatedAt: result.calculatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating mastery:", error);
    return NextResponse.json(
      { error: "Failed to update mastery" },
      { status: 500 }
    );
  }
}
