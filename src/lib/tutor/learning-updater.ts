/**
 * Learning Updater
 * Updates learning state based on tutor interactions
 * - Marks concepts unstable when user asks many questions
 * - Generates additional practice for weak concepts
 * - Updates mastery based on conversation engagement
 */

import type { UserConceptMastery, MasteryStatus } from "@/types";
import { masteryCalculator } from "@/lib/mastery/calculator";
import { spacedRepetition, type SM2Rating } from "@/lib/mastery/spaced-repetition";
import { recordQuestion, detectUnstableConcept } from "./actions";

// In-memory stores (would be database in production)
const userConceptMasteryStore = new Map<string, UserConceptMastery>();
const tutorInteractionStore = new Map<string, {
  conceptId: string;
  interactions: number;
  questionsAsked: number;
  explanationsGiven: number;
  lastInteractionAt: string;
}>();

export interface LearningUpdateResult {
  conceptId: string;
  masteryDelta: number;
  newMasteryScore: number;
  status: MasteryStatus;
  isUnstable: boolean;
  newPracticeRecommended: boolean;
}

export interface ConceptStabilityUpdate {
  conceptId: string;
  isUnstable: boolean;
  stabilityScore: number; // 0-100
  severity: "low" | "medium" | "high";
  recommendedAction: "review" | "practice" | "spaced_review" | "none";
}

/**
 * Record a tutor interaction for learning tracking
 */
export function recordTutorInteraction(
  userId: string,
  courseId: string,
  conceptId: string,
  interactionType: "question" | "explanation" | "quiz_response" | "practice"
): void {
  const key = `${userId}:${courseId}:${conceptId}`;
  const existing = tutorInteractionStore.get(key) || {
    conceptId,
    interactions: 0,
    questionsAsked: 0,
    explanationsGiven: 0,
    lastInteractionAt: new Date().toISOString(),
  };

  existing.interactions += 1;
  existing.lastInteractionAt = new Date().toISOString();

  if (interactionType === "question") {
    existing.questionsAsked += 1;
    recordQuestion(courseId, conceptId, `q_${Date.now()}`);
  } else if (interactionType === "explanation") {
    existing.explanationsGiven += 1;
  }

  tutorInteractionStore.set(key, existing);

  // Also update concept mastery tracking
  updateConceptMasteryFromInteraction(userId, courseId, conceptId, interactionType);
}

/**
 * Update concept mastery based on tutor interaction
 */
function updateConceptMasteryFromInteraction(
  userId: string,
  courseId: string,
  conceptId: string,
  interactionType: string
): void {
  const masteryKey = `${userId}:${courseId}`;
  const mastery = userConceptMasteryStore.get(masteryKey);

  if (!mastery) {
    // Initialize mastery record
    const newMastery: UserConceptMastery = {
      id: masteryKey,
      userId,
      courseId,
      conceptId,
      masteryScore: 50, // Starting baseline
      confidenceScore: 50,
      lastPracticedAt: new Date().toISOString(),
      nextReviewAt: new Date().toISOString(),
      learningSpeed: 1.0,
      status: "developing",
    };
    userConceptMasteryStore.set(masteryKey, newMastery);
    return;
  }

  // Adjust mastery based on interaction type
  // Questions suggest confusion -> slight mastery decrease
  // Explanations suggest engagement -> slight mastery increase
  // Quiz responses and practice are handled separately
  let delta = 0;
  if (interactionType === "question") {
    delta = -2; // Asking questions might indicate confusion
  } else if (interactionType === "explanation") {
    delta = 1; // Positive engagement
  }

  const newScore = Math.max(0, Math.min(100, mastery.masteryScore + delta));
  mastery.masteryScore = newScore;
  mastery.status = masteryCalculator.getStatus(newScore);
  userConceptMasteryStore.set(masteryKey, mastery);
}

/**
 * Process a quiz response through the learning updater
 */
export function processQuizResponse(
  userId: string,
  courseId: string,
  conceptId: string,
  correct: boolean,
  responseTimeMs: number
): LearningUpdateResult {
  // Process using SM-2 algorithm
  const quality: SM2Rating = {
    quality: correct ? 4 : 1, // 4 = correct with hesitation, 1 = incorrect but recognized
    responseTimeMs,
  };

  const sm2Result = spacedRepetition.processReview(userId, conceptId, quality);

  // Update mastery score
  const masteryKey = `${userId}:${courseId}`;
  const mastery = userConceptMasteryStore.get(masteryKey);
  const currentScore = mastery?.masteryScore || 50;
  const newScore = Math.max(0, Math.min(100, currentScore + sm2Result.masteryDelta));

  // Check concept stability
  const stability = detectUnstableConcept(courseId, conceptId);

  // Determine if new practice is recommended
  const newPracticeRecommended = stability.isUnstable || !sm2Result.wasSuccessful;

  const result: LearningUpdateResult = {
    conceptId,
    masteryDelta: sm2Result.masteryDelta,
    newMasteryScore: newScore,
    status: masteryCalculator.getStatus(newScore),
    isUnstable: stability.isUnstable,
    newPracticeRecommended,
  };

  // Update stored mastery
  if (mastery) {
    mastery.masteryScore = newScore;
    mastery.status = result.status;
    mastery.lastPracticedAt = new Date().toISOString();
    userConceptMasteryStore.set(masteryKey, mastery);
  }

  return result;
}

/**
 * Update concept stability based on interaction patterns
 */
export function updateConceptStability(
  userId: string,
  courseId: string,
  conceptId: string
): ConceptStabilityUpdate {
  const key = `${userId}:${courseId}:${conceptId}`;
  const interactions = tutorInteractionStore.get(key);

  if (!interactions) {
    return {
      conceptId,
      isUnstable: false,
      stabilityScore: 100,
      severity: "low",
      recommendedAction: "none",
    };
  }

  // Calculate stability score (0-100, lower = more unstable)
  const questionRatio = interactions.questionsAsked / Math.max(1, interactions.interactions);
  const explanationRatio = interactions.explanationsGiven / Math.max(1, interactions.interactions);

  // Many questions + few explanations = unstable
  // Many explanations = well-supported
  let stabilityScore = 100;
  stabilityScore -= questionRatio * 40; // Questions reduce stability
  stabilityScore += explanationRatio * 20; // Explanations help

  // Recency matters - old interactions count less
  const lastInteraction = new Date(interactions.lastInteractionAt);
  const hoursSince = (Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60);
  if (hoursSince > 24) {
    stabilityScore = Math.min(stabilityScore, 70); // Decay for old interactions
  }

  stabilityScore = Math.max(0, Math.min(100, Math.round(stabilityScore)));

  // Determine severity and action
  let severity: "low" | "medium" | "high";
  let recommendedAction: ConceptStabilityUpdate["recommendedAction"];

  if (stabilityScore >= 70) {
    severity = "low";
    recommendedAction = "none";
  } else if (stabilityScore >= 40) {
    severity = "medium";
    recommendedAction = "practice";
  } else {
    severity = "high";
    recommendedAction = "review";
  }

  const isUnstable = stabilityScore < 50 || interactions.questionsAsked >= 5;

  return {
    conceptId,
    isUnstable,
    stabilityScore,
    severity,
    recommendedAction,
  };
}

/**
 * Generate additional practice recommendations for weak concepts
 */
export function generatePracticeRecommendations(
  userId: string,
  courseId: string
): {
  conceptId: string;
  conceptName: string;
  practiceType: "drill" | "spaced_review" | "tutor_guidance";
  priority: number;
  reason: string;
}[] {
  const recommendations: ReturnType<typeof generatePracticeRecommendations> = [];

  // Check all concepts for this course
  for (const [key, mastery] of userConceptMasteryStore.entries()) {
    if (!key.startsWith(`${userId}:${courseId}:`)) continue;

    if (mastery.masteryScore < 50) {
      const stability = updateConceptStability(userId, courseId, mastery.conceptId);

      let practiceType: "drill" | "spaced_review" | "tutor_guidance";
      if (stability.isUnstable) {
        practiceType = "tutor_guidance";
      } else if (mastery.masteryScore < 30) {
        practiceType = "drill";
      } else {
        practiceType = "spaced_review";
      }

      recommendations.push({
        conceptId: mastery.conceptId,
        conceptName: mastery.conceptId, // Would be looked up in production
        practiceType,
        priority: Math.max(1, 100 - mastery.masteryScore),
        reason: `Mastery at ${mastery.masteryScore}%, needs reinforcement`,
      });
    }
  }

  // Sort by priority
  return recommendations.sort((a, b) => b.priority - a.priority);
}

/**
 * Update overall course mastery based on all concept masteries
 */
export function calculateOverallCourseMastery(userId: string, courseId: string): number {
  const conceptMasteries: { score: number; isCore: boolean }[] = [];

  for (const [key, mastery] of userConceptMasteryStore.entries()) {
    if (key.startsWith(`${userId}:${courseId}:`)) {
      conceptMasteries.push({
        score: mastery.masteryScore,
        isCore: true, // Would be determined from concept graph
      });
    }
  }

  if (conceptMasteries.length === 0) {
    return 0;
  }

  return masteryCalculator.calculateCourseMastery(conceptMasteries);
}

/**
 * Get learning state summary for tutor context
 */
export function getLearningStateSummary(
  userId: string,
  courseId: string
): {
  conceptsLearned: number;
  averageMastery: number;
  weakConceptCount: number;
  strongConceptCount: number;
  unstableConcepts: string[];
  dueForReview: number;
} {
  let totalMastery = 0;
  let conceptCount = 0;
  let weakCount = 0;
  let strongCount = 0;
  const unstableConcepts: string[] = [];

  for (const [key, mastery] of userConceptMasteryStore.entries()) {
    if (!key.startsWith(`${userId}:${courseId}:`)) continue;

    conceptCount += 1;
    totalMastery += mastery.masteryScore;

    if (mastery.masteryScore < 50) {
      weakCount += 1;
    } else if (mastery.masteryScore >= 80) {
      strongCount += 1;
    }

    const stability = updateConceptStability(userId, courseId, mastery.conceptId);
    if (stability.isUnstable) {
      unstableConcepts.push(mastery.conceptId);
    }
  }

  // Get due reviews from spaced repetition
  const dueReviews = spacedRepetition.getDueReviews(userId);
  const courseDueReviews = dueReviews.filter((card) =>
    userConceptMasteryStore.has(`${userId}:${courseId}:${card.conceptId}`)
  );

  return {
    conceptsLearned: conceptCount,
    averageMastery: conceptCount > 0 ? Math.round(totalMastery / conceptCount) : 0,
    weakConceptCount: weakCount,
    strongConceptCount: strongCount,
    unstableConcepts,
    dueForReview: courseDueReviews.length,
  };
}
