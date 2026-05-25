/**
 * Remix Service
 * Handles course remixing with personalization.
 */

import type {
  Course,
  CourseUnit,
  CourseModule,
  Lesson,
  CourseDifficulty,
} from "@/types";

// Remixed courses store (in production, use database)
const remixedCoursesStore = new Map<string, {
  originalCourseId: string;
  remixedBy: string;
  remixedAt: string;
  personalizationAnswers: RemixPersonalization;
}>();

export interface RemixPersonalization {
  level: string; // "beginner" | "intermediate" | "advanced" | "expert"
  goal: string; // "career" | "hobby" | "academic" | "certification"
  timeAvailable: string; // "15min" | "30min" | "1hr" | "2hr+"
  difficulty: string; // "easier" | "same" | "harder"
  quizFrequency: string; // "more" | "same" | "less"
}

export interface RemixedCourse {
  course: Course;
  units: CourseUnit[];
  modules: CourseModule[];
  lessons: Lesson[];
}

/**
 * Apply personalization adjustments based on user answers
 */
function applyPersonalization(
  difficulty: CourseDifficulty,
  answers: RemixPersonalization
): { adjustedDifficulty: CourseDifficulty; adjustedModuleCount: number } {
  let adjustedDifficulty = difficulty;

  // Adjust difficulty based on preference
  if (answers.difficulty === "easier") {
    switch (difficulty) {
      case "expert":
        adjustedDifficulty = "advanced";
        break;
      case "advanced":
        adjustedDifficulty = "intermediate";
        break;
      case "intermediate":
        adjustedDifficulty = "beginner";
        break;
      default:
        adjustedDifficulty = "beginner";
    }
  } else if (answers.difficulty === "harder") {
    switch (difficulty) {
      case "beginner":
        adjustedDifficulty = "intermediate";
        break;
      case "intermediate":
        adjustedDifficulty = "advanced";
        break;
      case "advanced":
        adjustedDifficulty = "expert";
        break;
      default:
        adjustedDifficulty = "expert";
    }
  }

  // Adjust module count based on time and level
  let adjustedModuleCount = 1.0;
  if (answers.level === "beginner") {
    adjustedModuleCount *= 1.2; // More modules for beginners
  } else if (answers.level === "advanced" || answers.level === "expert") {
    adjustedModuleCount *= 0.8; // Fewer modules for advanced
  }

  if (answers.timeAvailable === "15min") {
    adjustedModuleCount *= 0.5;
  } else if (answers.timeAvailable === "30min") {
    adjustedModuleCount *= 0.75;
  } else if (answers.timeAvailable === "2hr+") {
    adjustedModuleCount *= 1.25;
  }

  return { adjustedDifficulty, adjustedModuleCount };
}

/**
 * Remix a course with personalization
 */
export async function remixCourse(
  originalCourse: Course,
  remixedBy: string,
  personalizationAnswers: RemixPersonalization
): Promise<RemixedCourse> {
  const newCourseId = crypto.randomUUID();
  const newSlug = `${originalCourse.slug}-remix-${crypto.randomUUID().slice(0, 8)}`;

  // Apply personalization
  const { adjustedDifficulty, adjustedModuleCount } = applyPersonalization(
    originalCourse.difficulty,
    personalizationAnswers
  );

  // Create remixed course
  const remixedCourse: Course = {
    ...originalCourse,
    id: newCourseId,
    slug: newSlug,
    title: `${originalCourse.title} (Personalized)`,
    description: `Remixed version of ${originalCourse.title} - adapted for your learning goals.`,
    difficulty: adjustedDifficulty,
    estimatedDurationMinutes: Math.round(
      originalCourse.estimatedDurationMinutes * adjustedModuleCount
    ),
    ownerId: remixedBy,
    visibility: "private",
    remixable: true,
    status: "ready",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Store remix metadata
  remixedCoursesStore.set(newCourseId, {
    originalCourseId: originalCourse.id,
    remixedBy,
    remixedAt: new Date().toISOString(),
    personalizationAnswers,
  });

  return {
    course: remixedCourse,
    units: [],
    modules: [],
    lessons: [],
  };
}

/**
 * Get remix metadata for a course
 */
export function getRemixMetadata(courseId: string) {
  return remixedCoursesStore.get(courseId) || null;
}

/**
 * Track remix count for a course (for analytics)
 */
export function incrementRemixCount(originalCourseId: string): number {
  // In production, this would update a database counter
  const countKey = `remix_count:${originalCourseId}`;
  const current = parseInt(
    (globalThis as Record<string, unknown>)[countKey] as string || "0"
  );
  const newCount = current + 1;
  (globalThis as Record<string, unknown>)[countKey] = newCount.toString();
  return newCount;
}

/**
 * Get remix count for a course
 */
export function getRemixCount(originalCourseId: string): number {
  const countKey = `remix_count:${originalCourseId}`;
  return parseInt((globalThis as Record<string, unknown>)[countKey] as string || "0");
}
