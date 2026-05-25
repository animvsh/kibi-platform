/**
 * Level System
 * Handles level calculations and progression
 */

// Level thresholds as per spec: 1(0), 2(100), 3(250), 4(500), 5(1000), 10(5000), 25(25000), 50(100000)
export const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 1000,
  6: 1500,
  7: 2000,
  8: 3000,
  9: 4000,
  10: 5000,
  11: 6000,
  12: 7500,
  13: 9000,
  14: 11000,
  15: 13000,
  16: 16000,
  17: 19000,
  18: 22000,
  19: 25000,
  20: 28000,
  21: 32000,
  22: 36000,
  23: 40000,
  24: 45000,
  25: 25000, // Spec says 25(25000)
  26: 30000,
  27: 35000,
  28: 40000,
  29: 45000,
  30: 50000,
  31: 55000,
  32: 60000,
  33: 65000,
  34: 70000,
  35: 75000,
  36: 80000,
  37: 85000,
  38: 90000,
  39: 95000,
  40: 100000,
  41: 110000,
  42: 120000,
  43: 130000,
  44: 140000,
  45: 150000,
  46: 160000,
  47: 170000,
  48: 180000,
  49: 190000,
  50: 100000, // Spec says 50(100000)
};

// Level titles for milestones
export const LEVEL_TITLES: Record<number, string> = {
  1: "Newcomer",
  2: "Beginner",
  3: "Learner",
  4: "Explorer",
  5: "Rising Star",
  6: "Achiever",
  7: "Scholar",
  8: "Expert",
  9: "Master",
  10: "Grandmaster",
  15: "Legend",
  20: "Champion",
  25: "Hero",
  30: "Titan",
  40: "Sage",
  50: "Immortal",
};

export interface LevelInfo {
  level: number;
  title: string;
  currentXp: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpInLevel: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
  isMaxLevel: boolean;
}

export interface LevelProgress {
  currentLevel: number;
  nextLevel: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpInLevel: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
  title: string;
}

/**
 * Get level from XP amount
 */
export function getLevelFromXp(xp: number): number {
  let level = 1;

  for (const [lvl, threshold] of Object.entries(LEVEL_THRESHOLDS)) {
    if (xp >= threshold) {
      level = parseInt(lvl, 10);
    } else {
      break;
    }
  }

  return level;
}

/**
 * Get XP required for a specific level
 */
export function getXpForLevel(level: number): number {
  // For explicit thresholds
  if (LEVEL_THRESHOLDS[level] !== undefined) {
    return LEVEL_THRESHOLDS[level];
  }

  // For intermediate levels, find bounding levels
  const levels = Object.keys(LEVEL_THRESHOLDS).map(Number).sort((a, b) => a - b);

  let lower = levels[0];
  let upper = levels[levels.length - 1];

  for (const l of levels) {
    if (l < level && l > lower) lower = l;
    if (l > level && l < upper) upper = l;
  }

  // Linear interpolation between known levels
  const lowerXp = LEVEL_THRESHOLDS[lower];
  const upperXp = LEVEL_THRESHOLDS[upper];
  const ratio = (level - lower) / (upper - lower);

  return Math.round(lowerXp + ratio * (upperXp - lowerXp));
}

/**
 * Get title for a level
 */
export function getLevelTitle(level: number): string {
  // Check exact level match first
  if (LEVEL_TITLES[level]) {
    return LEVEL_TITLES[level];
  }

  // Find the closest lower level with a title
  const titles = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);
  for (const l of titles) {
    if (level >= l) {
      return LEVEL_TITLES[l];
    }
  }

  return LEVEL_TITLES[1];
}

/**
 * Get detailed level progress information
 */
export function getLevelProgress(xp: number): LevelProgress {
  const currentLevel = getLevelFromXp(xp);
  const nextLevel = Math.min(currentLevel + 1, 50);
  const currentLevelXp = getXpForLevel(currentLevel);
  const nextLevelXp = getXpForLevel(nextLevel);

  const xpInLevel = xp - currentLevelXp;
  const xpNeededForNextLevel = nextLevelXp - currentLevelXp;
  const progressPercent = Math.min(100, Math.round((xpInLevel / xpNeededForNextLevel) * 100));

  return {
    currentLevel,
    nextLevel,
    xpForCurrentLevel: currentLevelXp,
    xpForNextLevel: nextLevelXp,
    xpInLevel,
    xpNeededForNextLevel,
    progressPercent,
    title: getLevelTitle(currentLevel),
  };
}

/**
 * Get comprehensive level info
 */
export function getLevelInfo(xp: number): LevelInfo {
  const progress = getLevelProgress(xp);
  const isMaxLevel = progress.currentLevel >= 50;

  return {
    level: progress.currentLevel,
    title: progress.title,
    currentXp: xp,
    xpForCurrentLevel: progress.xpForCurrentLevel,
    xpForNextLevel: progress.xpForNextLevel,
    xpInLevel: progress.xpInLevel,
    xpNeededForNextLevel: progress.xpNeededForNextLevel,
    progressPercent: progress.progressPercent,
    isMaxLevel,
  };
}

/**
 * Calculate XP needed to reach a target level from current XP
 */
export function xpToReachLevel(currentXp: number, targetLevel: number): number {
  const currentLevel = getLevelFromXp(currentXp);

  if (targetLevel <= currentLevel) {
    return 0;
  }

  let totalXpNeeded = 0;

  for (let level = currentLevel + 1; level <= targetLevel; level++) {
    totalXpNeeded += getXpForLevel(level) - getXpForLevel(level - 1);
  }

  return totalXpNeeded - (currentXp - getXpForLevel(currentLevel));
}

/**
 * Check if user should level up and get new level
 */
export function checkLevelUp(previousXp: number, newXp: number): { leveledUp: boolean; previousLevel: number; newLevel: number } {
  const previousLevel = getLevelFromXp(previousXp);
  const newLevel = getLevelFromXp(newXp);

  return {
    leveledUp: newLevel > previousLevel,
    previousLevel,
    newLevel,
  };
}

/**
 * Get all level milestones (for achievements/progress display)
 */
export function getLevelMilestones(): { level: number; xp: number; title: string }[] {
  return Object.entries(LEVEL_THRESHOLDS)
    .filter(([_, xp]) => xp > 0)
    .map(([level, xp]) => ({
      level: parseInt(level, 10),
      xp,
      title: getLevelTitle(parseInt(level, 10)),
    }))
    .sort((a, b) => a.level - b.level);
}
