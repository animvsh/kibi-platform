/**
 * Generation Types
 * Types for course generation pipeline
 */

import type {
  Course,
  CourseUnit,
  CourseModule,
  Lesson,
  Quiz,
  QuizQuestion,
  Flashcard,
  Concept,
  CourseDifficulty,
} from "./index";

// Intent Analysis
export interface IntentAnalysis {
  topic: string;
  level: CourseDifficulty;
  goal: string;
  timeframe: string;
  courseStyle?: "visual" | "hands-on" | "theoretical" | "mixed";
  requiredSkills: string[];
  additionalContext?: string;
}

// Curriculum Architecture
export interface CurriculumOutput {
  title: string;
  description: string;
  units: UnitOutline[];
  prerequisites: string[];
  concepts: ConceptOutline[];
  estimatedDurationMinutes: number;
}

export interface UnitOutline {
  title: string;
  description: string;
  modules: ModuleOutline[];
}

export interface ModuleOutline {
  title: string;
  description: string;
  moduleType: CourseModule["moduleType"];
  estimatedMinutes: number;
}

export interface ConceptOutline {
  name: string;
  description: string;
  prerequisiteConceptNames: string[];
  difficulty: CourseDifficulty;
}

// Lesson Generation
export interface LessonContent {
  title: string;
  content: string; // Rich markdown/JSON content
  keyTakeaways: string[];
  miniCheckQuestions: MiniCheckQuestion[];
  examples: LessonExample[];
}

export interface MiniCheckQuestion {
  question: string;
  correctAnswer: string;
  explanation: string;
}

export interface LessonExample {
  title: string;
  description: string;
  code?: string;
}

// Assessment Generation
export interface QuizOutput {
  title: string;
  description: string;
  passingScore: number;
  questions: QuizQuestionOutput[];
}

export interface QuizQuestionOutput {
  questionType: QuizQuestion["questionType"];
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: CourseDifficulty;
  conceptTags: string[];
}

// Flashcard Generation
export interface FlashcardOutput {
  front: string;
  back: string;
  conceptName: string;
  difficulty: CourseDifficulty;
}

// Generation Request/Response
export interface GenerationRequest {
  prompt: string;
  sourceType: "prompt" | "file" | "url" | "youtube";
  sourceMetadata?: Record<string, unknown>;
  preferences?: {
    difficulty?: CourseDifficulty;
    style?: "visual" | "hands-on" | "theoretical" | "mixed";
    timeframe?: string;
  };
}

export type GenerationStatus =
  | "understanding"
  | "analyzing_intent"
  | "building_curriculum"
  | "creating_units"
  | "writing_lessons"
  | "generating_quizzes"
  | "creating_flashcards"
  | "building_mastery"
  | "setting_up_tutor"
  | "publishing"
  | "completed"
  | "error";

export interface GenerationProgress {
  status: GenerationStatus;
  message: string;
  progress: number; // 0-100
  currentUnitIndex?: number;
  totalUnits?: number;
  currentLessonIndex?: number;
  totalLessons?: number;
  courseId?: string;
  error?: string;
}

// SSE Event Types
export type SSEEventType =
  | "progress"
  | "course_created"
  | "unit_created"
  | "lesson_created"
  | "quiz_created"
  | "flashcards_created"
  | "concept_created"
  | "completed"
  | "error";

export interface SSEEvent {
  type: SSEEventType;
  data: GenerationProgress | CourseCreatedData | UnitCreatedData | LessonCreatedData | QuizCreatedData | FlashcardsCreatedData | ConceptCreatedData | ErrorData;
}

export interface CourseCreatedData {
  courseId: string;
  title: string;
}

export interface UnitCreatedData {
  unit: CourseUnit;
}

export interface LessonCreatedData {
  lesson: Lesson;
  unitId: string;
}

export interface QuizCreatedData {
  quiz: Quiz;
  questions: QuizQuestion[];
  unitId?: string;
}

export interface FlashcardsCreatedData {
  flashcards: Flashcard[];
  unitId?: string;
}

export interface ConceptCreatedData {
  concept: Concept;
}

export interface ErrorData {
  message: string;
  stage?: GenerationStatus;
}

// Full Course Generation Result
export interface GeneratedCourse {
  course: Course;
  units: CourseUnit[];
  modules: CourseModule[];
  lessons: Lesson[];
  quizzes: Quiz[];
  quizQuestions: QuizQuestion[];
  flashcards: Flashcard[];
  concepts: Concept[];
}
