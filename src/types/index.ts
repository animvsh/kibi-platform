// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  preferredLearningStyle?: string;
  defaultDifficulty?: string;
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Course types
export type CourseSourceType = "prompt" | "file" | "url" | "youtube" | "syllabus";
export type CourseVisibility = "private" | "unlisted" | "public" | "invite" | "collaborative";
export type CourseStatus = "draft" | "generating" | "ready" | "published" | "archived";
export type CourseDifficulty = "beginner" | "intermediate" | "advanced" | "expert";

export interface Course {
  id: string;
  ownerId: string;
  title: string;
  slug: string;
  description: string;
  sourceType: CourseSourceType;
  sourceMetadata?: Record<string, unknown>;
  difficulty: CourseDifficulty;
  estimatedDurationMinutes: number;
  visibility: CourseVisibility;
  remixable: boolean;
  status: CourseStatus;
  thumbnailUrl?: string;
  generationPrompt?: string;
  collaboratorIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseUnit {
  id: string;
  courseId: string;
  title: string;
  description: string;
  orderIndex: number;
  unlockRule?: Record<string, unknown>;
  requiredMasteryScore: number;
  status: "locked" | "available" | "completed";
  createdAt: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  unitId: string;
  title: string;
  description: string;
  moduleType: ModuleType;
  orderIndex: number;
  estimatedMinutes: number;
  createdAt: string;
}

export type ModuleType =
  | "article"
  | "video"
  | "quiz"
  | "flashcard"
  | "practice"
  | "project"
  | "case_study"
  | "ai_tutor"
  | "mastery_check"
  | "final_assessment";

export interface Lesson {
  id: string;
  courseId: string;
  unitId: string;
  moduleId: string;
  title: string;
  lessonType: ModuleType;
  contentJson?: Record<string, unknown>;
  plainText?: string;
  orderIndex: number;
  estimatedMinutes: number;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

export interface Concept {
  id: string;
  courseId: string;
  name: string;
  description: string;
  prerequisiteConcepts: string[];
  difficulty: CourseDifficulty;
  createdAt: string;
}

export interface LessonConcept {
  lessonId: string;
  conceptId: string;
  importance: "core" | "supporting" | "optional";
}

// Quiz types
export type QuestionType = "multiple_choice" | "true_false" | "short_answer" | "essay";

export interface Quiz {
  id: string;
  courseId: string;
  unitId?: string;
  lessonId?: string;
  title: string;
  description: string;
  passingScore: number;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionType: QuestionType;
  question: string;
  optionsJson?: string[];
  correctAnswerJson: string | string[];
  explanation?: string;
  difficulty: CourseDifficulty;
  conceptTags: string[];
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  courseId: string;
  quizId: string;
  score: number;
  answersJson: Record<string, unknown>;
  feedbackJson?: Record<string, unknown>;
  completedAt: string;
}

// Flashcard types
export interface Flashcard {
  id: string;
  courseId: string;
  unitId?: string;
  conceptId?: string;
  front: string;
  back: string;
  difficulty: CourseDifficulty;
  createdAt: string;
}

export interface FlashcardReview {
  id: string;
  userId: string;
  flashcardId: string;
  rating: number;
  nextReviewAt: string;
  reviewedAt: string;
}

// Progress types
export type ProgressStatus = "not_started" | "in_progress" | "completed" | "abandoned";
export type MasteryStatus = "not_learned" | "familiar" | "developing" | "proficient" | "strong" | "mastered";

export interface UserCourseProgress {
  id: string;
  userId: string;
  courseId: string;
  currentUnitId?: string;
  currentLessonId?: string;
  overallProgress: number;
  overallMastery: number;
  status: ProgressStatus;
  startedAt: string;
  lastActiveAt: string;
  completedAt?: string;
}

export interface UserConceptMastery {
  id: string;
  userId: string;
  courseId: string;
  conceptId: string;
  masteryScore: number;
  confidenceScore: number;
  lastPracticedAt: string;
  nextReviewAt: string;
  learningSpeed: number;
  status: MasteryStatus;
}

// XP Event types (as per spec)
export type XpEventType =
  | "lesson_complete"
  | "quiz_pass"
  | "quiz_complete"
  | "flashcard_review"
  | "concept_mastered"
  | "unit_mastered"
  | "course_completed"
  | "streak_bonus"
  | "streak_milestone"
  | "project_complete"
  | "daily_login";

export interface XpEvent {
  id: string;
  userId: string;
  courseId?: string;
  eventType: XpEventType;
  xpAmount: number;
  metadataJson?: Record<string, unknown>;
  createdAt: string;
}

// Share types
export interface CourseShare {
  id: string;
  courseId: string;
  shareToken: string;
  visibility: CourseVisibility;
  createdBy: string;
  expiresAt?: string;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
