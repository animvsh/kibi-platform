"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FlashcardStudy,
  calculateReviewStats,
  type FlashcardData,
  type ReviewResult,
} from "@/components/flashcards/flashcard-study";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Clock,
  Flame,
  Trophy,
  Zap,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import type { Flashcard } from "@/types";
import type { SM2Record } from "@/lib/flashcards/sm2";

interface FlashcardWithReview extends Flashcard {
  record?: SM2Record;
}

interface CourseFlashcardsResponse {
  flashcards: Flashcard[];
  reviews?: Record<string, { easeFactor: number; interval: number; repetitions: number; nextReviewAt: string }>;
}

export default function FlashcardsPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [flashcards, setFlashcards] = useState<FlashcardWithReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStudying, setIsStudying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock user ID - in production, get from auth
  const userId = "user-123";

  const fetchFlashcards = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/courses/${courseId}/flashcards?includeReviews=true`);

      if (!response.ok) {
        throw new Error("Failed to fetch flashcards");
      }

      const data: CourseFlashcardsResponse = await response.json();

      const flashcardsWithRecords: FlashcardWithReview[] = data.flashcards.map((fc) => ({
        ...fc,
        record: data.reviews?.[fc.id]
          ? {
              flashcardId: fc.id,
              userId,
              easeFactor: data.reviews[fc.id].easeFactor,
              interval: data.reviews[fc.id].interval,
              repetitions: data.reviews[fc.id].repetitions,
              nextReviewAt: data.reviews[fc.id].nextReviewAt,
            }
          : undefined,
      }));

      setFlashcards(flashcardsWithRecords);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [courseId, userId]);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  const handleReviewComplete = async (results: ReviewResult[]) => {
    // Save all review results
    for (const result of results) {
      await fetch(`/api/flashcards/${result.flashcardId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: result.rating }),
      });
    }

    // Refresh flashcards to get updated records
    await fetchFlashcards();
    setIsStudying(false);
  };

  const handleStartStudy = () => {
    setIsStudying(true);
  };

  const handleBackToList = () => {
    setIsStudying(false);
    fetchFlashcards();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchFlashcards} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  // Convert to FlashcardData for study component
  const studyFlashcards: FlashcardData[] = flashcards.map((fc) => ({
    id: fc.id,
    front: fc.front,
    back: fc.back,
    difficulty: fc.difficulty,
    conceptName: fc.conceptId ? `Concept ${fc.conceptId.slice(0, 4)}` : undefined,
  }));

  const stats = calculateReviewStats(
    studyFlashcards,
    flashcards.map((fc) => ({
      flashcardId: fc.id,
      userId,
      easeFactor: fc.record?.easeFactor || 2.5,
      interval: fc.record?.interval || 0,
      repetitions: fc.record?.repetitions || 0,
      nextReviewAt: fc.record?.nextReviewAt || new Date().toISOString(),
    }))
  );

  const reviewRecords: SM2Record[] = flashcards
    .filter((fc) => fc.record)
    .map((fc) => fc.record!);

  if (isStudying) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBackToList}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Flashcards
          </Button>
        </div>

        {studyFlashcards.length > 0 ? (
          <FlashcardStudy
            flashcards={studyFlashcards}
            initialRecords={reviewRecords}
            userId={userId}
            onComplete={handleReviewComplete}
          />
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">All Caught Up!</h2>
              <p className="text-muted-foreground mb-4">
                No flashcards due for review right now.
              </p>
              <Button onClick={handleBackToList}>Back to Dashboard</Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/courses/${courseId}`}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Course
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Flashcards</h1>
          <p className="text-muted-foreground mt-1">
            Review with spaced repetition
          </p>
        </div>
        <Button onClick={handleStartStudy} size="lg" disabled={stats.dueCards === 0}>
          <Brain className="mr-2 h-4 w-4" />
          Start Review ({stats.dueCards} due)
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cards</p>
                <p className="text-2xl font-bold">{stats.totalCards}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Today</p>
                <p className="text-2xl font-bold">{stats.dueCards}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Learning</p>
                <p className="text-2xl font-bold">{stats.learningCards}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mastered</p>
                <p className="text-2xl font-bold">{stats.masteredCards}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Cards</TabsTrigger>
          <TabsTrigger value="due">
            Due ({stats.dueCards})
          </TabsTrigger>
          <TabsTrigger value="new">
            New ({stats.newCards})
          </TabsTrigger>
          <TabsTrigger value="learning">
            Learning ({stats.learningCards})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <FlashcardList flashcards={flashcards} courseId={courseId} />
        </TabsContent>

        <TabsContent value="due" className="space-y-4">
          <FlashcardList
            flashcards={flashcards.filter((fc) => {
              const review = fc.record;
              if (!review) return true; // New cards are due
              return new Date(review.nextReviewAt) <= new Date();
            })}
            courseId={courseId}
          />
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <FlashcardList
            flashcards={flashcards.filter((fc) => !fc.record || fc.record.repetitions === 0)}
            courseId={courseId}
          />
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <FlashcardList
            flashcards={flashcards.filter((fc) => {
              const review = fc.record;
              return review && review.repetitions > 0 && review.repetitions < 3;
            })}
            courseId={courseId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FlashcardList({
  flashcards,
  courseId,
}: {
  flashcards: FlashcardWithReview[];
  courseId: string;
}) {
  if (flashcards.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No flashcards yet</h3>
          <p className="text-muted-foreground">
            Flashcards will appear here when you start the course.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {flashcards.map((flashcard) => (
        <Card key={flashcard.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <Badge variant="outline" className="text-xs">
                {flashcard.difficulty}
              </Badge>
              {flashcard.record ? (
                <div className="flex gap-1">
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {flashcard.record.interval}d
                  </Badge>
                </div>
              ) : (
                <Badge variant="default" className="text-xs bg-blue-600">
                  New
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium text-sm mb-1">Front:</p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {flashcard.front}
              </p>
            </div>
            <div>
              <p className="font-medium text-sm mb-1">Back:</p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {flashcard.back}
              </p>
            </div>
            {flashcard.record && (
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Reps: {flashcard.record.repetitions}</span>
                  <span>EF: {flashcard.record.easeFactor.toFixed(1)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}