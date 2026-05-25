/**
 * Flashcard Database Store
 * In-memory store for flashcards and review records
 * In production, replace with database
 */

import type { Flashcard, FlashcardReview } from "@/types";

// Flashcards organized by courseId
export const flashcardsStore = new Map<string, Flashcard[]>();

// Review records organized by userId, then flashcardId
export const flashcardReviewsStore = new Map<string, Map<string, FlashcardReview & {
  easeFactor: number;
  interval: number;
  repetitions: number;
}>>();

// CRUD operations for flashcards
export const flashcardRepository = {
  async createFlashcard(flashcard: Flashcard): Promise<Flashcard> {
    const courseFlashcards = flashcardsStore.get(flashcard.courseId) || [];
    courseFlashcards.push(flashcard);
    flashcardsStore.set(flashcard.courseId, courseFlashcards);
    return flashcard;
  },

  async createFlashcards(flashcards: Flashcard[]): Promise<Flashcard[]> {
    for (const flashcard of flashcards) {
      await this.createFlashcard(flashcard);
    }
    return flashcards;
  },

  async getFlashcardsByCourse(courseId: string): Promise<Flashcard[]> {
    return flashcardsStore.get(courseId) || [];
  },

  async getFlashcardsByUnit(courseId: string, unitId: string): Promise<Flashcard[]> {
    const courseFlashcards = flashcardsStore.get(courseId) || [];
    return courseFlashcards.filter((f) => f.unitId === unitId);
  },

  async getFlashcardById(courseId: string, flashcardId: string): Promise<Flashcard | null> {
    const courseFlashcards = flashcardsStore.get(courseId) || [];
    return courseFlashcards.find((f) => f.id === flashcardId) || null;
  },

  async getFlashcardReview(
    userId: string,
    flashcardId: string
  ): Promise<(FlashcardReview & { easeFactor: number; interval: number; repetitions: number }) | null> {
    const userReviews = flashcardReviewsStore.get(userId);
    return userReviews?.get(flashcardId) || null;
  },

  async createOrUpdateReview(
    review: FlashcardReview & { easeFactor: number; interval: number; repetitions: number }
  ): Promise<FlashcardReview & { easeFactor: number; interval: number; repetitions: number }> {
    let userReviews = flashcardReviewsStore.get(review.userId);
    if (!userReviews) {
      userReviews = new Map();
      flashcardReviewsStore.set(review.userId, userReviews);
    }
    userReviews.set(review.flashcardId, review);
    return review;
  },

  async getDueFlashcards(userId: string, courseId: string, limit = 20): Promise<Flashcard[]> {
    const courseFlashcards = flashcardsStore.get(courseId) || [];
    const userReviews = flashcardReviewsStore.get(userId) || new Map();
    const now = new Date();

    const dueCards: Flashcard[] = [];

    for (const flashcard of courseFlashcards) {
      const review = userReviews.get(flashcard.id);
      if (!review) {
        // New card - always due
        dueCards.push(flashcard);
      } else if (new Date(review.nextReviewAt) <= now) {
        // Review is due
        dueCards.push(flashcard);
      }
    }

    return dueCards.slice(0, limit);
  },
};