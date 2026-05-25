/**
 * Database Layer
 * Simple in-memory store for course generation.
 * In production, replace with Prisma or other database.
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
} from "@/types";

// In-memory stores (replace with database in production)
const coursesStore = new Map<string, Course>();
const unitsStore = new Map<string, CourseUnit>();
const modulesStore = new Map<string, CourseModule>();
const lessonsStore = new Map<string, Lesson>();
const quizzesStore = new Map<string, Quiz>();
const quizQuestionsStore = new Map<string, QuizQuestion>();
const flashcardsStore = new Map<string, Flashcard>();
const conceptsStore = new Map<string, Concept>();

export const courseRepository = {
  async createCourse(course: Course): Promise<Course> {
    coursesStore.set(course.id, course);
    return course;
  },

  async updateCourse(courseId: string, updates: Partial<Course>): Promise<Course | null> {
    const course = coursesStore.get(courseId);
    if (!course) return null;
    const updated = { ...course, ...updates, updatedAt: new Date().toISOString() };
    coursesStore.set(courseId, updated);
    return updated;
  },

  async getCourse(courseId: string): Promise<Course | null> {
    return coursesStore.get(courseId) || null;
  },

  async createUnit(unit: CourseUnit): Promise<CourseUnit> {
    unitsStore.set(unit.id, unit);
    return unit;
  },

  async createUnits(units: CourseUnit[]): Promise<CourseUnit[]> {
    for (const unit of units) {
      unitsStore.set(unit.id, unit);
    }
    return units;
  },

  async createModule(mod: CourseModule): Promise<CourseModule> {
    modulesStore.set(mod.id, mod);
    return mod;
  },

  async createModules(mods: CourseModule[]): Promise<CourseModule[]> {
    for (const mod of mods) {
      modulesStore.set(mod.id, mod);
    }
    return mods;
  },

  async createLesson(lesson: Lesson): Promise<Lesson> {
    lessonsStore.set(lesson.id, lesson);
    return lesson;
  },

  async createLessons(lessons: Lesson[]): Promise<Lesson[]> {
    for (const lesson of lessons) {
      lessonsStore.set(lesson.id, lesson);
    }
    return lessons;
  },

  async createQuiz(quiz: Quiz): Promise<Quiz> {
    quizzesStore.set(quiz.id, quiz);
    return quiz;
  },

  async createQuizQuestions(questions: QuizQuestion[]): Promise<QuizQuestion[]> {
    for (const question of questions) {
      quizQuestionsStore.set(question.id, question);
    }
    return questions;
  },

  async createFlashcards(flashcards: Flashcard[]): Promise<Flashcard[]> {
    for (const flashcard of flashcards) {
      flashcardsStore.set(flashcard.id, flashcard);
    }
    return flashcards;
  },

  async createConcepts(concepts: Concept[]): Promise<Concept[]> {
    for (const concept of concepts) {
      conceptsStore.set(concept.id, concept);
    }
    return concepts;
  },
};
