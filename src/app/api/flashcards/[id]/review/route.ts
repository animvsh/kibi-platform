import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth/jwt";
import { flashcardReviewsStore } from "@/lib/db/flashcards";
import { calculateSM2, Rating } from "@/lib/flashcards/sm2";

// POST /api/flashcards/[id]/review - Record a flashcard review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: flashcardId } = await params;
    const body = await request.json();
    const { rating } = body;

    // Validate rating
    if (!Object.values(Rating).includes(rating)) {
      return NextResponse.json(
        { message: "Invalid rating. Must be 0 (Again), 1 (Hard), 3 (Good), or 5 (Easy)" },
        { status: 400 }
      );
    }

    // Get or create review record
    const userReviews = flashcardReviewsStore.get(user.userId) || new Map();
    const existingReview = userReviews.get(flashcardId);

    // Calculate new review data using SM-2
    const sm2Result = calculateSM2({
      quality: rating,
      previousEF: existingReview?.easeFactor,
      previousInterval: existingReview?.interval,
      previousRepetitions: existingReview?.repetitions,
    });

    const reviewRecord = {
      id: existingReview?.id || crypto.randomUUID(),
      flashcardId,
      userId: user.userId,
      easeFactor: sm2Result.easeFactor,
      interval: sm2Result.interval,
      repetitions: sm2Result.repetitions,
      nextReviewAt: sm2Result.nextReviewAt,
      reviewedAt: new Date().toISOString(),
    };

    // Save review
    userReviews.set(flashcardId, reviewRecord);
    flashcardReviewsStore.set(user.userId, userReviews);

    return NextResponse.json({
      success: true,
      review: {
        easeFactor: reviewRecord.easeFactor,
        interval: reviewRecord.interval,
        repetitions: reviewRecord.repetitions,
        nextReviewAt: reviewRecord.nextReviewAt,
      },
      message: rating === Rating.AGAIN
        ? "Card reset. Review again soon."
        : rating === Rating.EASY
        ? "Great job! See you later."
        : "Review recorded. Next review scheduled.",
    });
  } catch (error) {
    console.error("Error recording review:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to record review" },
      { status: 500 }
    );
  }
}

// GET /api/flashcards/[id]/review - Get review status for a flashcard
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromCookies();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: flashcardId } = await params;
    const userReviews = flashcardReviewsStore.get(user.userId) || new Map();
    const review = userReviews.get(flashcardId);

    if (!review) {
      return NextResponse.json({
        review: null,
        message: "No review record found",
      });
    }

    return NextResponse.json({
      review: {
        easeFactor: review.easeFactor,
        interval: review.interval,
        repetitions: review.repetitions,
        nextReviewAt: review.nextReviewAt,
        lastReviewAt: review.reviewedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch review" },
      { status: 500 }
    );
  }
}