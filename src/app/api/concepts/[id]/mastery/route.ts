/**
 * GET /api/concepts/[id]/mastery
 * Get specific concept mastery details
 */

import { NextRequest, NextResponse } from "next/server";
import { unlockRules } from "@/lib/mastery/unlock-rules";
import { spacedRepetition } from "@/lib/mastery/spaced-repetition";
import { conceptGraph } from "@/lib/mastery/concept-graph";
import { masteryCalculator } from "@/lib/mastery/calculator";
import { remediationSystem } from "@/lib/mastery/remediation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conceptId } = await params;
    const userId = request.headers.get("X-User-Id") || "demo-user";

    // Get concept info
    const concept = await conceptGraph.getConcept(conceptId);

    // Get user mastery for this concept
    const mastery = await unlockRules.getUserConceptMastery(userId, conceptId);

    // Get SM-2 card data
    const sm2Card = spacedRepetition.getCard(userId, conceptId);

    // Get prerequisites chain
    const prerequisites = await conceptGraph.getPrerequisiteChain(conceptId);
    const prereqMasteries = await Promise.all(
      prerequisites.map(async (prereq) => {
        const prereqMastery = await unlockRules.getUserConceptMastery(userId, prereq.id);
        return {
          conceptId: prereq.id,
          name: prereq.name,
          masteryScore: prereqMastery.masteryScore,
          status: prereqMastery.status,
        };
      })
    );

    // Get dependent chain
    const dependents = await conceptGraph.getDependentChain(conceptId);

    // Get remediation history if any
    const remediationHistory = remediationSystem.getRemediationForConcept(userId, conceptId);

    // Calculate projected mastery at next review
    let projectedMastery = mastery.masteryScore;
    if (sm2Card && mastery.lastPracticedAt) {
      const daysSinceReview = Math.floor(
        (Date.now() - new Date(mastery.lastPracticedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      projectedMastery = masteryCalculator.applyDecay(
        mastery.masteryScore,
        daysSinceReview,
        sm2Card.easeFactor
      );
    }

    // Get learning order
    const learningOrder = await conceptGraph.getLearningOrder(concept?.id || "");

    return NextResponse.json({
      data: {
        conceptId,
        concept: concept ? {
          id: concept.id,
          name: concept.name,
          description: concept.description,
          difficulty: concept.difficulty,
          prerequisites: concept.prerequisites,
          dependents: concept.dependents,
          isCore: concept.isCore,
        } : null,
        mastery: {
          score: mastery.masteryScore,
          status: mastery.status,
          confidence: mastery.confidenceScore,
          learningSpeed: mastery.learningSpeed,
          lastPracticedAt: mastery.lastPracticedAt,
          nextReviewAt: mastery.nextReviewAt,
        },
        sm2: sm2Card ? {
          easeFactor: sm2Card.easeFactor,
          interval: sm2Card.interval,
          repetitions: sm2Card.repetitions,
          nextReviewAt: sm2Card.nextReviewAt,
          lastReviewAt: sm2Card.lastReviewAt,
          lastQuality: sm2Card.lastQuality,
        } : null,
        prerequisites: {
          count: prereqMasteries.length,
          items: prereqMasteries,
          allMet: prereqMasteries.every((p) => p.masteryScore >= 85),
        },
        dependents: {
          count: dependents.length,
          items: dependents.map((d) => ({ id: d.id, name: d.name })),
        },
        projectedMastery,
        remediationHistory,
        learningPosition: learningOrder.findIndex((c) => c.id === conceptId) + 1,
        totalConcepts: learningOrder.length,
      },
    });
  } catch (error) {
    console.error("Error fetching concept mastery:", error);
    return NextResponse.json(
      { error: "Failed to fetch concept mastery" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/concepts/[id]/mastery
 * Update concept mastery (e.g., after flashcard review)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conceptId } = await params;
    const userId = request.headers.get("X-User-Id") || "demo-user";
    const body = await request.json();

    const { flashcardRating, confidenceScore, courseId } = body;

    if (flashcardRating === undefined) {
      return NextResponse.json(
        { error: "flashcardRating is required" },
        { status: 400 }
      );
    }

    // Process SM-2 review
    const sm2Result = spacedRepetition.processReview(userId, conceptId, {
      quality: flashcardRating,
      responseTimeMs: body.responseTimeMs || 30000,
    });

    // Get previous mastery
    const previousMastery = await unlockRules.getUserConceptMastery(userId, conceptId);
    const previousScore = previousMastery.masteryScore;

    // Calculate new mastery with SM-2 delta
    const newScore = Math.max(0, Math.min(100, previousScore + sm2Result.masteryDelta));

    // Update mastery
    await unlockRules.updateConceptMastery(
      userId,
      courseId || "",
      conceptId,
      newScore,
      confidenceScore
    );

    // Generate remediation if score dropped significantly
    let remediation = null;
    if (sm2Result.masteryDelta < -10 || newScore < 50) {
      remediation = remediationSystem.generatePlan(
        conceptId,
        conceptId,
        newScore,
        newScore < 50 ? "quiz_fail" : "low_confidence",
        userId
      );
    }

    return NextResponse.json({
      data: {
        conceptId,
        previousScore,
        newScore,
        delta: sm2Result.masteryDelta,
        status: masteryCalculator.getStatus(newScore),
        sm2: {
          nextReviewAt: sm2Result.nextReviewAt,
          newInterval: sm2Result.newInterval,
          wasSuccessful: sm2Result.wasSuccessful,
        },
        remediation,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating concept mastery:", error);
    return NextResponse.json(
      { error: "Failed to update concept mastery" },
      { status: 500 }
    );
  }
}
