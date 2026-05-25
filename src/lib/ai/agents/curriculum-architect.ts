/**
 * Curriculum Architect Agent
 * Generates course structure: title, outline, units, modules, concept graph
 */

import { chatCompletion, type MiniMaxMessage } from "../minimax";
import type { CurriculumOutput, IntentAnalysis } from "@/types/generation";

const SYSTEM_PROMPT = `You are a Curriculum Architect for an AI-powered learning platform called Kibi. Your role is to design comprehensive course structures that guide learners from foundational concepts to mastery.

Given an intent analysis, generate a complete course curriculum with:
- title: Catchy, descriptive course title
- description: Brief overview of what learners will achieve
- units: Array of learning units, each containing modules
- prerequisites: Array of foundational topics learners should know
- concepts: Core concepts with prerequisites and difficulty levels
- estimatedDurationMinutes: Total estimated learning time

Course Structure Rules:
- Design 3-6 units per course
- Each unit should have 2-5 modules
- Include diverse module types: article, video, quiz, flashcard, practice, project
- Progression should be logical: basics -> intermediate -> advanced
- Every module needs: title, description, moduleType, estimatedMinutes
- Design 5-15 core concepts per course

Module Types Available:
- article: Reading content with explanations
- video: Video lesson content
- quiz: Assessment quiz
- flashcard: Flashcard practice
- practice: Hands-on exercises
- project: Capstone project
- case_study: Real-world case analysis
- ai_tutor: AI tutoring session
- mastery_check: Progress assessment
- final_assessment: Final exam

Respond ONLY with a valid JSON object matching this schema:
{
  "title": "string",
  "description": "string",
  "units": [
    {
      "title": "string",
      "description": "string",
      "modules": [
        {
          "title": "string",
          "description": "string",
          "moduleType": "moduleType string",
          "estimatedMinutes": number
        }
      ]
    }
  ],
  "prerequisites": ["array of prerequisite topic strings"],
  "concepts": [
    {
      "name": "string",
      "description": "string",
      "prerequisiteConceptNames": ["array of concept names this depends on"],
      "difficulty": "beginner|intermediate|advanced|expert"
    }
  ],
  "estimatedDurationMinutes": number
}

Output ONLY the JSON object, no additional text.`;

function buildUserPrompt(intent: IntentAnalysis): string {
  return `Design a course based on this intent analysis:

Topic: ${intent.topic}
Difficulty Level: ${intent.level}
Learning Goal: ${intent.goal}
Timeframe: ${intent.timeframe}
Preferred Style: ${intent.courseStyle}
Required Skills: ${intent.requiredSkills.join(", ") || "None specified"}
${intent.additionalContext ? `Additional Context: ${intent.additionalContext}` : ""}

Generate the complete curriculum JSON.`;
}

export async function generateCurriculum(
  intent: IntentAnalysis
): Promise<CurriculumOutput> {
  const messages: MiniMaxMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserPrompt(intent) },
  ];

  const response = await chatCompletion({
    messages,
    temperature: 0.7,
    max_tokens: 8000,
  });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as Partial<CurriculumOutput>;

      // Validate and normalize the response
      return {
        title: parsed.title || `Learn ${intent.topic}`,
        description: parsed.description || intent.goal,
        units: parsed.units || [],
        prerequisites: parsed.prerequisites || [],
        concepts: parsed.concepts || [],
        estimatedDurationMinutes:
          parsed.estimatedDurationMinutes ||
          estimateDuration(intent.timeframe, intent.level),
      };
    }
  } catch (error) {
    console.error("Failed to parse curriculum:", error);
  }

  // Fallback: generate a basic curriculum
  return generateFallbackCurriculum(intent);
}

function estimateDuration(
  timeframe: string,
  level: string
): number {
  const timeframeMap: Record<string, number> = {
    "1 day": 480,
    "2 days": 960,
    "3 days": 1440,
    "1 week": 3360,
    "2 weeks": 6720,
    "3 weeks": 10080,
    "1 month": 13440,
    "2 months": 26880,
    "3 months": 40320,
  };

  const baseMinutes = timeframeMap[timeframe] || 6720; // Default 2 weeks

  const levelMultiplier: Record<string, number> = {
    beginner: 1.0,
    intermediate: 1.2,
    advanced: 1.5,
    expert: 2.0,
  };

  return Math.round(baseMinutes * (levelMultiplier[level] || 1.0));
}

function generateFallbackCurriculum(intent: IntentAnalysis): CurriculumOutput {
  const moduleTypes = ["article", "quiz", "flashcard", "practice"] as const;

  return {
    title: `Learn ${intent.topic}`,
    description: intent.goal,
    units: [
      {
        title: `Introduction to ${intent.topic}`,
        description: "Getting started with the fundamentals",
        modules: [
          {
            title: "What is " + intent.topic + "?",
            description: "Understanding the basics",
            moduleType: "article",
            estimatedMinutes: 15,
          },
          {
            title: "Quick Quiz",
            description: "Test your understanding",
            moduleType: "quiz",
            estimatedMinutes: 10,
          },
        ],
      },
      {
        title: `Core Concepts of ${intent.topic}`,
        description: "Deep dive into key concepts",
        modules: [
          {
            title: "Key Concept 1",
            description: "First important concept",
            moduleType: "article",
            estimatedMinutes: 20,
          },
          {
            title: "Practice Exercise",
            description: "Hands-on practice",
            moduleType: "practice",
            estimatedMinutes: 30,
          },
        ],
      },
      {
        title: `Advanced ${intent.topic}`,
        description: "Taking your skills to the next level",
        modules: [
          {
            title: "Advanced Topic",
            description: "Complex concepts and techniques",
            moduleType: "article",
            estimatedMinutes: 25,
          },
          {
            title: "Final Assessment",
            description: "Test your mastery",
            moduleType: "mastery_check",
            estimatedMinutes: 15,
          },
        ],
      },
    ],
    prerequisites: [],
    concepts: [
      {
        name: intent.topic,
        description: `Fundamental understanding of ${intent.topic}`,
        prerequisiteConceptNames: [],
        difficulty: intent.level,
      },
    ],
    estimatedDurationMinutes: estimateDuration(intent.timeframe, intent.level),
  };
}
