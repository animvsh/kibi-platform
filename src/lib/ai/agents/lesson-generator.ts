/**
 * Lesson Generator Agent
 * Creates lesson content with examples, key takeaways, and mini-check questions
 */

import { chatCompletion, type MiniMaxMessage } from "../minimax";
import type { LessonContent, UnitOutline, ModuleOutline } from "@/types/generation";
import type { CourseDifficulty } from "@/types";

const SYSTEM_PROMPT = `You are a Lesson Generator for an AI-powered learning platform called Kibi. Your role is to create engaging, comprehensive lesson content that helps learners understand and apply concepts.

Given a module outline, generate rich lesson content including:
- title: Specific lesson title
- content: Comprehensive markdown content with explanations, definitions, examples
- keyTakeaways: 3-5 bullet points summarizing key learnings
- miniCheckQuestions: 2-3 quick questions to verify understanding
- examples: 1-3 practical examples with explanations

Lesson Content Guidelines:
- Start with clear learning objectives
- Use simple, accessible language appropriate for the difficulty level
- Include real-world applications and examples
- Break complex topics into digestible sections
- Use headers (##, ###) to organize content
- Include code blocks with syntax highlighting for technical topics
- End with a summary of key points

Content should be:
- Beginner's: Very accessible, lots of examples, simple language
- Intermediate's: Some technical depth, practical applications
- Advanced's: Deep technical content, edge cases, best practices
- Expert's: Cutting-edge insights, research-level depth, debates

Respond ONLY with a valid JSON object matching this schema:
{
  "title": "string - specific lesson title",
  "content": "string - markdown content with explanations",
  "keyTakeaways": ["array of 3-5 key learning points"],
  "miniCheckQuestions": [
    {
      "question": "string",
      "correctAnswer": "string",
      "explanation": "string"
    }
  ],
  "examples": [
    {
      "title": "string",
      "description": "string",
      "code": "string or null"
    }
  ]
}

Output ONLY the JSON object, no additional text.`;

function buildUserPrompt(
  module: ModuleOutline,
  unitTitle: string,
  courseTitle: string,
  difficulty: CourseDifficulty,
  conceptContext?: string
): string {
  return `Generate lesson content for:

Module: ${module.title}
Module Type: ${module.moduleType}
Description: ${module.description}
Estimated Duration: ${module.estimatedMinutes} minutes
Unit: ${unitTitle}
Course: ${courseTitle}
Difficulty Level: ${difficulty}
${conceptContext ? `Concepts to cover: ${conceptContext}` : ""}

Create comprehensive lesson content as JSON.`;
}

export async function generateLessonContent(
  module: ModuleOutline,
  unitTitle: string,
  courseTitle: string,
  difficulty: CourseDifficulty,
  conceptContext?: string
): Promise<LessonContent> {
  const messages: MiniMaxMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: buildUserPrompt(
        module,
        unitTitle,
        courseTitle,
        difficulty,
        conceptContext
      ),
    },
  ];

  const response = await chatCompletion({
    messages,
    temperature: 0.7,
    max_tokens: 6000,
  });

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as Partial<LessonContent>;

      return {
        title: parsed.title || module.title,
        content:
          parsed.content ||
          generateFallbackContent(module, unitTitle, difficulty),
        keyTakeaways: parsed.keyTakeaways || [],
        miniCheckQuestions: parsed.miniCheckQuestions || [],
        examples: parsed.examples || [],
      };
    }
  } catch (error) {
    console.error("Failed to parse lesson content:", error);
  }

  return generateFallbackLesson(module);
}

function generateFallbackContent(
  moduleOutline: ModuleOutline,
  unitTitle: string,
  difficulty: CourseDifficulty
): string {
  return `# ${moduleOutline.title}

## Overview

${moduleOutline.description}

## Key Concepts

This lesson covers the fundamental aspects of ${moduleOutline.title} as part of ${unitTitle}.

## Detailed Explanation

### Introduction

Understanding ${moduleOutline.title} is essential for mastering the overall subject matter.

### Main Content

The core concepts involve...

### Examples

1. **Example 1**: A basic demonstration of the concept
2. **Example 2**: A more complex application

## Summary

In this lesson, we covered the essential aspects of ${moduleOutline.title}. Key takeaways include understanding the fundamental principles and being able to apply them in practical scenarios.

## Next Steps

Proceed to the practice exercises to reinforce your learning.`;
}

function generateFallbackLesson(moduleOutline: ModuleOutline): LessonContent {
  return {
    title: moduleOutline.title,
    content: generateFallbackContent(
      moduleOutline,
      "General",
      "beginner"
    ),
    keyTakeaways: [
      `Understand the basics of ${moduleOutline.title}`,
      `Apply concepts in practical scenarios`,
      `Build foundation for advanced topics`,
    ],
    miniCheckQuestions: [
      {
        question: `What is the main purpose of ${moduleOutline.title}?`,
        correctAnswer: "To understand and apply the core concept",
        explanation: "This tests basic understanding of the topic",
      },
    ],
    examples: [
      {
        title: "Basic Example",
        description: "A simple demonstration of the concept",
        code: undefined,
      },
    ],
  };
}

export async function generateAllLessons(
  units: UnitOutline[],
  courseTitle: string,
  difficulty: CourseDifficulty
): Promise<Map<string, LessonContent>> {
  const lessonContents = new Map<string, LessonContent>();

  for (const unit of units) {
    for (const moduleItem of unit.modules) {
      const key = `${unit.title}:${moduleItem.title}`;
      const content = await generateLessonContent(
        moduleItem,
        unit.title,
        courseTitle,
        difficulty
      );
      lessonContents.set(key, content);
    }
  }

  return lessonContents;
}
