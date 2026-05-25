/**
 * GET /api/users/[id]/badges
 * Get badges for a user
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserBadges, getBadgeProgress, getAllBadges, getBadgeRarityColor } from "@/lib/gamification/badges";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const earnedBadges = getUserBadges(userId);
    const progress = getBadgeProgress(userId);
    const allBadges = getAllBadges();

    // Enrich earned badges with full badge info
    const earnedWithDetails = earnedBadges.map((ub) => {
      const badge = allBadges.find((b) => b.id === ub.badgeId);
      return {
        ...badge,
        earnedAt: ub.earnedAt,
        rarityColor: badge ? getBadgeRarityColor(badge.rarity) : "text-gray-500 bg-gray-100",
      };
    }).filter(Boolean);

    // Enrich progress with badge info
    const progressWithDetails = progress.map((p) => {
      const badge = allBadges.find((b) => b.id === p.badgeId);
      return {
        ...badge,
        current: p.current,
        target: p.target,
        percent: p.percent,
        rarityColor: badge ? getBadgeRarityColor(badge.rarity) : "text-gray-500 bg-gray-100",
      };
    }).filter(Boolean);

    // Group badges by category
    const byCategory = {
      learning: progressWithDetails.filter((b) => b?.category === "learning"),
      achievement: progressWithDetails.filter((b) => b?.category === "achievement"),
      social: progressWithDetails.filter((b) => b?.category === "social"),
      streak: progressWithDetails.filter((b) => b?.category === "streak"),
    };

    // Stats
    const stats = {
      totalBadges: allBadges.length,
      earnedBadges: earnedBadges.length,
      progressBadges: progress.filter((p) => p.percent > 0 && p.percent < 100).length,
    };

    return NextResponse.json({
      data: {
        userId,
        earnedBadges: earnedWithDetails,
        allBadges: progressWithDetails,
        byCategory,
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 }
    );
  }
}
