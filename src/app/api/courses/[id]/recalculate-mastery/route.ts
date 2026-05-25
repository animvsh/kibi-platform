/**
 * POST /api/courses/[id]/recalculate-mastery
 * Recalculate mastery after activity completion
 */

import { NextRequest, NextResponse } from "next/server";
import { masteryCalculator, type MasteryCalculationInput, type MasteryResult } from "@/lib/mastery/calculator";
import { spacedRepetition, type SM2Rating } from "@/lib/mastery/spaced-repetition";
import { unlockRules } from "@/lib/mastery/unlock-rules";
import { remediationSystem } from "@/lib/mastery/remediation";

interface RecalculateRequest {
  conceptId?: string;
  conceptIds?: string[];  // Batch recalculation
  quizScore?: number;
  quizScores?: number[];
  attemptCount?: number;
  timePerQuestion?: number;
  timePerQuestions?: number[];
  confidenceScore?: number;
  confidenceScores?: number[];
  flashcardRating?: number;
  flashcardRatings?: number[];
  activityType: "quiz" | "flashcard" | "lesson" | "practice" | "mastery_check";
  triggerRemediation?: boolean;
}

// In-memory storage for mastery deltas
const masteryDeltaStore = new Map<string, { before: number; after: number; delta: number; timestamp: string }>();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const userId = request.headers.get("X-User-Id") || "demo-user";
    const body: RecalculateRequest = await request.json();

    const { activityType, triggerRemediation = false } = body;

    // Determine which concepts to recalculate
    let conceptIds: string[] = [];
    if (body.conceptId) {
      conceptIds = [body.conceptId];
    } else if (body.conceptIds) {
      conceptIds = body.conceptIds;
    } else {
      return NextResponse.json(
        { error: "Either conceptId or conceptIds must be provided" },
        { status: 400 }
      );
    }

    const results: {
      conceptId: string;
      before: number;
      after: number;
      delta: number;
      masteryResult: MasteryResult;
      sm2Result?: {
        nextReviewAt: string;
        wasSuccessful: boolean;
      };
      remediation?: ReturnType<typeof remediationSystem.generatePlan>;
    }[] = [];

    for (const conceptId of conceptIds) {
      // Get previous mastery
      const previousMastery = await unlockRules.getUserConceptMastery(userId, conceptId);
      const before = previousMastery.masteryScore;

      // Prepare calculation input based on activity type
      let calcInput: MasteryCalculationInput;

      switch (activityType) {
        case "quiz":
          calcInput = {
            conceptId,
            userId,
            quizScores: body.quizScores || (body.quizScore ? [body.quizScore] : []),
            attemptCount: body.attemptCount || 1,
            timePerQuestion: body.timePerQuestions || (body.timePerQuestion ? [body.timePerQuestion] : []),
            confidenceScores: body.confidenceScores || (body.confidenceScore ? [body.confidenceScore] : []),
            lastPracticedAt: previousMastery.lastPracticedAt,
            previousMasteryScore: before,
          };
          break;

        case "flashcard":
          // Flashcard review uses SM-2
          if (body.flashcardRating !== undefined) {
            const sm2Rating: SM2Rating = {
              quality: body.flashcardRating,
              responseTimeMs: (body.timePerQuestion || 30) * 1000,
            };
            const sm2Result = spacedRepetition.processReview(userId, conceptId, sm2Rating);

            // Update mastery based on SM-2 result
            const newMastery = Math.max(0, Math.min(100, before + sm2Result.masteryDelta));

            calcInput = {
              conceptId,
              userId,
              flashcardRatings: body.flashcardRatings || [body.flashcardRating!],
              lastPracticedAt: previousMastery.lastPracticedAt,
              previousMasteryScore: before,
            };

            const masteryResult = masteryCalculator.calculate(calcInput);
            masteryResult.masteryScore = newMastery; // Override with SM-2 adjusted score

            // Store delta
            const delta = newMastery - before;
            masteryDeltaStore.set(`${userId}:${conceptId}`, {
              before,
              after: newMastery,
              delta,
              timestamp: new Date().toISOString(),
            });

            // Update stored mastery
            await unlockRules.updateConceptMastery(userId, courseId, conceptId, newMastery);

            const result: typeof results[0] = {
              conceptId,
              before,
              after: newMastery,
              delta,
              masteryResult,
              sm2Result: {
                nextReviewAt: sm2Result.nextReviewAt,
                wasSuccessful: sm2Result.wasSuccessful,
              },
            };

            // Trigger remediation if needed
            if (triggerRemediation && (sm2Result.masteryDelta < 0 || newMastery < 50)) {
              result.remediation = remediationSystem.generatePlan(
                conceptId,
                conceptId, // Would look up name in production
                newMastery,
                newMastery < 50 ? "quiz_fail" : "low_confidence",
                userId
              );
            }

            results.push(result);
            continue;
          }
          // Fall through if no flashcard rating

        case "lesson":
        case "practice":
        case "mastery_check":
        default:
          calcInput = {
            conceptId,
            userId,
            quizScores: body.quizScores || (body.quizScore ? [body.quizScore] : []),
            attemptCount: body.attemptCount || 1,
            confidenceScores: body.confidenceScores || (body.confidenceScore ? [body.confidenceScore] : []),
            lastPracticedAt: previousMastery.lastPracticedAt,
            previousMasteryScore: before,
          };
          break;
      }

      // Calculate new mastery
      const masteryResult = masteryCalculator.calculate(calcInput);
      const after = masteryResult.masteryScore;
      const delta = after - before;

      // Store delta
      masteryDeltaStore.set(`${userId}:${conceptId}`, {
        before,
        after,
        delta,
        timestamp: new Date().toISOString(),
      });

      // Update stored mastery
      await unlockRules.updateConceptMastery(userId, courseId, conceptId, after);

      const result: typeof results[0] = {
        conceptId,
        before,
        after,
        delta,
        masteryResult,
      };

      // Trigger remediation if needed
      if (triggerRemediation && delta < 0) {
        result.remediation = remediationSystem.generatePlan(
          conceptId,
          conceptId, // Would look up name in production
          after,
          "quiz_fail",
          userId
        );
      }

      results.push(result);
    }

    // Calculate overall course mastery change
    const overallBefore = results.reduce((sum, r) => sum + r.before, 0) / (results.length || 1);
    const overallAfter = results.reduce((sum, r) => sum + r.after, 0) / (results.length || 1);

    return NextResponse.json({
      data: {
        courseId,
        userId,
        activityType,
        recalculatedConcepts: results.map((r) => ({
          conceptId: r.conceptId,
          before: r.before,
          after: r.after,
          delta: r.delta,
          status: r.masteryResult.status,
          remediation: r.remediation,
        })),
        summary: {
          conceptsRecalculated: results.length,
          averageMasteryBefore: Math.round(overallBefore),
          averageMasteryAfter: Math.round(overallAfter),
          averageDelta: Math.round(overallAfter - overallBefore),
          strongestGain: results.reduce((max, r) => (r.delta > max.delta ? r : max), results[0]),
          weakestGain: results.reduce((min, r) => (r.delta < min.delta ? r : min), results[0]),
        },
        recalculatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error recalculating mastery:", error);
    return NextResponse.json(
      { error: "Failed to recalculate mastery" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/courses/[id]/recalculate-mastery
 * Get mastery delta history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: _courseId } = await params;
    const userId = request.headers.get("X-User-Id") || "demo-user";
    const url = new URL(request.url);
    const conceptId = url.searchParams.get("conceptId");

    if (conceptId) {
      const delta = masteryDeltaStore.get(`${userId}:${conceptId}`);
      return NextResponse.json({
        data: delta || null,
      });
    }

    // Return all deltas for this user/course
    const deltas: Record<string, { before: number; after: number; delta: number; timestamp: string }> = {};
    for (const [key, value] of masteryDeltaStore) {
      if (key.startsWith(`${userId}:`)) {
        deltas[key] = value;
      }
    }

    return NextResponse.json({
      data: deltas,
    });
  } catch (error) {
    console.error("Error fetching mastery deltas:", error);
    return NextResponse.json(
      { error: "Failed to fetch mastery deltas" },
      { status: 500 }
    );
  }
}
