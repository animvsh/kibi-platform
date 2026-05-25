/**
 * Spaced Repetition (SM-2 Algorithm)
 * Manages mastery decay over time and schedules reviews
 */

export interface SM2Rating {
  quality: number; // 0-5 rating (0-2 = fail, 3-5 = pass)
  responseTimeMs: number; // Time taken to respond
}

export interface SM2Card {
  id: string;
  conceptId: string;
  userId: string;
  easeFactor: number;      // Default 2.5, min 1.3
  interval: number;        // Days until next review
  repetitions: number;     // Number of successful reviews
  nextReviewAt: string;    // ISO date string
  lastReviewAt?: string;
  lastQuality: number;
}

export interface SM2Result {
  conceptId: string;
  newEaseFactor: number;
  newInterval: number;
  newRepetitions: number;
  nextReviewAt: string;
  masteryDelta: number;   // Change in mastery score (-20 to +10)
  wasSuccessful: boolean;
}

// SM-2 Algorithm constants
const SM2_CONSTANTS = {
  MIN_EASE_FACTOR: 1.3,
  DEFAULT_EASE_FACTOR: 2.5,
  INITIAL_INTERVAL: 1,    // 1 day
  MASTERY_DECAY_RATE: 0.1, // 10% decay per day without review
  PERFECT_SCORE_BONUS: 5,
  FAIL_PENALTY: -15,
  PARTIAL_FAIL_PENALTY: -5,
  PASS_BONUS: 2,
};

// SM-2 quality to mastery conversion
const QUALITY_TO_MASTERY: Record<number, number> = {
  0: -20, // Complete blackout
  1: -15, // Incorrect, but recognized correct answer
  2: -5,  // Incorrect, but easy to recall
  3: 2,   // Correct with difficulty
  4: 5,   // Correct with hesitation
  5: 10,  // Perfect recall
};

// In-memory SM-2 card storage
const sm2CardsStore = new Map<string, SM2Card>();

function generateCardId(userId: string, conceptId: string): string {
  return `${userId}:${conceptId}`;
}

export const spacedRepetition = {
  /**
   * Initialize a card for SM-2 tracking
   */
  initializeCard(userId: string, conceptId: string): SM2Card {
    const id = generateCardId(userId, conceptId);
    const now = new Date();

    const card: SM2Card = {
      id,
      conceptId,
      userId,
      easeFactor: SM2_CONSTANTS.DEFAULT_EASE_FACTOR,
      interval: SM2_CONSTANTS.INITIAL_INTERVAL,
      repetitions: 0,
      nextReviewAt: now.toISOString(),
      lastReviewAt: undefined,
      lastQuality: 0,
    };

    sm2CardsStore.set(id, card);
    return card;
  },

  /**
   * Get a card for user and concept
   */
  getCard(userId: string, conceptId: string): SM2Card | null {
    const id = generateCardId(userId, conceptId);
    return sm2CardsStore.get(id) || null;
  },

  /**
   * Process a review using SM-2 algorithm
   */
  processReview(userId: string, conceptId: string, rating: SM2Rating): SM2Result {
    const card = this.getCard(userId, conceptId) || this.initializeCard(userId, conceptId);
    const now = new Date();

    const { easeFactor, interval, repetitions } = card;
    const quality = rating.quality;

    // Calculate new ease factor
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const newEaseFactor = Math.max(
      SM2_CONSTANTS.MIN_EASE_FACTOR,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    let newInterval: number;
    let newRepetitions: number;
    let wasSuccessful: boolean;

    if (quality < 3) {
      // Failed - reset repetitions
      newRepetitions = 0;
      newInterval = SM2_CONSTANTS.INITIAL_INTERVAL;
      wasSuccessful = false;
    } else {
      // Passed
      newRepetitions = repetitions + 1;
      wasSuccessful = true;

      if (newRepetitions === 1) {
        newInterval = 1; // 1 day
      } else if (newRepetitions === 2) {
        newInterval = 6; // 6 days
      } else {
        newInterval = Math.round(interval * newEaseFactor);
      }
    }

    // Calculate next review date
    const nextReviewDate = new Date(now);
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    // Calculate mastery delta
    const masteryDelta = QUALITY_TO_MASTERY[quality] || 0;

    // Update card
    const updatedCard: SM2Card = {
      ...card,
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitions: newRepetitions,
      nextReviewAt: nextReviewDate.toISOString(),
      lastReviewAt: now.toISOString(),
      lastQuality: quality,
    };

    sm2CardsStore.set(card.id, updatedCard);

    return {
      conceptId,
      newEaseFactor,
      newInterval,
      newRepetitions,
      nextReviewAt: nextReviewDate.toISOString(),
      masteryDelta,
      wasSuccessful,
    };
  },

  /**
   * Calculate mastery decay for a concept
   */
  calculateDecay(masteryScore: number, daysSinceReview: number, difficulty: number = 2.5): number {
    // Decay formula: M = M0 * e^(-k*t)
    // where k = MASTERY_DECAY_RATE * (difficulty / 2.5)
    const k = SM2_CONSTANTS.MASTERY_DECAY_RATE * (difficulty / 2.5);
    const decayedScore = masteryScore * Math.exp(-k * daysSinceReview);
    return Math.round(Math.max(0, decayedScore));
  },

  /**
   * Get concepts due for review
   */
  getDueReviews(userId: string): SM2Card[] {
    const now = new Date();
    const dueCards: SM2Card[] = [];

    for (const card of sm2CardsStore.values()) {
      if (card.userId === userId) {
        const nextReview = new Date(card.nextReviewAt);
        if (nextReview <= now) {
          dueCards.push(card);
        }
      }
    }

    return dueCards.sort((a, b) =>
      new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime()
    );
  },

  /**
   * Get review forecast
   */
  getReviewForecast(userId: string, days: number = 7): Record<string, number> {
    const forecast: Record<string, number> = {};
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + days);

    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      forecast[date.toISOString().split("T")[0]] = 0;
    }

    for (const card of sm2CardsStore.values()) {
      if (card.userId === userId) {
        const nextReview = new Date(card.nextReviewAt);
        if (nextReview <= endDate) {
          const dateKey = nextReview.toISOString().split("T")[0];
          if (forecast[dateKey] !== undefined) {
            forecast[dateKey]++;
          }
        }
      }
    }

    return forecast;
  },

  /**
   * Apply decay to all user concepts
   */
  applyGlobalDecay(userId: string, conceptMasteries: Map<string, number>): Map<string, number> {
    const now = new Date();
    const decayedMasteries = new Map<string, number>();

    for (const [conceptId, masteryScore] of conceptMasteries) {
      const card = this.getCard(userId, conceptId);

      if (card && card.lastReviewAt) {
        const lastReview = new Date(card.lastReviewAt);
        const daysSinceReview = Math.floor(
          (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceReview > 0) {
          const difficulty = card.easeFactor;
          const decayedScore = this.calculateDecay(masteryScore, daysSinceReview, difficulty);
          decayedMasteries.set(conceptId, decayedScore);
        } else {
          decayedMasteries.set(conceptId, masteryScore);
        }
      } else {
        // No card = no review yet, apply basic decay
        const decayedScore = this.calculateDecay(masteryScore, 7); // Assume 7 days
        decayedMasteries.set(conceptId, decayedScore);
      }
    }

    return decayedMasteries;
  },

  /**
   * Get SM-2 statistics for a user
   */
  getStats(userId: string): {
    totalCards: number;
    dueToday: number;
    dueTomorrow: number;
    averageEaseFactor: number;
    masteredCards: number; // interval > 21 days
    learningCards: number; // interval <= 21 days
  } {
    let totalCards = 0;
    let dueToday = 0;
    let dueTomorrow = 0;
    let totalEaseFactor = 0;
    let masteredCards = 0;
    let learningCards = 0;

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    for (const card of sm2CardsStore.values()) {
      if (card.userId === userId) {
        totalCards++;
        totalEaseFactor += card.easeFactor;

        const nextReview = new Date(card.nextReviewAt);
        if (nextReview <= now) {
          dueToday++;
        } else if (nextReview.toDateString() === tomorrow.toDateString()) {
          dueTomorrow++;
        }

        if (card.interval > 21) {
          masteredCards++;
        } else {
          learningCards++;
        }
      }
    }

    return {
      totalCards,
      dueToday,
      dueTomorrow,
      averageEaseFactor: totalCards > 0 ? totalEaseFactor / totalCards : SM2_CONSTANTS.DEFAULT_EASE_FACTOR,
      masteredCards,
      learningCards,
    };
  },

  /**
   * Reset card progress
   */
  resetCard(userId: string, conceptId: string): SM2Card {
    const id = generateCardId(userId, conceptId);
    const card = this.initializeCard(userId, conceptId);
    sm2CardsStore.set(id, card);
    return card;
  },

  /**
   * Delete a card
   */
  deleteCard(userId: string, conceptId: string): boolean {
    const id = generateCardId(userId, conceptId);
    return sm2CardsStore.delete(id);
  },

  /**
   * Get default SM-2 constants
   */
  getConstants(): typeof SM2_CONSTANTS {
    return { ...SM2_CONSTANTS };
  },
};
