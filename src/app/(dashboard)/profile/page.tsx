"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Trophy,
  Flame,
  Zap,
  BookOpen,
  Clock,
  Star,
  Target,
  Brain,
  TrendingUp,
  Settings,
  ChevronRight,
  Award,
  Medal,
} from "lucide-react";
import { getLevelProgress, getLevelTitle, getLevelMilestones, LEVEL_TITLES } from "@/lib/gamification/levels";
import { STREAK_MILESTONES, getStreak, initializeStreak } from "@/lib/gamification/streaks";
import { getAllBadges, getBadgeRarityColor, type BadgeId } from "@/lib/gamification/badges";

// Mock user data
const mockUser = {
  id: "user-1",
  name: "Alex Johnson",
  email: "alex@example.com",
  avatarUrl: null as string | null,
  totalXp: 2450,
  level: 8,
  currentStreak: 7,
  longestStreak: 14,
  coursesCompleted: 3,
  coursesInProgress: 2,
  lessonsCompleted: 42,
  memberSince: "2024-01-15",
};

// Mock earned badges
const mockEarnedBadges: BadgeId[] = ["first_course", "seven_day_streak", "flashcard_beast"];

export default function ProfilePage() {
  const [user] = useState(mockUser);
  const [levelProgress, setLevelProgress] = useState(getLevelProgress(user.totalXp));

  // Get actual streak data
  const streakData = getStreak(user.id) || initializeStreak(user.id);
  const currentStreak = streakData.currentStreak;
  const longestStreak = streakData.longestStreak;

  useEffect(() => {
    setLevelProgress(getLevelProgress(user.totalXp));
  }, [user.totalXp]);

  const allBadges = getAllBadges();
  const milestones = getLevelMilestones().filter((m) => m.xp > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground">
              Member since {new Date(user.memberSince).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>

      {/* XP and Level Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center">
                <Trophy className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Level {levelProgress.currentLevel}</p>
                <p className="text-2xl font-bold">{levelProgress.title}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">{user.totalXp.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total XP</p>
            </div>
          </div>

          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Level {levelProgress.currentLevel} Progress
              </span>
              <span className="font-medium">
                {levelProgress.xpInLevel.toLocaleString()} / {levelProgress.xpNeededForNextLevel.toLocaleString()} XP
              </span>
            </div>
            <Progress value={levelProgress.progressPercent} className="h-3" />
            <p className="text-xs text-muted-foreground text-right">
              {levelProgress.xpNeededForNextLevel - levelProgress.xpInLevel} XP to Level {levelProgress.nextLevel}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{currentStreak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Flame className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
                <p className="text-2xl font-bold">{longestStreak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lessons Done</p>
                <p className="text-2xl font-bold">{user.lessonsCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Courses</p>
                <p className="text-2xl font-bold">
                  {user.coursesCompleted} <span className="text-sm text-muted-foreground">completed</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="achievements" className="space-y-6">
        <TabsList>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="badges">All Badges</TabsTrigger>
          <TabsTrigger value="levels">Level Progress</TabsTrigger>
        </TabsList>

        {/* Achievements Tab */}
        <TabsContent value="achievements">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Streak Achievement */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-orange-100">
                    <Flame className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">7-Day Streak</p>
                      <Badge className="text-xs bg-orange-100 text-orange-700">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Maintain your {currentStreak}-day streak!
                    </p>
                    <div className="mt-2">
                      <Progress value={(currentStreak / 7) * 100} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Courses Completed */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-green-100">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Courses Completed</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {user.coursesCompleted} courses finished
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {user.coursesInProgress} in progress
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Level Progress */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Level {levelProgress.currentLevel}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {levelProgress.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {levelProgress.nextLevel - levelProgress.currentLevel} levels to next title
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* All Badges Tab */}
        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>
                {mockEarnedBadges.length} of {allBadges.length} badges earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {allBadges.map((badge) => {
                  const isEarned = mockEarnedBadges.includes(badge.id);
                  const rarityColor = getBadgeRarityColor(badge.rarity);

                  return (
                    <div
                      key={badge.id}
                      className={`relative p-4 rounded-lg border ${
                        isEarned ? "bg-card" : "bg-muted/30 opacity-60"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${rarityColor}`}>
                          {badge.rarity === "legendary" ? (
                            <Award className="w-5 h-5" />
                          ) : badge.rarity === "epic" ? (
                            <Medal className="w-5 h-5" />
                          ) : (
                            <Star className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${!isEarned && "text-muted-foreground"}`}>
                            {badge.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {badge.description}
                          </p>
                          <Badge
                            variant="outline"
                            className={`mt-2 text-xs ${rarityColor}`}
                          >
                            {badge.rarity}
                          </Badge>
                        </div>
                      </div>
                      {isEarned && (
                        <div className="absolute top-2 right-2">
                          <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                            <Star className="h-3 w-3 text-white fill-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Level Progress Tab */}
        <TabsContent value="levels">
          <Card>
            <CardHeader>
              <CardTitle>Level Milestones</CardTitle>
              <CardDescription>
                Track your progress to reach higher levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {milestones.map((milestone, index) => {
                  const isReached = user.totalXp >= milestone.xp;
                  const isCurrent = user.totalXp >= milestone.xp &&
                    (index === milestones.length - 1 || user.totalXp < milestones[index + 1].xp);
                  const nextXp = milestone.xp - user.totalXp;
                  const progressToNext = isReached ? 100 :
                    ((user.totalXp - (milestones[index - 1]?.xp || 0)) /
                      (milestone.xp - (milestones[index - 1]?.xp || 0))) * 100;

                  return (
                    <div key={milestone.level} className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            isReached
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isReached ? (
                            <Trophy className="h-5 w-5" />
                          ) : (
                            <span className="text-sm font-bold">{milestone.level}</span>
                          )}
                        </div>
                        {index < milestones.length - 1 && (
                          <div className="h-12 w-0.5 bg-muted" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Level {milestone.level}</p>
                            <p className="text-sm text-muted-foreground">{milestone.title}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${isReached ? "text-primary" : ""}`}>
                              {milestone.xp.toLocaleString()} XP
                            </p>
                            {isCurrent && (
                              <p className="text-xs text-muted-foreground">Current</p>
                            )}
                            {!isReached && nextXp > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {nextXp.toLocaleString()} XP to go
                              </p>
                            )}
                          </div>
                        </div>
                        {!isReached && (
                          <Progress value={Math.max(0, Math.min(100, progressToNext))} className="h-2 mt-2" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
