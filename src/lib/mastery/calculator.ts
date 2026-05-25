/**
 * Mastery Score Calculator
 * Calculates mastery scores (0-100) based on quiz performance, attempts, time, confidence, and flashcard performance
 */

import type { MasteryStatus } from "@/types";

export type MasteryLevel =
  | "not_learned"   // 0-29
  | "familiar"      // 30-49
  | "developing"    // 50-69
  | "proficient"    // 70-84
  | "strong"        // 85-94
  | "mastered";     // 95-100

export interface MasteryComponents {
  quizScore: number;          // 0-100 weighted average of quiz scores
  attemptCount: number;       // Number of attempts
  averageTimePerQuestion: number; // In seconds
  confidenceScore: number;    // 0-100 self-reported confidence
  flashcardPerformance: number; // 0-100 flashcard recall rate
  consistencyBonus: number;  // Bonus for consistent performance
  recencyBonus: number;       // Bonus for recent practice
}

export interface MasteryCalculationInput {
  conceptId: string;
  userId: string;
  quizScores?: number[];         // Array of quiz scores (0-100)
  attemptCount?: number;
  timePerQuestion?: number[];     // Seconds per question
  confidenceScores?: number[];    // Self-reported confidence (0-100)
  flashcardRatings?: number[];    // SM-2 ratings (0-5)
  lastPracticedAt?: string;
  previousMasteryScore?: number;
}

export interface MasteryResult {
  conceptId: string;
  masteryScore: number;       // 0-100
  previousScore: number;
  delta: number;
  status: MasteryStatus;
  level: MasteryLevel;
  components: MasteryComponents;
  calculatedAt: string;
}

// Mastery thresholds
const MASTERY_THRESHOLDS = {
  not_learned: { min: 0, max: 29 },
  familiar: { min: 30, max: 49 },
  developing: { min: 50, max: 69 },
  proficient: { min: 70, max: 84 },
  strong: { min: 85, max: 94 },
  mastered: { min: 95, max: 100 },
};

// Weights for each component
const COMPONENT_WEIGHTS = {
  quizScore: 0.40,
  attemptCount: 0.05,
  timePerQuestion: 0.10,
  confidenceScore: 0.15,
  flashcardPerformance: 0.20,
  consistencyBonus: 0.05,
  recencyBonus: 0.05,
};

function getMasteryStatus(score: number): MasteryStatus {
  if (score >= 95) return "mastered";
  if (score >= 85) return "strong";
  if (score >= 70) return "proficient";
  if (score >= 50) return "developing";
  if (score >= 30) return "familiar";
  return "not_learned";
}

function getMasteryLevel(status: MasteryStatus): MasteryLevel {
  return status as MasteryLevel;
}

function calculateQuizComponent(scores: number[]): number {
  if (!scores || scores.length === 0) return 0;

  // Weighted average with more recent scores weighted higher
  let weightedSum = 0;
  let weightTotal = 0;

  scores.forEach((score, index) => {
    const recencyWeight = index / scores.length; // Later attempts get higher weight
    const weight = 1 + recencyWeight;
    weightedSum += score * weight;
    weightTotal += weight;
  });

  return weightedSum / weightTotal;
}

function calculateAttemptCountComponent(attempts: number): number {
  // More attempts can help (up to a point), but too many suggests struggle
  // Optimal range: 2-4 attempts
  if (attempts === 0) return 0;
  if (attempts === 1) return 30;
  if (attempts === 2) return 60;
  if (attempts === 3) return 80;
  if (attempts === 4) return 90;
  if (attempts <= 6) return 85;
  return 70; // Penalize too many attempts
}

function calculateTimeComponent(times: number[]): number {
  if (!times || times.length === 0) return 50; // Neutral

  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

  // Optimal time is around 30-60 seconds per question
  // Too fast suggests guessing, too slow suggests struggle
  if (avgTime < 10) return 20;  // Too fast
  if (avgTime < 30) return 60;  // Good
  if (avgTime < 60) return 100; // Optimal
  if (avgTime < 90) return 80;  // Acceptable
  if (avgTime < 120) return 60; // Getting slow
  return 40; // Too slow
}

function calculateConfidenceComponent(confidences: number[]): number {
  if (!confidences || confidences.length === 0) return 50; // Neutral

  const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
  return avgConfidence;
}

function calculateFlashcardComponent(ratings: number[]): number {
  if (!ratings || ratings.length === 0) return 50; // Neutral

  // Convert SM-2 ratings (0-5) to percentage (0-100)
  const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  return (avgRating / 5) * 100;
}

function calculateConsistencyBonus(scores: number[]): number {
  if (!scores || scores.length < 2) return 50; // Neutral without enough data

  // Calculate coefficient of variation
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;

  // Lower CV = more consistent = higher bonus
  if (cv <= 0.1) return 100;
  if (cv <= 0.2) return 80;
  if (cv <= 0.3) return 60;
  if (cv <= 0.4) return 40;
  return 20;
}

function calculateRecencyBonus(lastPracticedAt?: string): number {
  if (!lastPracticedAt) return 0; // Never practiced

  const lastPractice = new Date(lastPracticedAt);
  const now = new Date();
  const daysSince = Math.floor((now.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24));

  // Decay over time
  if (daysSince === 0) return 100; // Practiced today
  if (daysSince === 1) return 95;
  if (daysSince <= 3) return 85;
  if (daysSince <= 7) return 70;
  if (daysSince <= 14) return 50;
  if (daysSince <= 30) return 30;
  return 10; // More than 30 days
}

export const masteryCalculator = {
  /**
   * Calculate mastery score for a concept
   * Deterministic: same input always produces same output
   */
  calculate(input: MasteryCalculationInput): MasteryResult {
    const now = new Date().toISOString();
    const previousScore = input.previousMasteryScore ?? 0;

    // Calculate each component
    const quizComponent = calculateQuizComponent(input.quizScores || []);
    const attemptComponent = calculateAttemptCountComponent(input.attemptCount || 0);
    const timeComponent = calculateTimeComponent(input.timePerQuestion || []);
    const confidenceComponent = calculateConfidenceComponent(input.confidenceScores || []);
    const flashcardComponent = calculateFlashcardComponent(input.flashcardRatings || []);
    const consistencyBonus = calculateConsistencyBonus(input.quizScores || []);
    const recencyBonus = calculateRecencyBonus(input.lastPracticedAt);

    // Build components object
    const components: MasteryComponents = {
      quizScore: quizComponent,
      attemptCount: input.attemptCount || 0,
      averageTimePerQuestion: input.timePerQuestion
        ? input.timePerQuestion.reduce((a, b) => a + b, 0) / input.timePerQuestion.length
        : 0,
      confidenceScore: confidenceComponent,
      flashcardPerformance: flashcardComponent,
      consistencyBonus,
      recencyBonus,
    };

    // Calculate weighted mastery score
    const masteryScore = Math.round(
      quizComponent * COMPONENT_WEIGHTS.quizScore +
      attemptComponent * COMPONENT_WEIGHTS.attemptCount +
      timeComponent * COMPONENT_WEIGHTS.timePerQuestion +
      confidenceComponent * COMPONENT_WEIGHTS.confidenceScore +
      flashcardComponent * COMPONENT_WEIGHTS.flashcardPerformance +
      consistencyBonus * COMPONENT_WEIGHTS.consistencyBonus +
      recencyBonus * COMPONENT_WEIGHTS.recencyBonus
    );

    // Clamp to 0-100
    const clampedScore = Math.max(0, Math.min(100, masteryScore));
    const status = getMasteryStatus(clampedScore);
    const delta = clampedScore - previousScore;

    return {
      conceptId: input.conceptId,
      masteryScore: clampedScore,
      previousScore,
      delta,
      status,
      level: getMasteryLevel(status),
      components,
      calculatedAt: now,
    };
  },

  /**
   * Apply mastery decay using SM-2 algorithm principles
   */
  applyDecay(currentScore: number, daysSinceReview: number, difficulty: number = 2.5): number {
    // SM-2 decay formula: M = M0 * e^(-k*t)
    // where k is difficulty-based decay rate
    const k = 0.1 * (difficulty / 2.5); // Higher difficulty = faster decay
    const decayFactor = Math.exp(-k * daysSinceReview);
    return Math.round(currentScore * decayFactor);
  },

  /**
   * Get mastery status from score
   */
  getStatus(score: number): MasteryStatus {
    return getMasteryStatus(score);
  },

  /**
   * Get mastery level info
   */
  getLevelInfo(level: MasteryLevel): { min: number; max: number; label: string } {
    return {
      ...MASTERY_THRESHOLDS[level],
      label: level.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase()),
    };
  },

  /**
   * Calculate overall course mastery from concept masteries
   */
  calculateCourseMastery(conceptMasteries: { score: number; isCore: boolean }[]): number {
    if (conceptMasteries.length === 0) return 0;

    // Weight core concepts more heavily
    const coreConcepts = conceptMasteries.filter(c => c.isCore);
    const optionalConcepts = conceptMasteries.filter(c => !c.isCore);

    if (coreConcepts.length === 0) {
      // Simple average if no core concepts
      return Math.round(
        conceptMasteries.reduce((sum, c) => sum + c.score, 0) / conceptMasteries.length
      );
    }

    // Core concepts count 70%, optional count 30%
    const coreAvg = coreConcepts.reduce((sum, c) => sum + c.score, 0) / coreConcepts.length;
    const optionalAvg = optionalConcepts.length > 0
      ? optionalConcepts.reduce((sum, c) => sum + c.score, 0) / optionalConcepts.length
      : 0;

    return Math.round(coreAvg * 0.7 + optionalAvg * 0.3);
  },

  /**
   * Get threshold ranges
   */
  getThresholdRanges(): Record<MasteryStatus, { min: number; max: number }> {
    return MASTERY_THRESHOLDS;
  },
};
