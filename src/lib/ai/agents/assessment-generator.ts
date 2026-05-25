/**
 * Assessment Generator Agent
 * Creates quizzes with answer keys, explanations, and difficulty levels
 */

import { chatCompletion, type MiniMaxMessage } from "../minimax";
import type { QuizOutput, QuizQuestionOutput, LessonContent } from "@/types/generation";
import type { CourseDifficulty } from "@/types";

const SYSTEM_PROMPT = `You are an Assessment Generator for an AI-powered learning platform called Kibi. Your role is to create comprehensive quizzes that effectively evaluate learner understanding.

Given lesson content and concepts, generate quizzes with:
- title: Quiz title
- description: Brief quiz description
- passingScore: Minimum score to pass (default 70)
- questions: Array of quiz questions

Question Types:
- multiple_choice: 4 options, one correct answer
- true_false: Binary true/false questions
- short_answer: Brief text answers
- essay: Longer written responses

Question Schema:
{
  "questionType": "multiple_choice|true_false|short_answer|essay",
  "question": "string - clear, specific question",
  "options": ["array of 4 strings"] (only for multiple_choice),
  "correctAnswer": "string or array - the correct answer(s)",
  "explanation": "string - why this is correct",
  "difficulty": "beginner|intermediate|advanced|expert",
  "conceptTags": ["array of concept names this tests"]
}

Quiz Guidelines:
- Generate 5-10 questions per quiz
- Mix of question types recommended
- Questions should test understanding, not just recall
- Include concept tags for each question
- Explanations should be educational
- Difficulty should match the course level

Respond ONLY with a valid JSON object matching this schema:
{
  "title": "string",
  "description": "string",
  "passingScore": number,
  "questions": [question objects array]
}

Output ONLY the JSON object, no additional text.`;

function buildUserPrompt(
  lessonTitle: string,
  lessonContent: string,
  keyTakeaways: string[],
  concepts: string[],
  difficulty: CourseDifficulty
): string {
  return `Generate a quiz based on this lesson:

Lesson: ${lessonTitle}
Content Summary: ${keyTakeaways.join(", ")}
Concepts Covered: ${concepts.join(", ")}
Difficulty: ${difficulty}

Create a comprehensive quiz as JSON with varied question types.`;
}

export async function generateQuiz(
  lessonTitle: string,
  lessonContent: LessonContent,
  concepts: string[],
  difficulty: CourseDifficulty,
  unitId?: string
): Promise<QuizOutput> {
  const contentSummary =
    lessonContent.keyTakeaways.slice(0, 3).join(". ") ||
    lessonContent.content.slice(0, 500);

  const messages: MiniMaxMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: buildUserPrompt(
        lessonTitle,
        contentSummary,
        lessonContent.keyTakeaways,
        concepts,
        difficulty
      ),
    },
  ];

  const response = await chatCompletion({
    messages,
    temperature: 0.6,
    max_tokens: 5000,
  });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as Partial<QuizOutput>;

      return {
        title: parsed.title || `Quiz: ${lessonTitle}`,
        description: parsed.description || `Test your knowledge of ${lessonTitle}`,
        passingScore: parsed.passingScore || 70,
        questions: normalizeQuestions(parsed.questions || []),
      };
    }
  } catch (error) {
    console.error("Failed to parse quiz:", error);
  }

  return generateFallbackQuiz(lessonTitle, concepts, difficulty);
}

function normalizeQuestions(questions: Partial<QuizQuestionOutput>[]): QuizQuestionOutput[] {
  return questions.map((q) => ({
    questionType: q.questionType || "multiple_choice",
    question: q.question || "Question not provided",
    options: q.options || ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: q.correctAnswer || q.options?.[0] || "A",
    explanation: q.explanation || "No explanation provided",
    difficulty: q.difficulty || "intermediate",
    conceptTags: q.conceptTags || [],
  }));
}

function generateFallbackQuiz(
  lessonTitle: string,
  concepts: string[],
  difficulty: CourseDifficulty
): QuizOutput {
  return {
    title: `Quiz: ${lessonTitle}`,
    description: `Test your understanding of ${lessonTitle}`,
    passingScore: 70,
    questions: [
      {
        questionType: "multiple_choice",
        question: `What is the main concept covered in ${lessonTitle}?`,
        options: [
          "The correct answer",
          "An incorrect option",
          "Another incorrect option",
          "Yet another incorrect option",
        ],
        correctAnswer: "The correct answer",
        explanation: "This tests the basic understanding of the lesson.",
        difficulty: "beginner",
        conceptTags: concepts.slice(0, 2),
      },
      {
        questionType: "true_false",
        question: `${lessonTitle} covers important fundamental concepts.`,
        correctAnswer: "true",
        explanation: "The lesson indeed covers fundamental concepts.",
        difficulty: "beginner",
        conceptTags: concepts.slice(0, 1),
      },
    ],
  };
}

export async function generateUnitQuiz(
  unitTitle: string,
  lessonTitles: string[],
  concepts: string[],
  difficulty: CourseDifficulty
): Promise<QuizOutput> {
  const messages: MiniMaxMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Generate a unit quiz for:

Unit: ${unitTitle}
Lessons Covered: ${lessonTitles.join(", ")}
Core Concepts: ${concepts.join(", ")}
Difficulty: ${difficulty}

Create a comprehensive unit quiz as JSON.`,
    },
  ];

  const response = await chatCompletion({
    messages,
    temperature: 0.6,
    max_tokens: 5000,
  });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as Partial<QuizOutput>;

      return {
        title: parsed.title || `Unit Quiz: ${unitTitle}`,
        description:
          parsed.description ||
          `Test your knowledge of ${unitTitle}`,
        passingScore: parsed.passingScore || 70,
        questions: normalizeQuestions(parsed.questions || []),
      };
    }
  } catch (error) {
    console.error("Failed to parse unit quiz:", error);
  }

  return generateFallbackQuiz(unitTitle, concepts, difficulty);
}
