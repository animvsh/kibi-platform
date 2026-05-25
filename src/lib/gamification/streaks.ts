/**
 * Streak System
 * Tracks daily learning streaks with timezone awareness
 */

export interface StreakData {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string; // ISO date string (YYYY-MM-DD in user's timezone)
  streakStartDate: string;
  timezone: string;
}

export interface StreakMilestone {
  days: number;
  xpBonus: number;
  title: string;
}

// Streak milestones
export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 7, xpBonus: 50, title: "Week Warrior" },
  { days: 14, xpBonus: 100, title: "Fortnight Fighter" },
  { days: 30, xpBonus: 200, title: "Monthly Master" },
  { days: 60, xpBonus: 350, title: "Bimonthly Boss" },
  { days: 100, xpBonus: 500, title: "Century Champion" },
  { days: 365, xpBonus: 1000, title: "Yearly Legend" },
];

// In-memory streak storage (replace with database in production)
const streaksStore = new Map<string, StreakData>();

/**
 * Get user's timezone from browser or default to UTC
 */
export function getUserTimezone(): string {
  if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return "UTC";
}

/**
 * Get today's date in user's timezone
 */
export function getTodayInTimezone(timezone: string): string {
  const now = new Date();
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Get yesterday's date in user's timezone
 */
export function getYesterdayInTimezone(timezone: string): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(yesterday);
}

/**
 * Initialize streak data for a new user
 */
export function initializeStreak(userId: string, timezone?: string): StreakData {
  const tz = timezone || getUserTimezone();
  const today = getTodayInTimezone(tz);

  const streakData: StreakData = {
    userId,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: today,
    streakStartDate: today,
    timezone: tz,
  };

  streaksStore.set(userId, streakData);
  return streakData;
}

/**
 * Get streak data for a user
 */
export function getStreak(userId: string): StreakData | null {
  return streaksStore.get(userId) || null;
}

/**
 * Update streak for a user when they have meaningful activity
 * Returns the streak data and whether a milestone was reached
 */
export function updateStreak(userId: string, timezone?: string): { streak: StreakData; milestoneReached: StreakMilestone | null } {
  const tz = timezone || getUserTimezone();
  const today = getTodayInTimezone(tz);

  let streak = streaksStore.get(userId);

  // Initialize if doesn't exist
  if (!streak) {
    streak = initializeStreak(userId, tz);
    // First activity - start streak at 1
    streak.currentStreak = 1;
    streak.streakStartDate = today;
    streaksStore.set(userId, streak);
    return { streak, milestoneReached: null };
  }

  // Update timezone if provided
  if (timezone) {
    streak.timezone = timezone;
  }

  const yesterday = getYesterdayInTimezone(streak.timezone);

  // Already recorded activity today
  if (streak.lastActivityDate === today) {
    return { streak, milestoneReached: null };
  }

  // Check if continuing streak (activity yesterday)
  if (streak.lastActivityDate === yesterday) {
    streak.currentStreak += 1;
    streak.lastActivityDate = today;

    // Update longest if needed
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }

    streaksStore.set(userId, streak);

    // Check for milestone
    const milestone = checkMilestone(streak.currentStreak);
    return { streak, milestoneReached: milestone };
  }

  // Streak broken - start fresh
  streak.currentStreak = 1;
  streak.lastActivityDate = today;
  streak.streakStartDate = today;

  streaksStore.set(userId, streak);

  return { streak, milestoneReached: null };
}

/**
 * Check if current streak hits a milestone
 */
export function checkMilestone(streakDays: number): StreakMilestone | null {
  // Check from highest to lowest to get the most recent milestone
  const sortedMilestones = [...STREAK_MILESTONES].sort((a, b) => b.days - a.days);

  for (const milestone of sortedMilestones) {
    if (streakDays >= milestone.days) {
      return milestone;
    }
  }

  return null;
}

/**
 * Get next milestone for a streak
 */
export function getNextMilestone(currentStreak: number): StreakMilestone | null {
  for (const milestone of STREAK_MILESTONES) {
    if (currentStreak < milestone.days) {
      return milestone;
    }
  }
  return null; // All milestones achieved
}

/**
 * Get days until next milestone
 */
export function daysUntilNextMilestone(currentStreak: number): number | null {
  const next = getNextMilestone(currentStreak);
  return next ? next.days - currentStreak : null;
}

/**
 * Calculate streak freeze (future feature)
 * Returns whether user can use a streak freeze
 */
export function canUseStreakFreeze(_userId: string): boolean {
  // Future: Check if user has streak freeze tokens
  return false;
}

/**
 * Use a streak freeze to protect streak (future feature)
 */
export function useStreakFreeze(userId: string): boolean {
  // Future: Implement streak freeze logic
  // For now, return false
  return false;
}

/**
 * Get streak status message
 */
export function getStreakMessage(streak: StreakData): string {
  if (streak.currentStreak === 0) {
    return "Start your streak today!";
  }

  if (streak.currentStreak === 1) {
    return "Streak started! Keep it going tomorrow.";
  }

  const next = getNextMilestone(streak.currentStreak);
  if (next) {
    const daysLeft = next.days - streak.currentStreak;
    if (daysLeft === 1) {
      return `Almost there! ${next.title} tomorrow!`;
    }
    return `${daysLeft} days until ${next.title}!`;
  }

  return `${streak.currentStreak} day streak! You're unstoppable!`;
}

/**
 * Reset streak for a user (admin/testing)
 */
export function resetStreak(userId: string): void {
  streaksStore.delete(userId);
}

/**
 * Set streak directly (for testing/specific scenarios)
 */
export function setStreak(userId: string, streakData: Partial<StreakData>): StreakData {
  const existing = streaksStore.get(userId) || initializeStreak(userId);
  const updated = { ...existing, ...streakData };
  streaksStore.set(userId, updated);
  return updated;
}
