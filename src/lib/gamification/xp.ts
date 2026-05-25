/**
 * XP System
 * Handles XP awards for various learning activities
 */

import type { XpEvent, XpEventType } from "@/types";

// XP Awards configuration (as per spec)
export const XP_AWARDS = {
  LESSON_COMPLETE: 10,
  QUIZ_COMPLETE: 25,
  QUIZ_SCORE_ABOVE_90_BONUS: 15,
  FLASHCARD_REVIEW: 10,
  PROJECT_SUBMIT: 50,
  CONCEPT_MASTERED: 30,
  UNIT_MASTERED: 100,
  COURSE_COMPLETE: 500,
  STREAK_BONUS: 20,
} as const;

// XP Event types mapping
export const XP_EVENT_TYPES: Record<string, XpEventType> = {
  lesson_complete: "lesson_complete",
  quiz_pass: "quiz_complete",
  flashcard_review: "flashcard_review",
  concept_mastered: "concept_mastered",
  unit_mastered: "unit_mastered",
  course_completed: "course_completed",
  streak_bonus: "streak_milestone",
};

// In-memory XP events store (replace with database in production)
const xpEventsStore = new Map<string, XpEvent>();
const userXpStore = new Map<string, number>();

export interface XpAwardInput {
  userId: string;
  eventType: XpEventType;
  courseId?: string;
  lessonId?: string;
  quizId?: string;
  conceptId?: string;
  score?: number; // For quiz score bonus calculation
  metadata?: Record<string, unknown>;
}

export interface XpAwardResult {
  eventId: string;
  xpAwarded: number;
  totalXp: number;
  newLevel: number;
  levelUp: boolean;
  previousLevel: number;
}

/**
 * Calculate XP for a given event
 */
export function calculateXp(eventType: XpEventType, score?: number): number {
  switch (eventType) {
    case "lesson_complete":
      return XP_AWARDS.LESSON_COMPLETE;
    case "quiz_complete":
      let xp = XP_AWARDS.QUIZ_COMPLETE;
      if (score !== undefined && score > 90) {
        xp += XP_AWARDS.QUIZ_SCORE_ABOVE_90_BONUS;
      }
      return xp;
    case "flashcard_review":
      return XP_AWARDS.FLASHCARD_REVIEW;
    case "concept_mastered":
      return XP_AWARDS.CONCEPT_MASTERED;
    case "unit_mastered":
      return XP_AWARDS.UNIT_MASTERED;
    case "course_completed":
      return XP_AWARDS.COURSE_COMPLETE;
    case "streak_milestone":
      return XP_AWARDS.STREAK_BONUS;
    default:
      return 0;
  }
}

/**
 * Award XP to a user and record the event
 */
export async function awardXp(input: XpAwardInput): Promise<XpAwardResult> {
  const { userId, eventType, courseId, lessonId, quizId, conceptId, score, metadata } = input;

  // Calculate XP amount
  const xpAmount = calculateXp(eventType, score);

  // Get current total XP
  const currentXp = userXpStore.get(userId) || 0;
  const previousTotal = currentXp;
  const previousLevel = calculateLevelFromXp(previousTotal);

  // Create XP event
  const eventId = `xp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const event: XpEvent = {
    id: eventId,
    userId,
    courseId,
    eventType,
    xpAmount,
    metadataJson: {
      ...metadata,
      lessonId,
      quizId,
      conceptId,
      score,
    },
    createdAt: new Date().toISOString(),
  };

  // Store the event
  xpEventsStore.set(eventId, event);

  // Update user total XP
  const newTotalXp = currentXp + xpAmount;
  userXpStore.set(userId, newTotalXp);

  const newLevel = calculateLevelFromXp(newTotalXp);
  const leveledUp = newLevel > previousLevel;

  return {
    eventId,
    xpAwarded: xpAmount,
    totalXp: newTotalXp,
    newLevel,
    levelUp: leveledUp,
    previousLevel,
  };
}

/**
 * Get user's total XP
 */
export function getUserXp(userId: string): number {
  return userXpStore.get(userId) || 0;
}

/**
 * Get user's XP events
 */
export function getUserXpEvents(userId: string, limit: number = 50): XpEvent[] {
  const events: XpEvent[] = [];
  for (const event of xpEventsStore.values()) {
    if (event.userId === userId) {
      events.push(event);
    }
  }
  return events
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

/**
 * Calculate level from XP using the spec thresholds
 * Level thresholds: 1(0), 2(100), 3(250), 4(500), 5(1000), 10(5000), 25(25000), 50(100000)
 */
export function calculateLevelFromXp(xp: number): number {
  const thresholds = [
    { level: 1, xp: 0 },
    { level: 2, xp: 100 },
    { level: 3, xp: 250 },
    { level: 4, xp: 500 },
    { level: 5, xp: 1000 },
    { level: 6, xp: 1500 },
    { level: 7, xp: 2500 },
    { level: 8, xp: 3500 },
    { level: 9, xp: 4500 },
    { level: 10, xp: 5000 },
    { level: 11, xp: 6500 },
    { level: 12, xp: 8000 },
    { level: 13, xp: 10000 },
    { level: 14, xp: 12500 },
    { level: 15, xp: 15000 },
    { level: 16, xp: 18000 },
    { level: 17, xp: 21000 },
    { level: 18, xp: 24000 },
    { level: 19, xp: 27000 },
    { level: 20, xp: 30000 },
    { level: 21, xp: 35000 },
    { level: 22, xp: 40000 },
    { level: 23, xp: 45000 },
    { level: 24, xp: 50000 },
    { level: 25, xp: 25000 }, // Note: spec says 25(25000), not sequential
    { level: 26, xp: 30000 },
    { level: 27, xp: 35000 },
    { level: 28, xp: 40000 },
    { level: 29, xp: 45000 },
    { level: 30, xp: 50000 },
    { level: 31, xp: 55000 },
    { level: 32, xp: 60000 },
    { level: 33, xp: 65000 },
    { level: 34, xp: 70000 },
    { level: 35, xp: 75000 },
    { level: 36, xp: 80000 },
    { level: 37, xp: 85000 },
    { level: 38, xp: 90000 },
    { level: 39, xp: 95000 },
    { level: 40, xp: 100000 },
    { level: 41, xp: 110000 },
    { level: 42, xp: 120000 },
    { level: 43, xp: 130000 },
    { level: 44, xp: 140000 },
    { level: 45, xp: 150000 },
    { level: 46, xp: 160000 },
    { level: 47, xp: 170000 },
    { level: 48, xp: 180000 },
    { level: 49, xp: 190000 },
    { level: 50, xp: 100000 },
  ];

  // Find the highest level where XP >= threshold
  let currentLevel = 1;
  for (const { level, xp: thresholdXp } of thresholds) {
    if (xp >= thresholdXp) {
      currentLevel = level;
    }
  }

  return currentLevel;
}

/**
 * Reset user's XP (for testing)
 */
export function resetUserXp(userId: string): void {
  userXpStore.delete(userId);
}

/**
 * Initialize user XP
 */
export function initializeUserXp(userId: string, initialXp: number = 0): void {
  userXpStore.set(userId, initialXp);
}
