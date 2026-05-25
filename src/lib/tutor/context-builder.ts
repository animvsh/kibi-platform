/**
 * Tutor Context Builder
 * Builds context from current course, lesson, progress, quiz scores, weak concepts
 * for RAG-based tutor responses
 */

import type {
  Course,
  Lesson,
  CourseUnit,
  UserCourseProgress,
  UserConceptMastery,
  QuizAttempt,
  Concept,
} from "@/types";
import { conceptGraph, type ConceptNode } from "@/lib/mastery/concept-graph";
import type { WeakConcept, StrongConcept } from "@/lib/mastery/next-action";

export interface TutorContext {
  course: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    estimatedDurationMinutes: number;
  };
  currentLesson?: {
    id: string;
    title: string;
    content: string;
    keyTakeaways: string[];
    estimatedMinutes: number;
  };
  progress: {
    overallProgress: number;
    overallMastery: number;
    status: string;
    currentUnitId?: string;
    currentLessonId?: string;
    startedAt: string;
    lastActiveAt: string;
  };
  concepts: {
    weak: WeakConcept[];
    strong: StrongConcept[];
    current: ConceptNode[];
  };
  quizScores: {
    recentScores: number[];
    averageScore: number;
    totalAttempts: number;
  };
  userGoals?: string;
  suggestedTopics: string[];
}

export interface BuildContextOptions {
  userId: string;
  courseId: string;
  lessonId?: string;
  includeLessonContent?: boolean;
}

// Mock data stores (would be database in production)
const userConceptMasteryStore = new Map<string, UserConceptMastery>();
const quizAttemptsStore = new Map<string, QuizAttempt[]>();
const conceptsStore = new Map<string, Concept>();

/**
 * Build comprehensive tutor context
 */
export async function buildTutorContext(options: BuildContextOptions): Promise<TutorContext> {
  const { userId, courseId, lessonId, includeLessonContent = true } = options;

  // In production, fetch from database
  // For now, use mock data structure
  const mockCourse: Course = {
    id: courseId,
    ownerId: userId,
    title: "React Fundamentals",
    slug: "react-fundamentals",
    description: "Master the fundamentals of React including components, props, state, and hooks.",
    sourceType: "prompt",
    difficulty: "beginner",
    estimatedDurationMinutes: 180,
    visibility: "private",
    remixable: false,
    status: "ready",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
  };

  const mockProgress: UserCourseProgress = {
    id: `${userId}:${courseId}`,
    userId,
    courseId,
    currentUnitId: "unit-2",
    currentLessonId: lessonId || "lesson-1",
    overallProgress: 45,
    overallMastery: 62,
    status: "in_progress",
    startedAt: "2024-01-15T10:00:00Z",
    lastActiveAt: new Date().toISOString(),
  };

  // Build weak and strong concepts
  const weakConcepts = await buildWeakConcepts(userId, courseId);
  const strongConcepts = await buildStrongConcepts(userId, courseId);

  // Get current lesson context if lessonId provided
  let currentLesson: TutorContext["currentLesson"];
  if (lessonId && includeLessonContent) {
    currentLesson = await buildLessonContext(lessonId);
  }

  // Build quiz scores
  const quizScores = await buildQuizScores(userId, courseId);

  // Get concepts for current lesson
  const currentConcepts: ConceptNode[] = [];
  if (lessonId) {
    const lessonConcepts = await conceptGraph.getLessonConcepts(lessonId);
    for (const lc of lessonConcepts) {
      const concept = await conceptGraph.getConcept(lc.conceptId);
      if (concept) {
        currentConcepts.push(concept);
      }
    }
  }

  // Generate suggested topics based on weak concepts and current progress
  const suggestedTopics = generateSuggestedTopics(weakConcepts, strongConcepts, mockProgress);

  return {
    course: {
      id: mockCourse.id,
      title: mockCourse.title,
      description: mockCourse.description,
      difficulty: mockCourse.difficulty,
      estimatedDurationMinutes: mockCourse.estimatedDurationMinutes,
    },
    currentLesson,
    progress: {
      overallProgress: mockProgress.overallProgress,
      overallMastery: mockProgress.overallMastery,
      status: mockProgress.status,
      currentUnitId: mockProgress.currentUnitId,
      currentLessonId: mockProgress.currentLessonId,
      startedAt: mockProgress.startedAt,
      lastActiveAt: mockProgress.lastActiveAt,
    },
    concepts: {
      weak: weakConcepts,
      strong: strongConcepts,
      current: currentConcepts,
    },
    quizScores,
    suggestedTopics,
  };
}

/**
 * Build lesson context with content
 */
async function buildLessonContext(lessonId: string): Promise<TutorContext["currentLesson"] | undefined> {
  // Mock lesson data - in production, fetch from database
  const mockLessons: Record<string, {
    id: string;
    title: string;
    content: string;
    keyTakeaways: string[];
    estimatedMinutes: number;
  }> = {
    "lesson-1": {
      id: "lesson-1",
      title: "What are Components?",
      content: `React components are the building blocks of any React application. They are reusable, self-contained pieces of UI that can contain their own structure, styling, and logic.

Why Components?
- Reuse code: Write once, use everywhere
- Maintainability: Easy to update and debug
- Organization: Clean separation of concerns
- Testing: Components can be tested in isolation

Types of Components:
1. Functional Components - The modern way to write React components using JavaScript functions
2. Class Components - The older way using ES6 classes (legacy)

Key Concepts:
1. Props: Data passed from parent to child
2. State: Internal data that can change
3. Return: Components must return JSX
4. Capitalization: Component names must start with a capital letter`,
      keyTakeaways: [
        "Components are reusable UI building blocks",
        "Functional components are the modern standard",
        "Props allow data flow between components",
        "Components should be small and focused",
      ],
      estimatedMinutes: 10,
    },
  };

  return mockLessons[lessonId] || {
    id: lessonId,
    title: "Current Lesson",
    content: "Lesson content not available",
    keyTakeaways: [],
    estimatedMinutes: 15,
  };
}

/**
 * Build weak concepts list based on mastery scores
 */
async function buildWeakConcepts(userId: string, courseId: string): Promise<WeakConcept[]> {
  const progressKey = `${userId}:${courseId}`;
  const mastery = userConceptMasteryStore.get(progressKey);

  if (!mastery) {
    // Return mock weak concepts
    return [
      { conceptId: "concept-1", name: "React State", masteryScore: 35, attempts: 2, lastAttemptAt: new Date().toISOString() },
      { conceptId: "concept-2", name: "useEffect Hook", masteryScore: 42, attempts: 3, errorRate: 0.3 },
    ];
  }

  return [];
}

/**
 * Build strong concepts list
 */
async function buildStrongConcepts(userId: string, courseId: string): Promise<StrongConcept[]> {
  const progressKey = `${userId}:${courseId}`;
  const mastery = userConceptMasteryStore.get(progressKey);

  if (!mastery) {
    // Return mock strong concepts
    return [
      { conceptId: "concept-3", name: "JSX Syntax", masteryScore: 88, confidence: 0.9 },
      { conceptId: "concept-4", name: "Component Props", masteryScore: 82, confidence: 0.85 },
    ];
  }

  return [];
}

/**
 * Build quiz scores summary
 */
async function buildQuizScores(userId: string, courseId: string): Promise<TutorContext["quizScores"]> {
  const attempts = quizAttemptsStore.get(`${userId}:${courseId}`) || [];

  if (attempts.length === 0) {
    // Return mock scores
    return {
      recentScores: [75, 82, 68, 90],
      averageScore: 79,
      totalAttempts: 4,
    };
  }

  const scores = attempts.map((a) => a.score);
  return {
    recentScores: scores.slice(-5),
    averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    totalAttempts: attempts.length,
  };
}

/**
 * Generate suggested topics based on learning state
 */
function generateSuggestedTopics(
  weakConcepts: WeakConcept[],
  strongConcepts: StrongConcept[],
  progress: UserCourseProgress
): string[] {
  const topics: string[] = [];

  // Add weak concepts that need review
  for (const weak of weakConcepts.slice(0, 2)) {
    topics.push(`Review: ${weak.name}`);
  }

  // Add strong concepts for reinforcement
  for (const strong of strongConcepts.slice(0, 1)) {
    topics.push(`Practice: ${strong.name}`);
  }

  // Add next unit recommendation based on progress
  if (progress.overallProgress >= 40) {
    topics.push("Prepare for next unit");
  }

  if (progress.overallMastery < 50) {
    topics.push("Review course fundamentals");
  }

  return topics;
}

/**
 * Retrieve relevant content for RAG
 */
export async function retrieveRelevantContent(
  courseId: string,
  query: string,
  limit: number = 5
): Promise<string[]> {
  // Simple keyword-based retrieval
  // In production, use vector embeddings and semantic search
  const relevantContent: string[] = [];

  // Mock retrieval based on query keywords
  const contentPool: Record<string, string[]> = {
    components: [
      "React components are reusable UI building blocks",
      "Functional components use JavaScript functions to return JSX",
      "Class components use ES6 classes with render methods",
    ],
    state: [
      "State is internal data that can change over time",
      "useState hook manages state in functional components",
      "State updates trigger re-renders in React",
    ],
    props: [
      "Props are read-only data passed from parent to child components",
      "Props enable component reusability and composition",
      "Children prop allows passing nested elements",
    ],
    hooks: [
      "Hooks let you use state and other React features in functional components",
      "useEffect handles side effects like data fetching",
      "useContext provides global state without prop drilling",
    ],
  };

  const queryLower = query.toLowerCase();
  for (const [key, contents] of Object.entries(contentPool)) {
    if (queryLower.includes(key)) {
      relevantContent.push(...contents);
    }
  }

  return relevantContent.slice(0, limit);
}

/**
 * Format context for AI prompt
 */
export function formatContextForPrompt(context: TutorContext): string {
  let prompt = `You are Kibi, an AI tutor for the course "${context.course.title}". `;
  prompt += `Course description: ${context.course.description}\n\n`;

  if (context.currentLesson) {
    prompt += `CURRENT LESSON: ${context.currentLesson.title}\n`;
    prompt += `Content: ${context.currentLesson.content}\n`;
    prompt += `Key Takeaways: ${context.currentLesson.keyTakeaways.join(", ")}\n\n`;
  }

  prompt += `Your role is to help the student understand concepts, not give direct answers.\n`;
  prompt += `Use Socratic questioning to guide them to discoveries.\n\n`;

  if (context.concepts.weak.length > 0) {
    prompt += `AREAS NEEDING ATTENTION:\n`;
    for (const weak of context.concepts.weak) {
      prompt += `- ${weak.name} (mastery: ${weak.masteryScore}%)\n`;
    }
    prompt += `\n`;
  }

  if (context.concepts.strong.length > 0) {
    prompt += `STRONG AREAS:\n`;
    for (const strong of context.concepts.strong) {
      prompt += `- ${strong.name} (mastery: ${strong.masteryScore}%)\n`;
    }
    prompt += `\n`;
  }

  prompt += `STUDENT PROGRESS:\n`;
  prompt += `- Overall progress: ${context.progress.overallProgress}%\n`;
  prompt += `- Overall mastery: ${context.progress.overallMastery}%\n`;
  prompt += `- Status: ${context.progress.status}\n\n`;

  if (context.quizScores.totalAttempts > 0) {
    prompt += `QUIZ PERFORMANCE:\n`;
    prompt += `- Average score: ${context.quizScores.averageScore.toFixed(1)}%\n`;
    prompt += `- Total attempts: ${context.quizScores.totalAttempts}\n`;
    prompt += `- Recent scores: ${context.quizScores.recentScores.join(", ")}\n\n`;
  }

  return prompt;
}
