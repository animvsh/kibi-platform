/**
 * POST /api/xp/award
 * Award XP to a user for completing activities
 */

import { NextRequest, NextResponse } from "next/server";
import { awardXp, XP_EVENT_TYPES } from "@/lib/gamification/xp";
import { getLevelProgress } from "@/lib/gamification/levels";
import { updateStreak, checkMilestone } from "@/lib/gamification/streaks";
import { checkAndAwardBadges, awardBadge, checkStreakBadge } from "@/lib/gamification/badges";
import type { XpEventType } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, eventType, courseId, lessonId, quizId, conceptId, score, metadata } = body;

    // Validate required fields
    if (!userId || !eventType) {
      return NextResponse.json(
        { error: "userId and eventType are required" },
        { status: 400 }
      );
    }

    // Validate event type
    const validEventTypes: XpEventType[] = [
      "lesson_complete",
      "quiz_complete",
      "flashcard_review",
      "concept_mastered",
      "course_completed",
      "streak_milestone",
      "daily_login",
    ];

    const normalizedEventType = XP_EVENT_TYPES[eventType] || eventType;
    if (!validEventTypes.includes(normalizedEventType as XpEventType)) {
      return NextResponse.json(
        { error: "Invalid event type" },
        { status: 400 }
      );
    }

    // Award XP
    const xpResult = await awardXp({
      userId,
      eventType: normalizedEventType as XpEventType,
      courseId,
      lessonId,
      quizId,
      conceptId,
      score,
      metadata,
    });

    // Update streak
    const { streak, milestoneReached: streakMilestone } = updateStreak(userId);

    // Award streak bonus XP if milestone reached
    let streakBonusXp = 0;
    if (streakMilestone) {
      streakBonusXp = streakMilestone.xpBonus;
      await awardXp({
        userId,
        eventType: "streak_milestone",
        courseId,
        metadata: { milestone: streakMilestone.title, days: streak.currentStreak },
      });

      // Check for streak badge
      checkStreakBadge(userId, streak.currentStreak);
    }

    // Check for other badge awards based on activity
    const newBadges = checkAndAwardBadges(userId, {
      type: normalizedEventType as XpEventType,
      count: 1,
      score,
    });

    // Get level progress
    const levelProgress = getLevelProgress(xpResult.totalXp);

    return NextResponse.json({
      data: {
        eventId: xpResult.eventId,
        xpAwarded: xpResult.xpAwarded + streakBonusXp,
        totalXp: xpResult.totalXp,
        level: xpResult.newLevel,
        levelProgress: {
          currentLevel: levelProgress.currentLevel,
          xpInLevel: levelProgress.xpInLevel,
          xpForNextLevel: levelProgress.xpNeededForNextLevel,
          progressPercent: levelProgress.progressPercent,
        },
        streak: {
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
          streakMilestone: streakMilestone ? {
            days: streakMilestone.days,
            title: streakMilestone.title,
            xpBonus: streakMilestone.xpBonus,
          } : null,
        },
        levelUp: xpResult.levelUp,
        previousLevel: xpResult.previousLevel,
        newBadges,
      },
    });
  } catch (error) {
    console.error("Error awarding XP:", error);
    return NextResponse.json(
      { error: "Failed to award XP" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/xp/award
 * Get XP info for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const { getUserXp } = await import("@/lib/gamification/xp");
    const { getLevelProgress } = await import("@/lib/gamification/levels");

    const totalXp = getUserXp(userId);
    const levelProgress = getLevelProgress(totalXp);

    return NextResponse.json({
      data: {
        totalXp,
        level: levelProgress.currentLevel,
        levelProgress: {
          currentLevel: levelProgress.currentLevel,
          xpInLevel: levelProgress.xpInLevel,
          xpForNextLevel: levelProgress.xpNeededForNextLevel,
          progressPercent: levelProgress.progressPercent,
          title: levelProgress.title,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching XP:", error);
    return NextResponse.json(
      { error: "Failed to fetch XP" },
      { status: 500 }
    );
  }
}
