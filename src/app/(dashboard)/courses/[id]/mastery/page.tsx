"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Target,
  TrendingUp,
  Clock,
  Zap,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  Flame,
  Trophy,
  Star,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { KnowledgeMap, KnowledgeMapConcept, generateMockKnowledgeMap } from "@/components/gamification/knowledge-map";
import { getLevelProgress, getLevelTitle } from "@/lib/gamification/levels";

interface ConceptMastery {
  conceptId: string;
  conceptName: string;
  masteryScore: number;
  masteryStatus: "not_learned" | "familiar" | "developing" | "proficient" | "strong" | "mastered";
  isCore: boolean;
  learningSpeed: number;
  lastPracticedAt?: string;
  timeSpentMinutes: number;
  attempts: number;
}

interface MasteryDashboardData {
  courseId: string;
  courseTitle: string;
  overallMastery: number;
  overallProgress: number;
  conceptsLearned: number;
  totalConcepts: number;
  strongAreas: ConceptMastery[];
  weakAreas: ConceptMastery[];
  recentlyPracticed: ConceptMastery[];
  conceptBreakdown: ConceptMastery[];
  recommendedReview: ConceptMastery[];
  userXp: number;
  learningInsights: {
    avgLearningSpeed: number;
    totalTimeSpent: number;
    strongestConcept: string;
    needsMostWork: string;
    masteryDistribution: Record<string, number>;
  };
}

// Mock data generator
function generateMockMasteryData(courseId: string): MasteryDashboardData {
  const concepts: ConceptMastery[] = [
    {
      conceptId: "c1",
      conceptName: "React Components",
      masteryScore: 85,
      masteryStatus: "strong",
      isCore: true,
      learningSpeed: 1.2,
      lastPracticedAt: new Date().toISOString(),
      timeSpentMinutes: 120,
      attempts: 3,
    },
    {
      conceptId: "c2",
      conceptName: "State Management",
      masteryScore: 60,
      masteryStatus: "developing",
      isCore: true,
      learningSpeed: 0.9,
      lastPracticedAt: new Date(Date.now() - 86400000).toISOString(),
      timeSpentMinutes: 90,
      attempts: 4,
    },
    {
      conceptId: "c3",
      conceptName: "Props and Data Flow",
      masteryScore: 90,
      masteryStatus: "mastered",
      isCore: true,
      learningSpeed: 1.5,
      lastPracticedAt: new Date(Date.now() - 172800000).toISOString(),
      timeSpentMinutes: 60,
      attempts: 2,
    },
    {
      conceptId: "c4",
      conceptName: "useEffect Hook",
      masteryScore: 35,
      masteryStatus: "familiar",
      isCore: false,
      learningSpeed: 0.7,
      lastPracticedAt: new Date(Date.now() - 259200000).toISOString(),
      timeSpentMinutes: 45,
      attempts: 2,
    },
    {
      conceptId: "c5",
      conceptName: "Custom Hooks",
      masteryScore: 15,
      masteryStatus: "not_learned",
      isCore: false,
      learningSpeed: 0.5,
      timeSpentMinutes: 20,
      attempts: 1,
    },
    {
      conceptId: "c6",
      conceptName: "Context API",
      masteryScore: 0,
      masteryStatus: "not_learned",
      isCore: false,
      learningSpeed: 0,
      timeSpentMinutes: 0,
      attempts: 0,
    },
  ];

  const strong = concepts.filter((c) => c.masteryScore >= 70).sort((a, b) => b.masteryScore - a.masteryScore);
  const weak = concepts.filter((c) => c.masteryScore < 50).sort((a, b) => a.masteryScore - b.masteryScore);
  const recent = [...concepts].sort((a, b) => {
    if (!a.lastPracticedAt) return 1;
    if (!b.lastPracticedAt) return -1;
    return new Date(b.lastPracticedAt).getTime() - new Date(a.lastPracticedAt).getTime();
  }).slice(0, 3);
  const review = weak.slice(0, 3);

  const masteryDistribution: Record<string, number> = {
    not_learned: concepts.filter((c) => c.masteryStatus === "not_learned").length,
    familiar: concepts.filter((c) => c.masteryStatus === "familiar").length,
    developing: concepts.filter((c) => c.masteryStatus === "developing").length,
    proficient: concepts.filter((c) => c.masteryStatus === "proficient").length,
    strong: concepts.filter((c) => c.masteryStatus === "strong").length,
    mastered: concepts.filter((c) => c.masteryStatus === "mastered").length,
  };

  return {
    courseId,
    courseTitle: "React Fundamentals",
    overallMastery: Math.round(concepts.reduce((sum, c) => sum + c.masteryScore, 0) / concepts.length),
    overallProgress: 42,
    conceptsLearned: concepts.filter((c) => c.masteryScore > 0).length,
    totalConcepts: concepts.length,
    strongAreas: strong,
    weakAreas: weak,
    recentlyPracticed: recent,
    conceptBreakdown: concepts,
    recommendedReview: review,
    userXp: 2450, // Mock user XP
    learningInsights: {
      avgLearningSpeed: concepts.reduce((sum, c) => sum + c.learningSpeed, 0) / concepts.filter((c) => c.learningSpeed > 0).length,
      totalTimeSpent: concepts.reduce((sum, c) => sum + c.timeSpentMinutes, 0),
      strongestConcept: strong[0]?.conceptName || "N/A",
      needsMostWork: weak[0]?.conceptName || "N/A",
      masteryDistribution,
    },
  };
}

export default function MasteryDashboardPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [data, setData] = useState<MasteryDashboardData | null>(null);
  const [knowledgeMapData, setKnowledgeMapData] = useState<ReturnType<typeof generateMockKnowledgeMap> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "core" | "weak" | "strong">("all");

  useEffect(() => {
    // Simulate API fetch
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const masteryData = generateMockMasteryData(courseId);
      const mapData = generateMockKnowledgeMap(courseId);

      setData(masteryData);
      setKnowledgeMapData(mapData);
      setIsLoading(false);
    };

    fetchData();
  }, [courseId]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  const filteredConcepts = data.conceptBreakdown.filter((c) => {
    switch (filter) {
      case "core":
        return c.isCore;
      case "weak":
        return c.masteryScore < 50;
      case "strong":
        return c.masteryScore >= 70;
      default:
        return true;
    }
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/courses/${courseId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Mastery Dashboard</h1>
              <Badge variant="outline">{data.courseTitle}</Badge>
            </div>
            <p className="text-muted-foreground">
              Track your learning progress and identify areas for improvement
            </p>
          </div>
        </div>
        <Link href={`/courses/${courseId}`}>
          <Button variant="outline" size="sm" className="gap-2">
            Back to Course
          </Button>
        </Link>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Mastery</p>
                <p className="text-3xl font-bold">{data.overallMastery}%</p>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={data.overallMastery} className="h-2" />
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
                <p className="text-sm text-muted-foreground">Concepts Learned</p>
                <p className="text-3xl font-bold">
                  {data.conceptsLearned}
                  <span className="text-lg text-muted-foreground">/{data.totalConcepts}</span>
                </p>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={(data.conceptsLearned / data.totalConcepts) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Level {(() => { const p = getLevelProgress(data.userXp); return p.currentLevel; })()}</p>
                <p className="text-3xl font-bold">{(() => { const p = getLevelProgress(data.userXp); return p.title; })()}</p>
              </div>
            </div>
            <div className="mt-3">
              <Progress value={(() => { const p = getLevelProgress(data.userXp); return p.progressPercent; })()} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {(() => { const p = getLevelProgress(data.userXp); return p.xpNeededForNextLevel - p.xpInLevel; })()} XP to Level {(() => { const p = getLevelProgress(data.userXp); return p.nextLevel; })()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Invested</p>
                <p className="text-3xl font-bold">{data.learningInsights.totalTimeSpent}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Strongest Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{data.learningInsights.strongestConcept}</p>
            <p className="text-sm text-muted-foreground">Keep up the great work!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-500" />
              Needs Most Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{data.learningInsights.needsMostWork}</p>
            <p className="text-sm text-muted-foreground">Focus on improving this area</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              Learning Speed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{data.learningInsights.avgLearningSpeed.toFixed(1)} concepts/min</p>
            <p className="text-sm text-muted-foreground">Based on time spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Different Views */}
      <Tabs defaultValue="knowledge-map" className="space-y-6">
        <TabsList>
          <TabsTrigger value="knowledge-map">Knowledge Map</TabsTrigger>
          <TabsTrigger value="concepts">Concept Breakdown</TabsTrigger>
          <TabsTrigger value="review">Recommended Review</TabsTrigger>
        </TabsList>

        {/* Knowledge Map Tab */}
        <TabsContent value="knowledge-map">
          {knowledgeMapData && (
            <KnowledgeMap data={knowledgeMapData} />
          )}
        </TabsContent>

        {/* Concept Breakdown Tab */}
        <TabsContent value="concepts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Concepts</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === "core" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("core")}
                  >
                    Core
                  </Button>
                  <Button
                    variant={filter === "weak" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("weak")}
                  >
                    Needs Work
                  </Button>
                  <Button
                    variant={filter === "strong" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("strong")}
                  >
                    Strong
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredConcepts.map((concept) => (
                  <ConceptRow key={concept.conceptId} concept={concept} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommended Review Tab */}
        <TabsContent value="review">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Review Plan</CardTitle>
              <CardDescription>
                Based on your progress, focus on these concepts to improve your overall mastery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recommendedReview.map((concept, index) => (
                  <div
                    key={concept.conceptId}
                    className="flex items-center gap-4 p-4 rounded-lg border"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{concept.conceptName}</p>
                        {concept.isCore && (
                          <Badge variant="outline" className="text-xs">Core</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Current mastery: {concept.masteryScore}% -{" "}
                        {concept.masteryStatus.replace(/_/g, " ")}
                      </p>
                    </div>
                    <Link href={`/courses/${courseId}/lesson/${concept.conceptId}`}>
                      <Button size="sm" className="gap-2">
                        <BookOpen className="w-4 h-4" />
                        Practice
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Why these concepts?</h4>
                <p className="text-sm text-muted-foreground">
                  These concepts have the lowest mastery scores and are either core concepts
                  or prerequisites for other important topics. Improving these will boost your
                  overall understanding of the course material.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mastery Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Mastery Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-32">
            {Object.entries(data.learningInsights.masteryDistribution).map(([status, count]) => {
              const percent = (count / data.totalConcepts) * 100;
              const heights: Record<string, string> = {
                not_learned: "20%",
                familiar: "35%",
                developing: "50%",
                proficient: "70%",
                strong: "85%",
                mastered: "100%",
              };
              return (
                <div key={status} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-full flex items-end justify-center h-24">
                    <div
                      className={`w-12 rounded-t-md transition-all ${
                        {
                          not_learned: "bg-gray-200",
                          familiar: "bg-blue-200",
                          developing: "bg-yellow-200",
                          proficient: "bg-green-200",
                          strong: "bg-emerald-300",
                          mastered: "bg-purple-200",
                        }[status]
                      }`}
                      style={{ height: percent > 0 ? heights[status] : "0%" }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium">{count}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {status.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Concept Row Component
function ConceptRow({ concept }: { concept: ConceptMastery }) {
  const statusColors: Record<string, string> = {
    not_learned: "bg-gray-100 text-gray-600 border-gray-200",
    familiar: "bg-blue-100 text-blue-700 border-blue-200",
    developing: "bg-yellow-100 text-yellow-700 border-yellow-200",
    proficient: "bg-green-100 text-green-700 border-green-200",
    strong: "bg-emerald-100 text-emerald-700 border-emerald-200",
    mastered: "bg-purple-100 text-purple-700 border-purple-200",
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium">{concept.conceptName}</span>
            {concept.isCore && (
              <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                Core
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
            <span>{concept.attempts} attempts</span>
            <span>{concept.timeSpentMinutes} min spent</span>
            {concept.lastPracticedAt && (
              <span>Last: {new Date(concept.lastPracticedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Badge className={statusColors[concept.masteryStatus]}>
          {concept.masteryStatus.replace(/_/g, " ")}
        </Badge>
        <div className="w-32">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Mastery</span>
            <span className="font-medium">{concept.masteryScore}%</span>
          </div>
          <Progress value={concept.masteryScore} className="h-2" />
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );
}
