import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth/jwt";
import { flashcardsStore, flashcardReviewsStore } from "@/lib/db/flashcards";
import type { Flashcard } from "@/types";

// GET /api/courses/[id]/flashcards - Get flashcards for a course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const unitId = searchParams.get("unitId");
    const conceptId = searchParams.get("conceptId");
    const includeReviews = searchParams.get("includeReviews") === "true";

    // Get flashcards for this course
    const courseFlashcards = flashcardsStore.get(courseId) || [];

    let filtered = courseFlashcards;
    if (unitId) {
      filtered = filtered.filter((f) => f.unitId === unitId);
    }
    if (conceptId) {
      filtered = filtered.filter((f) => f.conceptId === conceptId);
    }

    const response: {
      flashcards: Flashcard[];
      reviews?: Record<string, { easeFactor: number; interval: number; repetitions: number; nextReviewAt: string }>;
    } = {
      flashcards: filtered,
    };

    // Include review records if requested
    if (includeReviews) {
      const userReviews = flashcardReviewsStore.get(user.userId) || new Map();
      const reviews: Record<string, { easeFactor: number; interval: number; repetitions: number; nextReviewAt: string }> = {};

      for (const flashcard of filtered) {
        const review = userReviews.get(flashcard.id);
        if (review) {
          reviews[flashcard.id] = {
            easeFactor: review.easeFactor,
            interval: review.interval,
            repetitions: review.repetitions,
            nextReviewAt: review.nextReviewAt,
          };
        }
      }
      response.reviews = reviews;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching flashcards:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch flashcards" },
      { status: 500 }
    );
  }
}