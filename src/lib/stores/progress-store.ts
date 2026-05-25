"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLevelProgress, getLevelFromXp } from "@/lib/gamification/levels";

interface ProgressState {
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  xpToNextLevel: number;
  lastActivityDate: string | null;

  // Actions
  addXp: (amount: number) => void;
  setStreak: (streak: number) => void;
  updateStreak: () => void;
  resetProgress: () => void;
  syncWithGamification: (xp: number, streak: number, longestStreak: number) => void;
}

const calculateLevel = (xp: number): { level: number; xpToNextLevel: number } => {
  // Use the gamification library for accurate level calculation
  const level = getLevelFromXp(xp);
  const progress = getLevelProgress(xp);
  return {
    level,
    xpToNextLevel: progress.xpNeededForNextLevel,
  };
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      totalXp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      xpToNextLevel: 100,
      lastActivityDate: null,

      addXp: (amount: number) => {
        const state = get();
        const newTotalXp = state.totalXp + amount;
        const { level: newLevel, xpToNextLevel } = calculateLevel(newTotalXp);

        set({
          totalXp: newTotalXp,
          level: newLevel,
          xpToNextLevel,
        });
      },

      setStreak: (streak: number) => {
        const state = get();
        set({
          currentStreak: streak,
          longestStreak: Math.max(state.longestStreak, streak),
        });
      },

      updateStreak: () => {
        const state = get();
        const today = new Date().toISOString().split("T")[0];
        const lastActivity = state.lastActivityDate;

        if (!lastActivity) {
          // First activity ever
          set({
            currentStreak: 1,
            longestStreak: Math.max(1, state.longestStreak),
            lastActivityDate: today,
          });
          return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (lastActivity === today) {
          // Already active today, no change
          return;
        } else if (lastActivity === yesterdayStr) {
          // Continuing streak
          const newStreak = state.currentStreak + 1;
          set({
            currentStreak: newStreak,
            longestStreak: Math.max(state.longestStreak, newStreak),
            lastActivityDate: today,
          });
        } else {
          // Streak broken
          set({
            currentStreak: 1,
            lastActivityDate: today,
          });
        }
      },

      resetProgress: () => {
        set({
          totalXp: 0,
          level: 1,
          currentStreak: 0,
          longestStreak: 0,
          xpToNextLevel: 100,
          lastActivityDate: null,
        });
      },

      syncWithGamification: (xp: number, streak: number, longest: number) => {
        const { level, xpToNextLevel } = calculateLevel(xp);
        set({
          totalXp: xp,
          level,
          currentStreak: streak,
          longestStreak: longest,
          xpToNextLevel,
        });
      },
    }),
    {
      name: "kibi-progress",
      partialize: (state) => ({
        totalXp: state.totalXp,
        level: state.level,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        xpToNextLevel: state.xpToNextLevel,
        lastActivityDate: state.lastActivityDate,
      }),
    }
  )
);

// XP configuration
export const XP_REWARDS = {
  LESSON_COMPLETE: 50,
  QUIZ_COMPLETE: 75,
  QUIZ_PERFECT_SCORE: 25,
  FLASHCARD_REVIEW: 10,
  MASTERY_ACHIEVED: 100,
  STREAK_MILESTONE_7: 50,
  STREAK_MILESTONE_30: 200,
  COURSE_COMPLETE: 500,
  DAILY_LOGIN: 10,
} as const;
