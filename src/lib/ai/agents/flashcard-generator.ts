/**
 * Flashcard Generator Agent
 * Creates flashcards with front/back, concept tags, and review metadata
 */

import { chatCompletion, type MiniMaxMessage } from "../minimax";
import type { FlashcardOutput, LessonContent } from "@/types/generation";
import type { CourseDifficulty } from "@/types";

const SYSTEM_PROMPT = `You are a Flashcard Generator for an AI-powered learning platform called Kibi. Your role is to create effective flashcards that promote learning through spaced repetition.

Given lesson content and concepts, generate flashcards with:
- front: The question or prompt (keep it concise)
- back: The answer or explanation
- conceptName: The main concept this flashcard relates to
- difficulty: Appropriate difficulty level

Flashcard Guidelines:
- Front should be a clear, single question or prompt
- Back should be a concise answer with enough detail to learn from
- Use simple language appropriate for the difficulty level
- Each flashcard should test one concept
- Make the front specific enough to be answerable
- Make the back complete enough to learn from

Generate 8-15 flashcards per lesson set.

Respond ONLY with a valid JSON array of objects matching this schema:
[
  {
    "front": "string - question or prompt",
    "back": "string - answer or explanation",
    "conceptName": "string - concept this relates to",
    "difficulty": "beginner|intermediate|advanced|expert"
  }
]

Output ONLY the JSON array, no additional text.`;

function buildUserPrompt(
  lessonTitle: string,
  lessonContent: LessonContent,
  concepts: string[],
  difficulty: CourseDifficulty
): string {
  const contentSummary = lessonContent.keyTakeaways.join(". ") ||
    lessonContent.content.slice(0, 1000);

  return `Generate flashcards based on this lesson:

Lesson: ${lessonTitle}
Key Takeaways: ${lessonContent.keyTakeaways.join(", ") || "See content"}
Concepts: ${concepts.join(", ")}
Difficulty: ${difficulty}

Create an array of flashcards as JSON.`;
}

export async function generateFlashcards(
  lessonTitle: string,
  lessonContent: LessonContent,
  concepts: string[],
  difficulty: CourseDifficulty
): Promise<FlashcardOutput[]> {
  const messages: MiniMaxMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: buildUserPrompt(
        lessonTitle,
        lessonContent,
        concepts,
        difficulty
      ),
    },
  ];

  const response = await chatCompletion({
    messages,
    temperature: 0.7,
    max_tokens: 4000,
  });

  try {
    // Try to parse as array
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as Partial<FlashcardOutput>[];

      return parsed
        .filter((f) => f.front && f.back)
        .map((f) => ({
          front: f.front || "",
          back: f.back || "",
          conceptName: f.conceptName || concepts[0] || "General",
          difficulty: validateDifficulty(f.difficulty, difficulty),
        }));
    }
  } catch (error) {
    console.error("Failed to parse flashcards:", error);
  }

  return generateFallbackFlashcards(lessonTitle, concepts, difficulty);
}

function validateDifficulty(
  difficulty: unknown,
  defaultDifficulty: CourseDifficulty
): CourseDifficulty {
  const validDifficulties: CourseDifficulty[] = [
    "beginner",
    "intermediate",
    "advanced",
    "expert",
  ];

  if (
    typeof difficulty === "string" &&
    validDifficulties.includes(difficulty as CourseDifficulty)
  ) {
    return difficulty as CourseDifficulty;
  }

  return defaultDifficulty;
}

function generateFallbackFlashcards(
  lessonTitle: string,
  concepts: string[],
  difficulty: CourseDifficulty
): FlashcardOutput[] {
  const concept = concepts[0] || lessonTitle;

  return [
    {
      front: `What is ${concept}?`,
      back: `${concept} is a fundamental concept related to ${lessonTitle}.`,
      conceptName: concept,
      difficulty,
    },
    {
      front: `Why is ${concept} important?`,
      back: `${concept} is important because it forms the foundation for understanding the broader topic.`,
      conceptName: concept,
      difficulty,
    },
    {
      front: `How does ${concept} work?`,
      back: `${concept} works by applying core principles to solve problems and demonstrate understanding.`,
      conceptName: concept,
      difficulty,
    },
  ];
}

export async function generateFlashcardsForUnit(
  unitTitle: string,
  lessonContents: Map<string, LessonContent>,
  allConcepts: string[],
  difficulty: CourseDifficulty
): Promise<FlashcardOutput[]> {
  const messages: MiniMaxMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Generate flashcards for the entire unit:

Unit: ${unitTitle}
Lessons: ${Array.from(lessonContents.keys()).join(", ")}
Concepts: ${allConcepts.join(", ")}
Difficulty: ${difficulty}

Create an array of unit-level flashcards as JSON.`,
    },
  ];

  const response = await chatCompletion({
    messages,
    temperature: 0.7,
    max_tokens: 5000,
  });

  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as Partial<FlashcardOutput>[];

      return parsed
        .filter((f) => f.front && f.back)
        .map((f) => ({
          front: f.front || "",
          back: f.back || "",
          conceptName: f.conceptName || "General",
          difficulty: validateDifficulty(f.difficulty, difficulty),
        }));
    }
  } catch (error) {
    console.error("Failed to parse unit flashcards:", error);
  }

  return [];
}
