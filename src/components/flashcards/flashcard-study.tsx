"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Rating,
  calculateSM2,
  type SM2Record,
  calculateMastery,
  type FlashcardStats,
} from "@/lib/flashcards/sm2";
import {
  RotateCcw,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Brain,
  Zap,
} from "lucide-react";

export interface FlashcardData {
  id: string;
  front: string;
  back: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  conceptName?: string;
}

export interface FlashcardStudyProps {
  flashcards: FlashcardData[];
  initialRecords?: SM2Record[];
  userId: string;
  onComplete?: (results: ReviewResult[]) => void;
}

export interface ReviewResult {
  flashcardId: string;
  rating: number;
  nextReviewAt: string;
  easeFactor: number;
  interval: number;
}

export function FlashcardStudy({
  flashcards,
  initialRecords = [],
  userId,
  onComplete,
}: FlashcardStudyProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [records, setRecords] = useState<Map<string, SM2Record>>(new Map(
    initialRecords.map((r) => [r.flashcardId, r])
  ));
  const [results, setResults] = useState<ReviewResult[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const currentCard = flashcards[currentIndex];
  const currentRecord = records.get(currentCard.id);

  const handleFlip = useCallback(() => {
    setIsFlipped(true);
  }, []);

  const handleRating = useCallback(
    (rating: number) => {
      if (!currentCard) return;

      const previousRecord = records.get(currentCard.id);
      const sm2Result = calculateSM2({
        quality: rating,
        previousEF: previousRecord?.easeFactor,
        previousInterval: previousRecord?.interval,
        previousRepetitions: previousRecord?.repetitions,
      });

      const newRecord: SM2Record = {
        flashcardId: currentCard.id,
        userId,
        easeFactor: sm2Result.easeFactor,
        interval: sm2Result.interval,
        repetitions: sm2Result.repetitions,
        nextReviewAt: sm2Result.nextReviewAt,
        lastReviewAt: new Date().toISOString(),
      };

      const newRecords = new Map(records);
      newRecords.set(currentCard.id, newRecord);
      setRecords(newRecords);

      const result: ReviewResult = {
        flashcardId: currentCard.id,
        rating,
        nextReviewAt: sm2Result.nextReviewAt,
        easeFactor: sm2Result.easeFactor,
        interval: sm2Result.interval,
      };
      setResults((prev) => [...prev, result]);

      // Move to next card or complete
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      } else {
        setIsComplete(true);
        onComplete?.(results);
      }
    },
    [currentCard, currentIndex, flashcards.length, records, userId, onComplete, results]
  );

  const handleRetry = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setResults([]);
    setIsComplete(false);
  }, []);

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Review Complete!
            </h2>
            <p className="text-green-700">
              You reviewed {flashcards.length} flashcards
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6 text-center">
              <Zap className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{results.length}</p>
              <p className="text-sm text-muted-foreground">Cards Reviewed</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Brain className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {Math.round(
                  results.reduce((acc, r) => acc + r.easeFactor, 0) / results.length
                )}
              </p>
              <p className="text-sm text-muted-foreground">Avg. Ease Factor</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {results.filter((r) => r.rating >= 3).length}
              </p>
              <p className="text-sm text-muted-foreground">Passed</p>
            </CardContent>
          </Card>
        </div>

        <Button onClick={handleRetry} className="w-full" size="lg">
          <RotateCcw className="mr-2 h-4 w-4" />
          Review Again
        </Button>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No flashcards to review</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Card {currentIndex + 1} of {flashcards.length}
          </span>
          <div className="flex gap-2">
            {currentRecord && (
              <Badge variant="outline" className="text-xs">
                Interval: {currentRecord.interval}d
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              EF: {currentRecord?.easeFactor.toFixed(1) || 2.5}
            </Badge>
          </div>
        </div>
        <Progress value={(currentIndex / flashcards.length) * 100} />
      </div>

      {/* Flashcard */}
      <div
        className="relative h-80 cursor-pointer"
        onClick={!isFlipped ? handleFlip : undefined}
      >
        <Card
          className={cn(
            "h-full transition-transform duration-500 preserve-3d",
            isFlipped && "rotate-y-180"
          )}
        >
          <CardContent className="h-full flex flex-col items-center justify-center p-6">
            {/* Front */}
            <div
              className={cn(
                "flex flex-col items-center justify-center h-full w-full",
                isFlipped && "hidden"
              )}
            >
              {currentCard.conceptName && (
                <Badge variant="secondary" className="mb-4">
                  {currentCard.conceptName}
                </Badge>
              )}
              <p className="text-xl text-center font-medium">
                {currentCard.front}
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Click to reveal answer
              </p>
            </div>

            {/* Back */}
            <div
              className={cn(
                "flex flex-col items-center justify-center h-full w-full",
                !isFlipped && "hidden"
              )}
            >
              <p className="text-xl text-center">{currentCard.back}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Buttons */}
      {isFlipped && (
        <div className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            How well did you know this?
          </p>
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="destructive"
              size="lg"
              onClick={() => handleRating(Rating.AGAIN)}
              className="flex flex-col items-center py-4"
            >
              <X className="h-5 w-5 mb-1" />
              <span className="text-xs">Again</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleRating(Rating.HARD)}
              className="flex flex-col items-center py-4"
            >
              <span className="text-lg mb-1">&#128546;</span>
              <span className="text-xs">Hard</span>
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={() => handleRating(Rating.GOOD)}
              className="flex flex-col items-center py-4 bg-blue-600 hover:bg-blue-700"
            >
              <Check className="h-5 w-5 mb-1" />
              <span className="text-xs">Good</span>
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={() => handleRating(Rating.EASY)}
              className="flex flex-col items-center py-4 bg-green-600 hover:bg-green-700"
            >
              <span className="text-lg mb-1">&#128526;</span>
              <span className="text-xs">Easy</span>
            </Button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            setCurrentIndex(Math.min(flashcards.length - 1, currentIndex + 1))
          }
          disabled={currentIndex === flashcards.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Calculate review statistics
 */
export function calculateReviewStats(
  flashcards: FlashcardData[],
  records: SM2Record[]
): FlashcardStats {
  const now = new Date();
  let dueCount = 0;
  let newCount = 0;
  let learningCount = 0;
  let masteredCount = 0;

  const recordMap = new Map(records.map((r) => [r.flashcardId, r]));

  for (const flashcard of flashcards) {
    const record = recordMap.get(flashcard.id);
    if (!record) {
      newCount++;
      dueCount++;
    } else if (new Date(record.nextReviewAt) <= now) {
      dueCount++;
      if (record.repetitions < 3) {
        learningCount++;
      } else if (record.interval >= 21) {
        masteredCount++;
      }
    }
  }

  return {
    totalCards: flashcards.length,
    dueCards: dueCount,
    newCards: newCount,
    learningCards: learningCount,
    reviewCards: dueCount - newCount,
    masteredCards: masteredCount,
    averageEaseFactor: 2.5, // Default
  };
}