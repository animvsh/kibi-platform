/**
 * SM-2 Spaced Repetition Algorithm
 * Implements the SuperMemo 2 algorithm for flashcard review scheduling
 */

export interface SM2Record {
  flashcardId: string;
  userId: string;
  easeFactor: number; // EF -easiness factor (minimum 1.3)
  interval: number; // days until next review
  repetitions: number; // number of successful reviews
  nextReviewAt: string; // ISO date string
  lastReviewAt?: string;
}

export interface SM2Input {
  quality: number; // 0-5 rating (0-2 = fail, 3-5 = pass)
  previousEF?: number;
  previousInterval?: number;
  previousRepetitions?: number;
}

export interface SM2Output {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: string;
}

/**
 * Quality ratings:
 * 0 - Complete blackout, no recall
 * 1 - Incorrect, but recognized correct answer
 * 2 - Incorrect, but correct answer seemed easy to recall
 * 3 - Correct with serious difficulty
 * 4 - Correct after hesitation
 * 5 - Perfect response
 */

export const Rating = {
  AGAIN: 0, // Complete fail, start over
  HARD: 1, // Incorrect, recognized answer
  GOOD: 3, // Correct with difficulty
  EASY: 5, // Perfect response
} as const;

export type RatingType = (typeof Rating)[keyof typeof Rating];

/**
 * Calculate next review date using SM-2 algorithm
 */
export function calculateSM2(input: SM2Input): SM2Output {
  const { quality, previousEF = 2.5, previousInterval = 0, previousRepetitions = 0 } = input;

  let easeFactor = previousEF;
  let interval = previousInterval;
  let repetitions = previousRepetitions;

  // Calculate new ease factor
  // EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
  const newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(1.3, newEF); // EF should never be less than 1.3

  if (quality < 3) {
    // Failed - reset repetitions and interval
    repetitions = 0;
    interval = 1;
  } else {
    // Passed - calculate new interval
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(previousInterval * easeFactor);
    }
    repetitions += 1;
  }

  // Calculate next review date
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReviewAt: nextReviewAt.toISOString(),
  };
}

/**
 * Get cards due for review
 */
export function getDueCards(records: SM2Record[], limit = 20): SM2Record[] {
  const now = new Date();
  return records
    .filter((record) => new Date(record.nextReviewAt) <= now)
    .sort((a, b) => new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime())
    .slice(0, limit);
}

/**
 * Calculate mastery percentage based on review history
 */
export function calculateMastery(record: SM2Record): number {
  if (record.repetitions === 0) return 0;
  if (record.repetitions === 1) return 20;
  if (record.repetitions === 2) return 40;
  if (record.repetitions === 3) return 60;
  if (record.repetitions === 4) return 80;
  return Math.min(100, 80 + (record.interval / 30) * 20);
}

/**
 * Get statistics for a set of flashcards
 */
export interface FlashcardStats {
  totalCards: number;
  dueCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  masteredCards: number;
  averageEaseFactor: number;
}

export function calculateStats(records: SM2Record[]): FlashcardStats {
  const now = new Date();

  let totalCards = records.length;
  let dueCards = 0;
  let newCards = 0;
  let learningCards = 0;
  let masteredCards = 0;
  let totalEF = 0;

  for (const record of records) {
    totalEF += record.easeFactor;

    if (new Date(record.nextReviewAt) <= now) {
      dueCards++;
    }

    if (record.repetitions === 0) {
      newCards++;
    } else if (record.repetitions < 3) {
      learningCards++;
    } else if (record.interval >= 21) {
      masteredCards++;
    }
  }

  return {
    totalCards,
    dueCards,
    newCards,
    learningCards,
    reviewCards: dueCards - newCards,
    masteredCards,
    averageEaseFactor: totalCards > 0 ? totalEF / totalCards : 2.5,
  };
}