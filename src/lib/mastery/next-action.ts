/**
 * Next Best Action System
 * Recommends optimal next activity based on learning state
 */

import { spacedRepetition, type SM2Card } from "./spaced-repetition";
import { conceptGraph } from "./concept-graph";

export type ActionType =
  | "continue_lesson"
  | "take_quiz"
  | "review_weak_concept"
  | "practice_more"
  | "ask_tutor"
  | "regenerate_simpler_version"
  | "spaced_review"
  | "mastery_check"
  | "course_completion";

export interface NextAction {
  type: ActionType;
  priority: number;           // 1-100, higher = more urgent
  conceptId?: string;
  conceptName?: string;
  lessonId?: string;
  quizId?: string;
  estimatedMinutes: number;
  expectedMasteryGain: number; // Estimated mastery points from this action
  reasoning: string;
  alternatives?: NextAction[];
}

export interface LearningState {
  userId: string;
  courseId: string;
  overallMastery: number;
  weakConcepts: WeakConcept[];
  strongConcepts: StrongConcept[];
  dueReviews: SM2Card[];
  currentLesson?: {
    lessonId: string;
    progress: number;
  };
  streakDays: number;
  lastActivityAt?: string;
}

export interface WeakConcept {
  conceptId: string;
  name: string;
  masteryScore: number;
  attempts: number;
  lastAttemptAt?: string;
  errorRate?: number;
}

export interface StrongConcept {
  conceptId: string;
  name: string;
  masteryScore: number;
  confidence: number;
}

// Action priorities
const ACTION_PRIORITIES = {
  // Urgent (do first)
  spaced_review: { base: 90, decay: 0.5 },       // Due for review
  review_weak_concept: { base: 80, decay: 0.3 }, // Weak concept needs attention
  mastery_check: { base: 75, decay: 0 },

  // Important (do soon)
  take_quiz: { base: 60, decay: 0 },
  practice_more: { base: 50, decay: 0.2 },
  continue_lesson: { base: 40, decay: 0 },

  // Optional (do later)
  ask_tutor: { base: 30, decay: 0 },
  regenerate_simpler_version: { base: 25, decay: 0 },
  course_completion: { base: 20, decay: 0 },
};

export const nextActionSystem = {
  /**
   * Determine the next best action for a user
   */
  async getNextAction(learningState: LearningState): Promise<NextAction> {
    const actions: NextAction[] = [];

    // 1. Check for due reviews (highest priority)
    if (learningState.dueReviews.length > 0) {
      for (const card of learningState.dueReviews.slice(0, 3)) {
        const concept = await conceptGraph.getConcept(card.conceptId);
        actions.push({
          type: "spaced_review",
          priority: this.calculatePriority("spaced_review", card.conceptId, learningState),
          conceptId: card.conceptId,
          conceptName: concept?.name || "Unknown Concept",
          estimatedMinutes: 5,
          expectedMasteryGain: 5,
          reasoning: `Review scheduled ${new Date(card.nextReviewAt).toLocaleDateString()}. Current ease factor: ${card.easeFactor.toFixed(2)}`,
        });
      }
    }

    // 2. Check for weak concepts
    for (const weak of learningState.weakConcepts.slice(0, 5)) {
      actions.push({
        type: "review_weak_concept",
        priority: this.calculatePriority("review_weak_concept", weak.conceptId, learningState),
        conceptId: weak.conceptId,
        conceptName: weak.name,
        estimatedMinutes: 10,
        expectedMasteryGain: 8,
        reasoning: `Mastery at ${weak.masteryScore}%. ${weak.attempts} attempts made. Needs reinforcement.`,
      });

      // Add practice option for very weak concepts
      if (weak.masteryScore < 50) {
        actions.push({
          type: "practice_more",
          priority: this.calculatePriority("practice_more", weak.conceptId, learningState) - 10,
          conceptId: weak.conceptId,
          conceptName: weak.name,
          estimatedMinutes: 15,
          expectedMasteryGain: 10,
          reasoning: `Concept below 50% mastery. Additional practice recommended.`,
        });
      }
    }

    // 3. Check for mastery check readiness
    if (learningState.overallMastery >= 80 && learningState.weakConcepts.length === 0) {
      actions.push({
        type: "mastery_check",
        priority: this.calculatePriority("mastery_check", "", learningState),
        estimatedMinutes: 20,
        expectedMasteryGain: 5,
        reasoning: `Overall mastery at ${learningState.overallMastery}%. Ready for mastery assessment.`,
      });
    }

    // 4. Continue current lesson
    if (learningState.currentLesson && learningState.currentLesson.progress < 100) {
      actions.push({
        type: "continue_lesson",
        priority: this.calculatePriority("continue_lesson", "", learningState),
        lessonId: learningState.currentLesson.lessonId,
        estimatedMinutes: 15,
        expectedMasteryGain: 3,
        reasoning: `Lesson ${learningState.currentLesson.progress}% complete. Continue for incremental progress.`,
      });
    }

    // 5. Take a quiz
    if (learningState.strongConcepts.length > 0) {
      actions.push({
        type: "take_quiz",
        priority: this.calculatePriority("take_quiz", "", learningState),
        estimatedMinutes: 15,
        expectedMasteryGain: 7,
        reasoning: `Test knowledge on ${learningState.strongConcepts.length} strong concepts.`,
      });
    }

    // 6. Ask tutor for struggling areas
    if (learningState.weakConcepts.some(w => w.masteryScore < 30)) {
      actions.push({
        type: "ask_tutor",
        priority: this.calculatePriority("ask_tutor", "", learningState),
        estimatedMinutes: 10,
        expectedMasteryGain: 5,
        reasoning: `Multiple concepts below 30%. AI tutor can provide personalized explanation.`,
      });
    }

    // 7. Course completion celebration
    if (learningState.overallMastery >= 90) {
      actions.push({
        type: "course_completion",
        priority: this.calculatePriority("course_completion", "", learningState),
        estimatedMinutes: 5,
        expectedMasteryGain: 0,
        reasoning: `Course ${learningState.overallMastery}% mastered. Ready to complete!`,
      });
    }

    // Sort by priority and return the best
    const sortedActions = actions.sort((a, b) => b.priority - a.priority);

    if (sortedActions.length === 0) {
      return {
        type: "continue_lesson",
        priority: 50,
        estimatedMinutes: 15,
        expectedMasteryGain: 3,
        reasoning: "No specific recommendations. Continue with course material.",
      };
    }

    // Add alternatives (top 3)
    const topAction = sortedActions[0];
    topAction.alternatives = sortedActions.slice(1, 4);

    return topAction;
  },

  /**
   * Calculate priority for an action
   */
  calculatePriority(
    actionType: ActionType,
    conceptId: string,
    learningState: LearningState
  ): number {
    const actionConfig = ACTION_PRIORITIES[actionType];
    let priority = actionConfig.base;

    // Apply decay based on concept mastery
    if (conceptId) {
      const weakConcept = learningState.weakConcepts.find(w => w.conceptId === conceptId);
      if (weakConcept) {
        // Lower mastery = higher priority
        const masteryFactor = (100 - weakConcept.masteryScore) / 100;
        priority -= actionConfig.decay * masteryFactor * 50;
      }
    }

    // Streak bonus - maintain momentum
    if (learningState.streakDays > 7) {
      priority = Math.min(100, priority + 10);
    }

    // Cap priority
    return Math.max(1, Math.min(100, Math.round(priority)));
  },

  /**
   * Generate a sequence of recommended actions
   */
  async getActionSequence(
    learningState: LearningState,
    count: number = 5
  ): Promise<NextAction[]> {
    // Build full action list
    const actions: NextAction[] = [];

    // Due reviews
    for (const card of learningState.dueReviews) {
      const concept = await conceptGraph.getConcept(card.conceptId);
      actions.push({
        type: "spaced_review",
        priority: this.calculatePriority("spaced_review", card.conceptId, learningState),
        conceptId: card.conceptId,
        conceptName: concept?.name || "Unknown",
        estimatedMinutes: 5,
        expectedMasteryGain: 5,
        reasoning: "Due for review",
      });
    }

    // Weak concepts
    for (const weak of learningState.weakConcepts) {
      actions.push({
        type: "review_weak_concept",
        priority: this.calculatePriority("review_weak_concept", weak.conceptId, learningState),
        conceptId: weak.conceptId,
        conceptName: weak.name,
        estimatedMinutes: 10,
        expectedMasteryGain: 8,
        reasoning: `Mastery at ${weak.masteryScore}%`,
      });
    }

    // Sort and dedupe
    const sorted = actions
      .sort((a, b) => b.priority - a.priority)
      .slice(0, count);

    return sorted;
  },

  /**
   * Evaluate action effectiveness
   */
  evaluateAction(
    action: NextAction,
    previousMastery: number,
    newMastery: number
  ): {
    effectiveness: number; // 0-100
    masteryGained: number;
    expectedVsActual: number; // Difference from expected
  } {
    const masteryGained = newMastery - previousMastery;
    const expectedGain = action.expectedMasteryGain;
    const expectedVsActual = masteryGained - expectedGain;

    // Effectiveness based on:
    // - Did it work? (mastery gained > 0)
    // - Was it efficient? (mastery gained / time)
    // - Was it expected? (close to expected)
    const successFactor = masteryGained > 0 ? 50 : 0;
    const efficiencyFactor = (masteryGained / action.estimatedMinutes) * 100;
    const accuracyFactor = 100 - Math.abs(expectedVsActual);

    const effectiveness = Math.min(
      100,
      Math.round((successFactor + efficiencyFactor + accuracyFactor) / 3)
    );

    return {
      effectiveness,
      masteryGained,
      expectedVsActual,
    };
  },

  /**
   * Get personalized recommendations based on learning pattern
   */
  getPersonalizedRecommendations(learningState: LearningState): {
    shortTerm: NextAction[];
    longTerm: NextAction[];
  } {
    // Short term: urgent items
    const shortTerm = learningState.dueReviews.slice(0, 3).map(card => ({
      type: "spaced_review" as ActionType,
      priority: 90,
      conceptId: card.conceptId,
      estimatedMinutes: 5,
      expectedMasteryGain: 5,
      reasoning: "Review due",
    }));

    // Long term: build mastery
    const longTerm: NextAction[] = [];

    if (learningState.overallMastery < 50) {
      longTerm.push({
        type: "continue_lesson",
        priority: 70,
        estimatedMinutes: 30,
        expectedMasteryGain: 10,
        reasoning: "Focus on completing lessons to build foundation",
      });
    } else if (learningState.overallMastery < 80) {
      longTerm.push({
        type: "take_quiz",
        priority: 60,
        estimatedMinutes: 20,
        expectedMasteryGain: 15,
        reasoning: "Test and reinforce knowledge with quizzes",
      });
    } else {
      longTerm.push({
        type: "mastery_check",
        priority: 75,
        estimatedMinutes: 30,
        expectedMasteryGain: 5,
        reasoning: "Ready for mastery certification",
      });
    }

    return { shortTerm, longTerm };
  },
};
