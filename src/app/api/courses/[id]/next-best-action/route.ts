/**
 * GET /api/courses/[id]/next-best-action
 * Get optimal next activity recommendation
 */

import { NextRequest, NextResponse } from "next/server";
import { nextActionSystem, type LearningState } from "@/lib/mastery/next-action";
import { unlockRules } from "@/lib/mastery/unlock-rules";
import { spacedRepetition } from "@/lib/mastery/spaced-repetition";
import { conceptGraph } from "@/lib/mastery/concept-graph";
import { masteryCalculator } from "@/lib/mastery/calculator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const userId = request.headers.get("X-User-Id") || "demo-user";

    // Build learning state from available data
    const concepts = await conceptGraph.getCourseConcepts(courseId);

    // Get masteries and build weak/strong concept lists
    const conceptMasteries: { conceptId: string; name: string; score: number; isCore: boolean }[] = [];

    for (const concept of concepts) {
      const mastery = await unlockRules.getUserConceptMastery(userId, concept.id);
      conceptMasteries.push({
        conceptId: concept.id,
        name: concept.name,
        score: mastery.masteryScore,
        isCore: concept.isCore,
      });
    }

    // Sort into weak and strong
    const sortedByScore = [...conceptMasteries].sort((a, b) => a.score - b.score);

    const weakConcepts = sortedByScore.slice(0, Math.min(5, Math.ceil(conceptMasteries.length * 0.3)))
      .map((c) => ({
        conceptId: c.conceptId,
        name: c.name,
        masteryScore: c.score,
        attempts: 1, // Would come from actual tracking
        errorRate: 1 - (c.score / 100),
      }));

    const strongConcepts = sortedByScore.slice(-Math.min(3, Math.ceil(conceptMasteries.length * 0.2)))
      .map((c) => ({
        conceptId: c.conceptId,
        name: c.name,
        masteryScore: c.score,
        confidence: c.score,
      }));

    // Get due reviews from SM-2
    const dueReviews = spacedRepetition.getDueReviews(userId);

    // Calculate overall mastery
    const overallMastery = masteryCalculator.calculateCourseMastery(
      conceptMasteries.map((c) => ({ score: c.score, isCore: c.isCore }))
    );

    // Build learning state
    const learningState: LearningState = {
      userId,
      courseId,
      overallMastery,
      weakConcepts,
      strongConcepts,
      dueReviews,
      streakDays: 1, // Would come from user profile
      lastActivityAt: new Date().toISOString(),
    };

    // Get next action
    const nextAction = await nextActionSystem.getNextAction(learningState);

    // Get action sequence for planning
    const actionSequence = await nextActionSystem.getActionSequence(learningState, 5);

    // Get personalized recommendations
    const recommendations = nextActionSystem.getPersonalizedRecommendations(learningState);

    return NextResponse.json({
      data: {
        courseId,
        userId,
        nextAction,
        actionSequence,
        shortTermRecommendations: recommendations.shortTerm,
        longTermRecommendations: recommendations.longTerm,
        learningState: {
          overallMastery: learningState.overallMastery,
          weakConceptCount: weakConcepts.length,
          strongConceptCount: strongConcepts.length,
          dueReviewCount: dueReviews.length,
          streakDays: learningState.streakDays,
        },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error getting next best action:", error);
    return NextResponse.json(
      { error: "Failed to get next best action" },
      { status: 500 }
    );
  }
}
