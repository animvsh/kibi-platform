/**
 * GET /api/users/[id]/streak
 * Get streak information for a user
 */

import { NextRequest, NextResponse } from "next/server";
import { getStreak, initializeStreak, getStreakMessage, getNextMilestone, daysUntilNextMilestone } from "@/lib/gamification/streaks";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    let streak = getStreak(userId);

    // Initialize streak if doesn't exist
    if (!streak) {
      const timezone = request.headers.get("X-Timezone") || undefined;
      streak = initializeStreak(userId, timezone);
    }

    const message = getStreakMessage(streak);
    const nextMilestone = getNextMilestone(streak.currentStreak);
    const daysLeft = daysUntilNextMilestone(streak.currentStreak);

    return NextResponse.json({
      data: {
        userId,
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastActivityDate: streak.lastActivityDate,
        streakStartDate: streak.streakStartDate,
        timezone: streak.timezone,
        message,
        nextMilestone: nextMilestone ? {
          days: nextMilestone.days,
          title: nextMilestone.title,
          xpBonus: nextMilestone.xpBonus,
          daysUntil: daysLeft,
        } : null,
      },
    });
  } catch (error) {
    console.error("Error fetching streak:", error);
    return NextResponse.json(
      { error: "Failed to fetch streak" },
      { status: 500 }
    );
  }
}
