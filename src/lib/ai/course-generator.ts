/**
 * Course Generation Service
 * Orchestrates the multi-agent course generation pipeline
 */

import { analyzeIntent } from "./agents/intent-analyzer";
import { generateCurriculum } from "./agents/curriculum-architect";
import { generateLessonContent } from "./agents/lesson-generator";
import { generateQuiz, generateUnitQuiz } from "./agents/assessment-generator";
import { generateFlashcards, generateFlashcardsForUnit } from "./agents/flashcard-generator";
import type {
  IntentAnalysis,
  CurriculumOutput,
  LessonContent,
  QuizOutput,
  FlashcardOutput,
  GenerationProgress,
  GenerationStatus,
  GeneratedCourse,
  CourseCreatedData,
  UnitCreatedData,
  LessonCreatedData,
} from "@/types/generation";
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
} from "@/types";
import { courseRepository } from "@/lib/db";

export type ProgressCallback = (progress: GenerationProgress) => void;
export type EntityEventCallback = (event: { type: string; data: CourseCreatedData | UnitCreatedData | LessonCreatedData }) => void;

function createProgress(
  status: GenerationStatus,
  message: string,
  progress: number,
  extra?: Partial<GenerationProgress>
): GenerationProgress {
  return {
    status,
    message,
    progress,
    ...extra,
  };
}

export async function generateCourse(
  prompt: string,
  sourceType: "prompt" | "file" | "url" | "youtube",
  sourceMetadata: Record<string, unknown> | undefined,
  userId: string,
  onProgress?: ProgressCallback,
  onEntityEvent?: EntityEventCallback,
  providedCourseId?: string
): Promise<GeneratedCourse> {
  const courseId = providedCourseId || crypto.randomUUID();
  const now = new Date().toISOString();

  // Initialize response objects
  let intent: IntentAnalysis | null = null;
  let curriculum: CurriculumOutput | null = null;
  const lessonContents = new Map<string, LessonContent>();

  // Create course
  const course: Course = {
    id: courseId,
    ownerId: userId,
    title: "Generating...",
    slug: `course-${courseId.slice(0, 8)}`,
    description: "",
    sourceType,
    sourceMetadata,
    difficulty: "beginner",
    estimatedDurationMinutes: 0,
    visibility: "private",
    remixable: true,
    status: "generating",
    generationPrompt: prompt,
    createdAt: now,
    updatedAt: now,
  };

  try {
    // Phase 1: Intent Analysis
    onProgress?.(
      createProgress("understanding", "Understanding your goal...", 5)
    );

    intent = await analyzeIntent(prompt);

    onProgress?.(
      createProgress(
        "analyzing_intent",
        "Finding the core concepts...",
        15,
        { currentUnitIndex: 0, courseId }
      )
    );

    // Save course shell to database immediately after Intent Analyzer
    // This ensures the course exists in DB even if generation fails
    await courseRepository.createCourse(course);

    // Emit course_created event early so client can show course dashboard
    onEntityEvent?.({
      type: "course_created",
      data: { courseId, title: course.title },
    });

    // Phase 2: Curriculum Architecture
    curriculum = await generateCurriculum(intent);

    course.title = curriculum.title;
    course.description = curriculum.description;
    course.difficulty = intent.level;
    course.estimatedDurationMinutes = curriculum.estimatedDurationMinutes;

    onProgress?.(
      createProgress("building_curriculum", "Building your learning path...", 25)
    );

    // Phase 3: Create Units and Modules
    const units: CourseUnit[] = [];
    const modules: CourseModule[] = [];
    const concepts: Concept[] = [];

    onProgress?.(
      createProgress("creating_units", "Creating learning units...", 30, {
        totalUnits: curriculum.units.length,
      })
    );

    for (let i = 0; i < curriculum.units.length; i++) {
      const unitOutline = curriculum.units[i];
      const unitId = crypto.randomUUID();

      const unit: CourseUnit = {
        id: unitId,
        courseId,
        title: unitOutline.title,
        description: unitOutline.description,
        orderIndex: i,
        requiredMasteryScore: 85,
        status: i === 0 ? "available" : "locked",
        createdAt: now,
      };
      units.push(unit);

      // Save unit to database and emit unit_created event
      await courseRepository.createUnit(unit);
      onEntityEvent?.({
        type: "unit_created",
        data: { unit },
      });

      // Create modules for this unit
      for (let j = 0; j < unitOutline.modules.length; j++) {
        const moduleOutline = unitOutline.modules[j];
        const moduleId = crypto.randomUUID();

        const moduleItem: CourseModule = {
          id: moduleId,
          courseId,
          unitId,
          title: moduleOutline.title,
          description: moduleOutline.description,
          moduleType: moduleOutline.moduleType,
          orderIndex: j,
          estimatedMinutes: moduleOutline.estimatedMinutes,
          createdAt: now,
        };
        modules.push(moduleItem);
      }

      onProgress?.(
        createProgress("creating_units", `Creating Unit ${i + 1}...`, 30 + Math.round((i / curriculum.units.length) * 15), {
          currentUnitIndex: i,
          totalUnits: curriculum.units.length,
        })
      );
    }

    // Phase 4: Generate Concepts
    for (let i = 0; i < curriculum.concepts.length; i++) {
      const conceptOutline = curriculum.concepts[i];

      const concept: Concept = {
        id: crypto.randomUUID(),
        courseId,
        name: conceptOutline.name,
        description: conceptOutline.description,
        prerequisiteConcepts: conceptOutline.prerequisiteConceptNames,
        difficulty: conceptOutline.difficulty,
        createdAt: now,
      };
      concepts.push(concept);
    }

    onProgress?.(
      createProgress("analyzing_intent", "Core concepts identified...", 35)
    );

    // Phase 5: Generate Lessons
    const lessons: Lesson[] = [];
    const totalModules = modules.length;

    onProgress?.(
      createProgress("writing_lessons", "Writing lessons...", 40, {
        totalLessons: totalModules,
      })
    );

    for (let i = 0; i < modules.length; i++) {
      const moduleItem = modules[i];
      const unit = units.find((u) => u.id === moduleItem.unitId)!;
      const conceptNames = concepts.map((c) => c.name);

      const content = await generateLessonContent(
        {
          title: moduleItem.title,
          description: moduleItem.description,
          moduleType: moduleItem.moduleType,
          estimatedMinutes: moduleItem.estimatedMinutes,
        },
        unit.title,
        curriculum.title,
        intent.level,
        conceptNames.join(", ")
      );

      lessonContents.set(`${unit.title}:${moduleItem.title}`, content);

      const lesson: Lesson = {
        id: crypto.randomUUID(),
        courseId,
        unitId: moduleItem.unitId,
        moduleId: moduleItem.id,
        title: content.title,
        lessonType: moduleItem.moduleType,
        contentJson: { markdown: content.content },
        plainText: content.content.replace(/[#*`]/g, ""),
        orderIndex: moduleItem.orderIndex,
        estimatedMinutes: moduleItem.estimatedMinutes,
        status: "draft",
        createdAt: now,
        updatedAt: now,
      };
      lessons.push(lesson);

      // Save lesson to database and emit lesson_created event
      await courseRepository.createLesson(lesson);
      onEntityEvent?.({
        type: "lesson_created",
        data: { lesson, unitId: lesson.unitId },
      });

      onProgress?.(
        createProgress("writing_lessons", `Writing lesson ${i + 1}/${totalModules}...`, 40 + Math.round((i / totalModules) * 20), {
          currentLessonIndex: i,
          totalLessons: totalModules,
        })
      );
    }

    // Phase 6: Generate Quizzes
    const quizzes: Quiz[] = [];
    const quizQuestions: QuizQuestion[] = [];

    onProgress?.(
      createProgress("generating_quizzes", "Generating quizzes...", 65)
    );

    // Generate a quiz for each unit
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const unitLessons = lessons.filter((l) => l.unitId === unit.id);
      const unitModules = modules.filter((m) => m.unitId === unit.id);
      const unitConcepts = concepts.map((c) => c.name);

      const unitLessonTitles = unitLessons.map((l) => l.title);

      const quizOutput = await generateUnitQuiz(
        unit.title,
        unitLessonTitles,
        unitConcepts,
        intent.level
      );

      const quizId = crypto.randomUUID();
      const quiz: Quiz = {
        id: quizId,
        courseId,
        unitId: unit.id,
        title: quizOutput.title,
        description: quizOutput.description,
        passingScore: quizOutput.passingScore,
        createdAt: now,
      };
      quizzes.push(quiz);

      // Create quiz questions
      for (const q of quizOutput.questions) {
        const question: QuizQuestion = {
          id: crypto.randomUUID(),
          quizId,
          questionType: q.questionType,
          question: q.question,
          optionsJson: q.options,
          correctAnswerJson: Array.isArray(q.correctAnswer)
            ? q.correctAnswer
            : [q.correctAnswer],
          explanation: q.explanation,
          difficulty: q.difficulty,
          conceptTags: q.conceptTags,
          createdAt: now,
        };
        quizQuestions.push(question);
      }

      onProgress?.(
        createProgress("generating_quizzes", `Unit ${i + 1} quiz created...`, 65 + Math.round((i / units.length) * 10))
      );
    }

    // Phase 7: Generate Flashcards
    const flashcards: Flashcard[] = [];

    onProgress?.(
      createProgress("creating_flashcards", "Creating flashcards...", 80)
    );

    // Generate flashcards for each unit
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const unitLessons = lessons.filter((l) => l.unitId === unit.id);
      const unitConcepts = concepts.map((c) => c.name);

      // Get lesson contents for this unit
      const unitLessonContents = new Map<string, LessonContent>();
      for (const lesson of unitLessons) {
        const key = `${unit.title}:${lesson.title}`;
        if (lessonContents.has(key)) {
          unitLessonContents.set(key, lessonContents.get(key)!);
        }
      }

      const unitFlashcards = await generateFlashcardsForUnit(
        unit.title,
        unitLessonContents,
        unitConcepts,
        intent.level
      );

      for (const fc of unitFlashcards) {
        const concept = concepts.find((c) => c.name === fc.conceptName);
        const flashcard: Flashcard = {
          id: crypto.randomUUID(),
          courseId,
          unitId: unit.id,
          conceptId: concept?.id,
          front: fc.front,
          back: fc.back,
          difficulty: fc.difficulty,
          createdAt: now,
        };
        flashcards.push(flashcard);
      }

      onProgress?.(
        createProgress("creating_flashcards", `Unit ${i + 1} flashcards created...`, 80 + Math.round((i / units.length) * 10))
      );
    }

    // Phase 8: Build Mastery Checks
    onProgress?.(
      createProgress("building_mastery", "Building mastery checks...", 92)
    );

    // Phase 9: Set up AI Tutor
    onProgress?.(
      createProgress("setting_up_tutor", "Setting up your AI tutor...", 95)
    );

    // Phase 10: Publishing
    course.status = "ready";
    onProgress?.(
      createProgress("publishing", "Publishing your course...", 98)
    );

    // Final completion
    onProgress?.(
      createProgress("completed", "Course generated successfully!", 100, {
        courseId,
      })
    );

    return {
      course,
      units,
      modules,
      lessons,
      quizzes,
      quizQuestions,
      flashcards,
      concepts,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    onProgress?.(
      createProgress("error", `Error: ${errorMessage}`, 0, {
        error: errorMessage,
      })
    );
    throw error;
  }
}
