/**
 * Tutor Actions
 * Implements tutor actions: explain simpler, give examples, quiz, practice, flashcards, study next
 */

import { chatCompletion, type MiniMaxMessage } from "@/lib/ai/minimax";
import { buildTutorContext, formatContextForPrompt, type TutorContext } from "./context-builder";

export type TutorAction =
  | "explain_simpler"
  | "give_example"
  | "quiz_me"
  | "create_practice"
  | "make_flashcards"
  | "what_to_study_next"
  | "am_i_ready"
  | "cram_plan"
  | "general_help";

export interface TutorActionResult {
  action: TutorAction;
  response: string;
  suggestedActions?: TutorAction[];
  metadata?: Record<string, unknown>;
}

export interface ExecuteActionOptions {
  userId: string;
  courseId: string;
  lessonId?: string;
  action: TutorAction;
  message?: string;
  context?: TutorContext;
}

// Store for user-question tracking (for unstable concept detection)
const userQuestionStore = new Map<string, { conceptId: string; count: number; questions: string[] }>();

/**
 * Execute a tutor action
 */
export async function executeTutorAction(options: ExecuteActionOptions): Promise<TutorActionResult> {
  const { userId, courseId, lessonId, action, message, context: providedContext } = options;

  // Build context if not provided
  const context = providedContext || await buildTutorContext({
    userId,
    courseId,
    lessonId,
  });

  switch (action) {
    case "explain_simpler":
      return handleExplainSimpler(context, message);
    case "give_example":
      return handleGiveExample(context, message);
    case "quiz_me":
      return handleQuizMe(context, message);
    case "create_practice":
      return handleCreatePractice(context, message);
    case "make_flashcards":
      return handleMakeFlashcards(context, message);
    case "what_to_study_next":
      return handleWhatToStudyNext(context);
    case "am_i_ready":
      return handleAmIReady(context);
    case "cram_plan":
      return handleCramPlan(context);
    default:
      return handleGeneralHelp(context, message);
  }
}

/**
 * Explain a concept in simpler terms
 */
async function handleExplainSimpler(context: TutorContext, message?: string): Promise<TutorActionResult> {
  const topic = message || context.currentLesson?.title || "the current topic";

  const systemPrompt = `You are Kibi, an AI tutor. Explain ${topic} in the simplest possible way.
Use analogies, everyday examples, and avoid jargon.
Keep explanations concise (2-3 paragraphs max).
If the topic was mentioned in the lesson content, base your explanation on that.`;

  const messages: MiniMaxMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Explain "${topic}" in the simplest way possible. I'm a beginner.` },
  ];

  try {
    const response = await chatCompletion({ messages, temperature: 0.7 });
    return {
      action: "explain_simpler",
      response,
      suggestedActions: ["give_example", "quiz_me", "make_flashcards"],
    };
  } catch (error) {
    return {
      action: "explain_simpler",
      response: `Here's a simpler explanation of ${topic}:\n\n${context.currentLesson?.content.substring(0, 500) || "Content not available"}...`,
      suggestedActions: ["give_example", "quiz_me"],
    };
  }
}

/**
 * Give an example of a concept
 */
async function handleGiveExample(context: TutorContext, message?: string): Promise<TutorActionResult> {
  const topic = message || context.currentLesson?.title || "the current topic";

  const systemPrompt = `You are Kibi, an AI tutor. Give a concrete, practical example related to "${topic}".
Make the example relatable and easy to understand.
Include a brief explanation of why this example illustrates the concept well.`;

  const messages: MiniMaxMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Give me an example that illustrates "${topic}".` },
  ];

  try {
    const response = await chatCompletion({ messages, temperature: 0.7 });
    return {
      action: "give_example",
      response,
      suggestedActions: ["explain_simpler", "quiz_me", "create_practice"],
    };
  } catch (error) {
    return {
      action: "give_example",
      response: `Example of ${topic}:\n\nImagine you're building a website and you want a button that changes color when clicked. The button is like a "component" - a reusable piece that you can place anywhere. When something happens (click), it updates its appearance (state change).\n\nThis shows how components encapsulate both appearance and behavior.`,
      suggestedActions: ["explain_simpler", "quiz_me", "create_practice"],
    };
  }
}

/**
 * Generate a quick quiz on the current topic
 */
async function handleQuizMe(context: TutorContext, message?: string): Promise<TutorActionResult> {
  const topic = message || context.currentLesson?.title || "the current topic";

  // Track question for concept stability
  const questionKey = `${context.course.id}:${topic}`;
  const existing = userQuestionStore.get(questionKey) || { conceptId: topic, count: 0, questions: [] };
  existing.count += 1;
  existing.questions.push(`quiz_${Date.now()}`);
  userQuestionStore.set(questionKey, existing);

  const systemPrompt = `You are Kibi, an AI tutor. Generate 3 quick quiz questions about "${topic}".
Questions should test understanding, not just recall.
Format as:
1. [Question text]
   a) option
   b) option
   c) option
   d) option
   Answer: [correct letter]
   Why: [brief explanation]

DO NOT give direct answers - guide them to think it through.`;

  const messages: MiniMaxMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Quiz me on "${topic}".` },
  ];

  try {
    const response = await chatCompletion({ messages, temperature: 0.7 });
    return {
      action: "quiz_me",
      response,
      suggestedActions: ["explain_simpler", "give_example", "create_practice"],
      metadata: {
        topic,
        questionCount: 3,
        questionsTracked: existing.count,
      },
    };
  } catch (error) {
    return {
      action: "quiz_me",
      response: `Quiz on "${topic}":\n\n1. What's a key characteristic of React components?\n   a) They're only used for styling\n   b) They're reusable building blocks\n   c) They must use class syntax\n   d) They can't accept props\n\n2. Why are components important in React?\n   a) They make code run faster\n   b) They enable code reuse and organization\n   c) They're required for styling\n   d) They replace HTML entirely\n\n3. What might happen if you name a component "button" instead of "Button"?\n   a) It would style differently\n   b) React wouldn't recognize it as a component\n   c) Nothing would change\n   d) It would automatically become a form\n\nTake your time with each question! When you're ready, let me know your answers.`,
      suggestedActions: ["explain_simpler", "give_example", "make_flashcards"],
    };
  }
}

/**
 * Create practice questions
 */
async function handleCreatePractice(context: TutorContext, message?: string): Promise<TutorActionResult> {
  const topic = message || context.currentLesson?.title || "the current topic";

  const systemPrompt = `You are Kibi, an AI tutor. Create 5 practice questions or exercises for "${topic}".
Include a mix of:
- Fill in the blank
- True/False with explanation
- Short answer
- Code snippet challenges (if applicable)

Format clearly and provide answers separately at the end.
The exercises should reinforce understanding, not just memory.`;

  const messages: MiniMaxMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Create practice exercises for "${topic}".` },
  ];

  try {
    const response = await chatCompletion({ messages, temperature: 0.7 });
    return {
      action: "create_practice",
      response,
      suggestedActions: ["quiz_me", "make_flashcards", "what_to_study_next"],
    };
  } catch (error) {
    return {
      action: "create_practice",
      response: `Practice exercises for "${topic}":\n\n1. FILL IN THE BLANK:\n   A React _____ is a reusable piece of UI that can contain its own structure and behavior.\n\n2. TRUE OR FALSE:\n   React components must always start with a lowercase letter.\n   _____ (Hint: Think about how React distinguishes components from HTML elements!)\n\n3. SHORT ANSWER:\n   In one sentence, explain why props in React are read-only.\n\n4. CODE CHALLENGE:\n   This component has an error. What is it?\n   \`\`\`jsx\n   function myComponent() {\n     return <h1>Hello!</h1>;\n   }\n   \`\`\`\n\n5. THINK ABOUT IT:\n   If you wanted to create a reusable button that could say different things, would you use props or state? Why?\n\n---\nANSWERS:\n1. component\n2. False - they must start with an UPPERCASE letter\n3. Props flow downward from parent to child, and components should be pure functions\n4. The component name starts with lowercase "myComponent" - it should be "MyComponent"\n5. Props - the text to display should be passed in, not stored in state\n\nHow did you do? Let me know if you want more practice!`,
      suggestedActions: ["quiz_me", "make_flashcards", "what_to_study_next"],
    };
  }
}

/**
 * Create flashcards from current lesson
 */
async function handleMakeFlashcards(context: TutorContext, message?: string): Promise<TutorActionResult> {
  const topic = message || context.currentLesson?.title || "the current topic";
  const keyTakeaways = context.currentLesson?.keyTakeaways || [];

  const systemPrompt = `You are Kibi, an AI tutor. Create 5-8 flashcards for "${topic}".
Each flashcard should have:
- Front: A question or key term
- Back: The answer or definition

Make them clear, concise, and memorable.
Base the flashcards on the key takeaways provided.`;

  const messages: MiniMaxMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Create flashcards for "${topic}". Key takeaways: ${keyTakeaways.join(", ")}` },
  ];

  try {
    const response = await chatCompletion({ messages, temperature: 0.7 });
    return {
      action: "make_flashcards",
      response,
      suggestedActions: ["quiz_me", "create_practice", "what_to_study_next"],
    };
  } catch (error) {
    // Generate basic flashcards from key takeaways
    const flashcards = keyTakeaways.map((takeaway, index) => ({
      front: `Concept ${index + 1}: ${takeaway.split(" ").slice(0, 5).join(" ")}...`,
      back: takeaway,
    }));

    let response = `Flashcards for "${topic}":\n\n`;
    flashcards.forEach((card, index) => {
      response += `**Card ${index + 1}**\n`;
      response += `FRONT: ${card.front}\n`;
      response += `BACK: ${card.back}\n\n`;
    });

    response += `\nTip: Review these cards regularly using spaced repetition for best retention!`;

    return {
      action: "make_flashcards",
      response,
      suggestedActions: ["quiz_me", "create_practice", "what_to_study_next"],
    };
  }
}

/**
 * Recommend what to study next
 */
async function handleWhatToStudyNext(context: TutorContext): Promise<TutorActionResult> {
  const systemPrompt = `You are Kibi, an AI tutor. Based on the student's progress, recommend what to study next.

Course: ${context.course.title}
Progress: ${context.progress.overallProgress}%
Mastery: ${context.progress.overallMastery}%

Weak areas: ${context.concepts.weak.map(w => w.name).join(", ") || "None identified"}
Strong areas: ${context.concepts.strong.map(s => s.name).join(", ") || "Building up"}

Provide a clear, prioritized recommendation with reasoning.`;

  const messages: MiniMaxMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: "What should I study next?" },
  ];

  try {
    const response = await chatCompletion({ messages, temperature: 0.7 });
    return {
      action: "what_to_study_next",
      response,
      suggestedActions: ["explain_simpler", "quiz_me", "create_practice"],
    };
  } catch (error) {
    let recommendation = `Based on your progress:\n\n`;

    if (context.progress.overallMastery < 50) {
      recommendation += `1. **Review Fundamentals** - Your mastery is still developing. I'd recommend reviewing the key concepts before moving forward.\n\n`;
    }

    if (context.concepts.weak.length > 0) {
      recommendation += `2. **Focus on Weak Areas** - You mentioned struggling with: ${context.concepts.weak.map(w => w.name).join(", ")}. Let's practice these more.\n\n`;
    }

    recommendation += `3. **Next Unit Preview** - You're at ${context.progress.overallProgress}% progress. The next unit will build on what you've learned.\n\n`;
    recommendation += `4. **Quiz Time** - Testing your knowledge helps reinforce learning. Try a quiz when you feel ready!`;

    return {
      action: "what_to_study_next",
      response: recommendation,
      suggestedActions: ["explain_simpler", "quiz_me", "create_practice", "am_i_ready"],
    };
  }
}

/**
 * Check if user is ready for next unit
 */
async function handleAmIReady(context: TutorContext): Promise<TutorActionResult> {
  const requiredMastery = 70; // Would come from unit unlock rules
  const currentMastery = context.progress.overallMastery;

  const systemPrompt = `You are Kibi, an AI tutor. Evaluate if the student is ready for the next unit.

Current mastery: ${currentMastery}%
Required mastery: ${requiredMastery}%

Consider:
- Overall progress percentage
- Quiz scores: ${context.quizScores.averageScore}%
- Weak concepts: ${context.concepts.weak.map(w => w.name).join(", ") || "None"}

Provide encouragement and specific recommendations if not ready yet.`;

  const messages: MiniMaxMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: "Am I ready for the next unit?" },
  ];

  try {
    const response = await chatCompletion({ messages, temperature: 0.7 });
    return {
      action: "am_i_ready",
      response,
      suggestedActions: ["what_to_study_next", "quiz_me", "create_practice"],
      metadata: { currentMastery, requiredMastery },
    };
  } catch (error) {
    const isReady = currentMastery >= requiredMastery;

    let response = isReady
      ? `**You're ready!** Your mastery score of ${currentMastery}% meets the ${requiredMastery}% threshold for the next unit.\n\n`
      : `**Not quite ready yet.** Your current mastery is ${currentMastery}%, but the next unit requires ${requiredMastery}% mastery.\n\n`;

    response += `Here's where you stand:\n`;
    response += `- Overall mastery: ${currentMastery}%\n`;
    response += `- Quiz average: ${context.quizScores.averageScore.toFixed(1)}%\n`;
    response += `- Progress: ${context.progress.overallProgress}%\n\n`;

    if (!isReady) {
      response += `To prepare for the next unit:\n`;
      response += `1. Review the key takeaways from this unit\n`;
      response += `2. Practice with weak concepts\n`;
      response += `3. Take a quiz to test your knowledge\n`;
    } else {
      response += `You're doing great! Consider:\n`;
      response += `- Taking a mastery check quiz\n`;
      response += `- Reviewing weak areas one more time\n`;
      response += `- Moving forward when you feel confident\n`;
    }

    return {
      action: "am_i_ready",
      response,
      suggestedActions: ["what_to_study_next", "quiz_me", "create_practice"],
      metadata: { currentMastery, requiredMastery, isReady },
    };
  }
}

/**
 * Create a cram plan for quick review
 */
async function handleCramPlan(context: TutorContext): Promise<TutorActionResult> {
  const systemPrompt = `You are Kibi, an AI tutor. Create a cram/review plan for the course "${context.course.title}".

Consider:
- Current mastery: ${context.progress.overallMastery}%
- Weak concepts: ${context.concepts.weak.map(w => w.name).join(", ") || "None"}
- Time available (assume 30 minutes unless specified)

Create a focused review plan that maximizes retention in limited time.
Prioritize weak areas and key concepts.`;

  const messages: MiniMaxMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: "Create a cram plan for quick review." },
  ];

  try {
    const response = await chatCompletion({ messages, temperature: 0.7 });
    return {
      action: "cram_plan",
      response,
      suggestedActions: ["quiz_me", "make_flashcards", "what_to_study_next"],
    };
  } catch (error) {
    let plan = `**Quick Review Plan (30 minutes)**\n\n`;

    plan += `**Phase 1: Warm Up (5 min)**\n`;
    plan += `- Skim key takeaways from current lesson\n`;
    plan += `- Review any weak concept definitions\n\n`;

    plan += `**Phase 2: Active Recall (15 min)**\n`;
    plan += `- Quiz yourself on core concepts\n`;
    plan += `- Explain concepts out loud (teach yourself)\n`;
    plan += `- Focus on: ${context.concepts.weak.slice(0, 2).map(w => w.name).join(", ") || "main topics"}\n\n`;

    plan += `**Phase 3: Reinforce (10 min)**\n`;
    plan += `- Create quick flashcards for anything you struggled with\n`;
    plan += `- Review answers to recent quiz questions\n`;
    plan += `- Visualize how concepts connect\n\n`;

    plan += `**Tips:**\n`;
    plan += `- Take short breaks between phases\n`;
    plan += `- Stay hydrated!\n`;
    plan += `- Focus on understanding, not memorization\n`;

    return {
      action: "cram_plan",
      response: plan,
      suggestedActions: ["quiz_me", "make_flashcards", "explain_simpler"],
    };
  }
}

/**
 * General help handler
 */
async function handleGeneralHelp(context: TutorContext, message?: string): Promise<TutorActionResult> {
  const userMessage = message || "I need help";

  const formattedContext = formatContextForPrompt(context);

  const systemPrompt = `You are Kibi, an AI tutor. You are helpful, encouraging, and use Socratic questioning.

${formattedContext}

Guidelines:
- Help them understand, don't give direct answers to quiz questions
- Ask guiding questions to lead them to discoveries
- Break complex topics into smaller pieces
- Celebrate their progress and effort
- Suggest relevant actions when appropriate (quiz, practice, flashcards, etc.)`;

  const messages: MiniMaxMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  try {
    const response = await chatCompletion({ messages, temperature: 0.7 });
    return {
      action: "general_help",
      response,
      suggestedActions: ["explain_simpler", "give_example", "quiz_me", "what_to_study_next"],
    };
  } catch (error) {
    return {
      action: "general_help",
      response: `I'm here to help you learn! Based on what you've been studying, let me know if you'd like:\n\n- A simpler explanation of something\n- More examples to illustrate a concept\n- A quick quiz to test your knowledge\n- Practice exercises\n- Flashcards for review\n- Advice on what to study next\n\nWhat would be most helpful right now?`,
      suggestedActions: ["explain_simpler", "quiz_me", "what_to_study_next"],
    };
  }
}

/**
 * Detect if a concept is becoming unstable (user asking many questions)
 */
export function detectUnstableConcept(courseId: string, conceptId: string): {
  isUnstable: boolean;
  questionCount: number;
  severity: "low" | "medium" | "high";
} {
  const key = `${courseId}:${conceptId}`;
  const data = userQuestionStore.get(key);

  if (!data) {
    return { isUnstable: false, questionCount: 0, severity: "low" };
  }

  const questionCount = data.count;
  const isUnstable = questionCount >= 3;
  const severity = questionCount >= 5 ? "high" : questionCount >= 3 ? "medium" : "low";

  return { isUnstable, questionCount, severity };
}

/**
 * Record a question for tracking concept stability
 */
export function recordQuestion(courseId: string, conceptId: string, question: string): void {
  const key = `${courseId}:${conceptId}`;
  const existing = userQuestionStore.get(key) || { conceptId, count: 0, questions: [] };
  existing.count += 1;
  existing.questions.push(question);
  userQuestionStore.set(key, existing);
}

/**
 * Get quick action buttons config
 */
export function getQuickActions(): { action: TutorAction; label: string; icon: string; description: string }[] {
  return [
    { action: "explain_simpler", label: "Explain Simpler", icon: "📖", description: "Get a simpler explanation" },
    { action: "give_example", label: "Give Me an Example", icon: "💡", description: "See a practical example" },
    { action: "quiz_me", label: "Quiz Me", icon: "❓", description: "Test your knowledge" },
    { action: "create_practice", label: "More Practice", icon: "✏️", description: "Get practice exercises" },
    { action: "make_flashcards", label: "Flashcards", icon: "🗂️", description: "Create study cards" },
    { action: "what_to_study_next", label: "What's Next?", icon: "🎯", description: "Get study recommendations" },
    { action: "am_i_ready", label: "Am I Ready?", icon: "✅", description: "Check unit readiness" },
    { action: "cram_plan", label: "Cram Plan", icon: "📚", description: "Quick review plan" },
  ];
}
