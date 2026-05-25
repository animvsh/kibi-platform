import { NextRequest, NextResponse } from "next/server";
import type { UserConceptMastery } from "@/types";
import { conceptGraph } from "@/lib/mastery/concept-graph";
import { unlockRules } from "@/lib/mastery/unlock-rules";
import { masteryCalculator } from "@/lib/mastery/calculator";
import { spacedRepetition } from "@/lib/mastery/spaced-repetition";

// In-memory knowledge map store
const knowledgeMapStore = new Map<string, UserConceptMastery[]>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;

    // Get user ID from header (simplified - use auth in production)
    const userId = request.headers.get("X-User-Id") || "demo-user";

    // Get knowledge map from concept graph
    const knowledgeMap = await conceptGraph.buildKnowledgeMap(courseId);

    // Enrich with user mastery data
    const enrichedConcepts = await Promise.all(
      knowledgeMap.nodes.map(async (node) => {
        const mastery = await unlockRules.getUserConceptMastery(userId, node.id);
        const sm2Card = spacedRepetition.getCard(userId, node.id);

        return {
          id: node.id,
          name: node.name,
          description: node.description,
          difficulty: node.difficulty,
          prerequisites: node.prerequisites,
          dependents: node.dependents,
          isCore: node.isCore,
          masteryScore: mastery.masteryScore,
          status: mastery.status,
          confidenceScore: mastery.confidenceScore,
          lastPracticedAt: mastery.lastPracticedAt,
          nextReviewAt: sm2Card?.nextReviewAt || null,
          easeFactor: sm2Card?.easeFactor || 2.5,
          isDueForReview: sm2Card ? new Date(sm2Card.nextReviewAt) <= new Date() : false,
        };
      })
    );

    // Calculate weak and strong areas
    const sortedByMastery = [...enrichedConcepts].sort((a, b) => a.masteryScore - b.masteryScore);

    const weakAreas = sortedByMastery.slice(0, 3).map((c) => ({
      conceptId: c.id,
      conceptName: c.name,
      masteryScore: c.masteryScore,
      status: c.status,
      reason: c.isCore ? "Core concept" : "Supporting concept",
    }));

    const strongAreas = sortedByMastery.slice(-3).reverse().map((c) => ({
      conceptId: c.id,
      conceptName: c.name,
      masteryScore: c.masteryScore,
      status: c.status,
      confidence: c.confidenceScore,
    }));

    // Calculate overall mastery
    const overallMastery = masteryCalculator.calculateCourseMastery(
      enrichedConcepts.map((c) => ({ score: c.masteryScore, isCore: c.isCore }))
    );

    // Build graph edges with mastery data
    const graphEdges = knowledgeMap.edges.map((edge) => {
      const sourceMastery = enrichedConcepts.find((c) => c.id === edge.source);
      const targetMastery = enrichedConcepts.find((c) => c.id === edge.target);

      return {
        ...edge,
        sourceMastery: sourceMastery?.masteryScore || 0,
        targetMastery: targetMastery?.masteryScore || 0,
      };
    });

    // Get SM-2 stats
    const sm2Stats = spacedRepetition.getStats(userId);

    // Learning order
    const learningOrder = await conceptGraph.getLearningOrder(courseId);

    const response = {
      courseId,
      userId,
      overallMastery,
      conceptCount: enrichedConcepts.length,
      concepts: enrichedConcepts,
      weakAreas,
      strongAreas,
      graphEdges,
      learningOrder: learningOrder.map((c) => ({ id: c.id, name: c.name })),
      reviewStats: {
        dueToday: sm2Stats.dueToday,
        dueTomorrow: sm2Stats.dueTomorrow,
        totalCards: sm2Stats.totalCards,
        masteredCards: sm2Stats.masteredCards,
      },
      generatedAt: knowledgeMap.generatedAt,
    };

    return NextResponse.json({ data: response });
  } catch (error) {
    console.error("Error fetching knowledge map:", error);
    return NextResponse.json(
      { error: "Failed to fetch knowledge map" },
      { status: 500 }
    );
  }
}
