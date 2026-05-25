/**
 * Badge System
 * 11 badges as per spec:
 * 1. First Course Created
 * 2. First Unit Mastered
 * 3. 7-Day Streak
 * 4. Quiz Master
 * 5. Flashcard Beast
 * 6. Project Finisher
 * 7. Fast Learner
 * 8. Comeback Learner
 * 9. Deep Focus
 * 10. Course Creator
 * 11. Public Course Published
 */

import type { XpEventType } from "@/types";

// Unified type for badge check events - accepts both BadgeCriteria types and XP event types
export type BadgeCheckEventType = BadgeCriteria["type"] | XpEventType;

export type BadgeId =
  | "first_course"
  | "first_unit_mastered"
  | "seven_day_streak"
  | "quiz_master"
  | "flashcard_beast"
  | "project_finisher"
  | "fast_learner"
  | "comeback_learner"
  | "deep_focus"
  | "course_creator"
  | "public_course_published";

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  category: "learning" | "achievement" | "social" | "streak";
  rarity: "common" | "rare" | "epic" | "legendary";
  criteria: BadgeCriteria;
}

export interface BadgeCriteria {
  type: "course_created" | "unit_mastered" | "streak_days" | "quiz_score" | "flashcard_count" | "project_count" | "learning_speed" | "comeback" | "focus_time" | "public_course";
  threshold?: number;
  timeframeDays?: number; // For time-based criteria
  courseId?: string; // Optional course ID for course-specific badges
}

export interface UserBadge {
  badgeId: BadgeId;
  earnedAt: string;
  progress?: number; // For partially earned badges
}

// Badge definitions
export const BADGES: Record<BadgeId, Badge> = {
  first_course: {
    id: "first_course",
    name: "First Course",
    description: "Created your first learning course",
    icon: "book-open",
    category: "achievement",
    rarity: "common",
    criteria: { type: "course_created", threshold: 1 },
  },

  first_unit_mastered: {
    id: "first_unit_mastered",
    name: "First Unit Mastered",
    description: "Mastered your first unit",
    icon: "graduation-cap",
    category: "learning",
    rarity: "common",
    criteria: { type: "unit_mastered", threshold: 1 },
  },

  seven_day_streak: {
    id: "seven_day_streak",
    name: "7-Day Streak",
    description: "Maintained a 7-day learning streak",
    icon: "flame",
    category: "streak",
    rarity: "rare",
    criteria: { type: "streak_days", threshold: 7 },
  },

  quiz_master: {
    id: "quiz_master",
    name: "Quiz Master",
    description: "Scored 100% on 10 quizzes",
    icon: "brain",
    category: "learning",
    rarity: "epic",
    criteria: { type: "quiz_score", threshold: 10 },
  },

  flashcard_beast: {
    id: "flashcard_beast",
    name: "Flashcard Beast",
    description: "Reviewed 500 flashcards",
    icon: "layers",
    category: "learning",
    rarity: "rare",
    criteria: { type: "flashcard_count", threshold: 500 },
  },

  project_finisher: {
    id: "project_finisher",
    name: "Project Finisher",
    description: "Completed 5 projects",
    icon: "rocket",
    category: "achievement",
    rarity: "epic",
    criteria: { type: "project_count", threshold: 5 },
  },

  fast_learner: {
    id: "fast_learner",
    name: "Fast Learner",
    description: "Completed a course in under 7 days",
    icon: "zap",
    category: "achievement",
    rarity: "rare",
    criteria: { type: "learning_speed", timeframeDays: 7 },
  },

  comeback_learner: {
    id: "comeback_learner",
    name: "Comeback Learner",
    description: "Returned after a 30+ day break and continued learning",
    icon: "refresh-ccw",
    category: "achievement",
    rarity: "epic",
    criteria: { type: "comeback", threshold: 30 },
  },

  deep_focus: {
    id: "deep_focus",
    name: "Deep Focus",
    description: "Studied for 4 hours in a single day",
    icon: "target",
    category: "learning",
    rarity: "rare",
    criteria: { type: "focus_time", threshold: 240 }, // 4 hours in minutes
  },

  course_creator: {
    id: "course_creator",
    name: "Course Creator",
    description: "Created 10 courses",
    icon: "pen-tool",
    category: "social",
    rarity: "epic",
    criteria: { type: "course_created", threshold: 10 },
  },

  public_course_published: {
    id: "public_course_published",
    name: "Public Course Published",
    description: "Published a course that is visible to everyone",
    icon: "globe",
    category: "social",
    rarity: "legendary",
    criteria: { type: "public_course", threshold: 1 },
  },
};

// Badge progress tracking
interface BadgeProgress {
  badgeId: BadgeId;
  current: number;
  target: number;
  lastUpdated: string;
}

// In-memory storage
const userBadgesStore = new Map<string, Set<BadgeId>>();
const userBadgeProgressStore = new Map<string, Map<BadgeId, BadgeProgress>>();

/**
 * Get all badge definitions
 */
export function getAllBadges(): Badge[] {
  return Object.values(BADGES);
}

/**
 * Get badge by ID
 */
export function getBadge(badgeId: BadgeId): Badge | undefined {
  return BADGES[badgeId];
}

/**
 * Get user's earned badges
 */
export function getUserBadges(userId: string): UserBadge[] {
  const badgeIds = userBadgesStore.get(userId);
  if (!badgeIds) return [];

  return Array.from(badgeIds).map((badgeId) => ({
    badgeId,
    earnedAt: new Date().toISOString(), // In production, store actual earn date
  }));
}

/**
 * Check and award badges based on user activity
 * Returns newly earned badges
 */
export function checkAndAwardBadges(
  userId: string,
  activity: {
    type: BadgeCheckEventType;
    count?: number;
    score?: number;
    daysSinceLastActivity?: number;
    courseId?: string;
    isPublic?: boolean;
    streakDays?: number;
    courseCreatedAt?: string;
    courseCompletedAt?: string;
    focusMinutes?: number;
  }
): BadgeId[] {
  const newlyEarned: BadgeId[] = [];
  const earnedBadges = userBadgesStore.get(userId) || new Set<BadgeId>();

  for (const [badgeId, badge] of Object.entries(BADGES)) {
    // Skip if already earned
    if (earnedBadges.has(badgeId as BadgeId)) continue;

    // Check criteria
    const earned = checkBadgeCriteria(badge, activity, userId);

    if (earned) {
      earnedBadges.add(badgeId as BadgeId);
      newlyEarned.push(badgeId as BadgeId);
    }
  }

  // Check streak badge if streak activity provided
  if (activity.streakDays !== undefined) {
    const streakBadge = checkStreakBadge(userId, activity.streakDays);
    if (streakBadge && !earnedBadges.has(streakBadge)) {
      earnedBadges.add(streakBadge);
      newlyEarned.push(streakBadge);
    }
  }

  // Check learning speed badge if course completion data provided
  if (activity.courseCreatedAt && activity.courseCompletedAt) {
    const speedBadge = checkLearningSpeedBadge(userId, activity.courseCreatedAt, activity.courseCompletedAt);
    if (speedBadge && !earnedBadges.has(speedBadge)) {
      earnedBadges.add(speedBadge);
      newlyEarned.push(speedBadge);
    }
  }

  // Check focus time badge if focus time provided
  if (activity.focusMinutes !== undefined) {
    const focusBadge = checkFocusTimeBadge(userId, activity.focusMinutes);
    if (focusBadge && !earnedBadges.has(focusBadge)) {
      earnedBadges.add(focusBadge);
      newlyEarned.push(focusBadge);
    }
  }

  // Check comeback badge if days since last activity provided
  if (activity.daysSinceLastActivity !== undefined) {
    const comebackBadge = checkComebackBadge(userId, activity.daysSinceLastActivity);
    if (comebackBadge && !earnedBadges.has(comebackBadge)) {
      earnedBadges.add(comebackBadge);
      newlyEarned.push(comebackBadge);
    }
  }

  if (newlyEarned.length > 0) {
    userBadgesStore.set(userId, earnedBadges);
  }

  return newlyEarned;
}

/**
 * Check if a specific badge criteria is met
 */
function checkBadgeCriteria(badge: Badge, activity: { type: BadgeCheckEventType; count?: number; score?: number; daysSinceLastActivity?: number; isPublic?: boolean; courseId?: string }, userId: string): boolean {
  const { criteria } = badge;

  switch (criteria.type) {
    case "course_created":
      if (activity.type === "course_created" && activity.count !== undefined) {
        return activity.count >= (criteria.threshold || 1);
      }
      // Direct course creation check
      if (activity.type === "course_created" && activity.courseId) {
        const progress = getOrCreateProgress(userId, badge.id);
        progress.current += 1;
        return progress.current >= (criteria.threshold || 1);
      }
      return false;

    case "unit_mastered":
      if (activity.type === "unit_mastered") {
        const progress = getOrCreateProgress(userId, badge.id);
        progress.current += 1;
        return progress.current >= (criteria.threshold || 1);
      }
      return false;

    case "streak_days":
      // This is checked via the streak system
      // Badge is awarded when streak hits threshold
      return false; // Handled separately

    case "quiz_score":
      if (activity.type === "quiz_score" && activity.score === 100) {
        const progress = getOrCreateProgress(userId, badge.id);
        progress.current += 1;
        return progress.current >= (criteria.threshold || 10);
      }
      return false;

    case "flashcard_count":
      if (activity.type === "flashcard_count" && activity.count !== undefined) {
        const progress = getOrCreateProgress(userId, badge.id);
        progress.current = (progress.current || 0) + activity.count;
        return progress.current >= (criteria.threshold || 500);
      }
      return false;

    case "project_count":
      if (activity.type === "project_count" && activity.count !== undefined) {
        const progress = getOrCreateProgress(userId, badge.id);
        progress.current = (progress.current || 0) + activity.count;
        return progress.current >= (criteria.threshold || 5);
      }
      return false;

    case "learning_speed":
      // Checked when course is completed within timeframe
      return false;

    case "comeback":
      if (activity.type === "comeback" && activity.daysSinceLastActivity !== undefined) {
        return activity.daysSinceLastActivity >= (criteria.threshold || 30);
      }
      return false;

    case "focus_time":
      // Checked via daily study time tracking
      return false;

    case "public_course":
      if (activity.type === "public_course" && activity.isPublic) {
        return true;
      }
      return false;

    default:
      return false;
  }
}

/**
 * Get or create badge progress tracking
 */
function getOrCreateProgress(userId: string, badgeId: BadgeId): BadgeProgress {
  if (!userBadgeProgressStore.has(userId)) {
    userBadgeProgressStore.set(userId, new Map());
  }

  const userProgress = userBadgeProgressStore.get(userId)!;

  if (!userProgress.has(badgeId)) {
    const badge = BADGES[badgeId];
    userProgress.set(badgeId, {
      badgeId,
      current: 0,
      target: badge.criteria.threshold || 1,
      lastUpdated: new Date().toISOString(),
    });
  }

  return userProgress.get(badgeId)!;
}

/**
 * Get badge progress for a user
 */
export function getBadgeProgress(userId: string): { badgeId: BadgeId; current: number; target: number; percent: number }[] {
  const progress: { badgeId: BadgeId; current: number; target: number; percent: number }[] = [];

  for (const badge of Object.values(BADGES)) {
    const earned = userBadgesStore.get(userId)?.has(badge.id);
    if (earned) {
      progress.push({
        badgeId: badge.id,
        current: badge.criteria.threshold || 1,
        target: badge.criteria.threshold || 1,
        percent: 100,
      });
    } else {
      const p = userBadgeProgressStore.get(userId)?.get(badge.id);
      progress.push({
        badgeId: badge.id,
        current: p?.current || 0,
        target: badge.criteria.threshold || 1,
        percent: p ? Math.round((p.current / (p.target || 1)) * 100) : 0,
      });
    }
  }

  return progress;
}

/**
 * Award badge directly (for specific triggers like streak milestones)
 */
export function awardBadge(userId: string, badgeId: BadgeId): boolean {
  const badge = BADGES[badgeId];
  if (!badge) return false;

  const earnedBadges = userBadgesStore.get(userId) || new Set();
  earnedBadges.add(badgeId);
  userBadgesStore.set(userId, earnedBadges);

  return true;
}

/**
 * Award streak badge if milestone reached
 */
export function checkStreakBadge(userId: string, streakDays: number): BadgeId | null {
  if (streakDays >= 7) {
    if (awardBadge(userId, "seven_day_streak")) {
      return "seven_day_streak";
    }
  }
  return null;
}

/**
 * Check learning speed badge (course completed quickly)
 */
export function checkLearningSpeedBadge(userId: string, courseCreatedAt: string, courseCompletedAt: string): BadgeId | null {
  const created = new Date(courseCreatedAt);
  const completed = new Date(courseCompletedAt);
  const daysTaken = Math.floor((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

  if (daysTaken <= 7) {
    if (awardBadge(userId, "fast_learner")) {
      return "fast_learner";
    }
  }
  return null;
}

/**
 * Check comeback badge
 */
export function checkComebackBadge(userId: string, daysSinceLastActivity: number): BadgeId | null {
  if (daysSinceLastActivity >= 30) {
    if (awardBadge(userId, "comeback_learner")) {
      return "comeback_learner";
    }
  }
  return null;
}

/**
 * Check focus time badge (4 hours in a single day)
 */
export function checkFocusTimeBadge(userId: string, focusMinutes: number): BadgeId | null {
  if (focusMinutes >= 240) { // 4 hours in minutes
    if (awardBadge(userId, "deep_focus")) {
      return "deep_focus";
    }
  }
  return null;
}

/**
 * Reset user badges (for testing)
 */
export function resetUserBadges(userId: string): void {
  userBadgesStore.delete(userId);
  userBadgeProgressStore.delete(userId);
}

/**
 * Get badge rarity color
 */
export function getBadgeRarityColor(rarity: Badge["rarity"]): string {
  switch (rarity) {
    case "common":
      return "text-gray-500 bg-gray-100";
    case "rare":
      return "text-blue-500 bg-blue-100";
    case "epic":
      return "text-purple-500 bg-purple-100";
    case "legendary":
      return "text-yellow-500 bg-yellow-100";
    default:
      return "text-gray-500 bg-gray-100";
  }
}

/**
 * Get badge category icon
 */
export function getBadgeCategoryIcon(category: Badge["category"]): string {
  switch (category) {
    case "learning":
      return "book-open";
    case "achievement":
      return "trophy";
    case "social":
      return "users";
    case "streak":
      return "flame";
    default:
      return "award";
  }
}
