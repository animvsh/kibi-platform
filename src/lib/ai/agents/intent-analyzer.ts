/**
 * Intent Analyzer Agent
 * Parses user prompt/files into structured intent for course generation
 */

import { chatCompletion, type MiniMaxMessage } from "../minimax";
import type { IntentAnalysis } from "@/types/generation";
import type { CourseDifficulty } from "@/types";

const SYSTEM_PROMPT = `You are an Intent Analyzer for an AI-powered learning platform called Kibi. Your task is to analyze user input and extract structured information for course generation.

Analyze the user's prompt carefully and extract:
- topic: The main subject matter (be specific)
- level: The difficulty level (beginner, intermediate, advanced, expert)
- goal: What the user wants to achieve by the end
- timeframe: How long they want to learn (e.g., "2 weeks", "1 month")
- courseStyle: Preferred learning style (visual, hands-on, theoretical, mixed)
- requiredSkills: Any prerequisite skills mentioned or implied
- additionalContext: Any extra relevant information

Respond ONLY with a valid JSON object matching this schema:
{
  "topic": "string - main subject",
  "level": "beginner|intermediate|advanced|expert",
  "goal": "string - learning objective",
  "timeframe": "string - e.g., '2 weeks', '1 month', '3 days'",
  "courseStyle": "visual|hands-on|theoretical|mixed",
  "requiredSkills": ["array of skill strings"],
  "additionalContext": "string or null"
}

Rules:
- Infer the difficulty level from the topic and any skill indicators
- If no timeframe is mentioned, estimate a reasonable one
- If no learning style is specified, default to "mixed"
- Keep topic specific but not overly narrow
- Be concise in goal description`;

const USER_PROMPT_TEMPLATE = `Analyze this course request:

"{prompt}"

Extract the intent and return only the JSON object.`;

export async function analyzeIntent(prompt: string): Promise<IntentAnalysis> {
  const messages: MiniMaxMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: USER_PROMPT_TEMPLATE.replace("{prompt}", prompt),
    },
  ];

  const response = await chatCompletion({
    messages,
    temperature: 0.3,
    max_tokens: 1000,
  });

  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as Partial<IntentAnalysis>;
      return {
        topic: parsed.topic || prompt,
        level: validateLevel(parsed.level),
        goal: parsed.goal || "Learn about " + prompt,
        timeframe: parsed.timeframe || "2 weeks",
        courseStyle: parsed.courseStyle || "mixed",
        requiredSkills: parsed.requiredSkills || [],
        additionalContext: parsed.additionalContext ?? undefined,
      };
    }
  } catch (error) {
    console.error("Failed to parse intent analysis:", error);
  }

  // Fallback: return default analysis
  return {
    topic: prompt,
    level: "beginner",
    goal: "Learn about " + prompt,
    timeframe: "2 weeks",
    courseStyle: "mixed",
    requiredSkills: [],
    additionalContext: undefined,
  };
}

function validateLevel(level: unknown): CourseDifficulty {
  const validLevels: CourseDifficulty[] = [
    "beginner",
    "intermediate",
    "advanced",
    "expert",
  ];
  if (typeof level === "string" && validLevels.includes(level as CourseDifficulty)) {
    return level as CourseDifficulty;
  }
  return "beginner";
}

export function buildIntentAnalysisPrompt(
  prompt: string,
  sourceType: string,
  sourceMetadata?: Record<string, unknown>
): string {
  let fullPrompt = prompt;

  if (sourceMetadata) {
    fullPrompt += `\n\nAdditional context: ${JSON.stringify(sourceMetadata)}`;
  }

  return fullPrompt;
}
