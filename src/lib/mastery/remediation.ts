/**
 * Adaptive Remediation System
 * Generates personalized content when users struggle or fail
 */

export type RemediationType =
  | "simpler_explanation"
  | "additional_flashcards"
  | "more_practice"
  | "review_lesson"
  | "visual_example"
  | "step_by_step_guide"
  | "analogy_explanation"
  | "tutor_session";

export interface RemediationItem {
  id: string;
  type: RemediationType;
  title: string;
  content: string;
  estimatedMinutes: number;
  difficulty: "easier" | "same" | "harder";
}

export interface RemediationPlan {
  conceptId: string;
  conceptName: string;
  currentMastery: number;
  triggerEvent: "quiz_fail" | "low_confidence" | "repeated_error" | "time_warning" | "struggle";
  items: RemediationItem[];
  totalEstimatedMinutes: number;
  priority: number;
  createdAt: string;
}

export interface RemediationConfig {
  minMasteryForAdvanced: number;  // 85 - Can skip remediation
  maxRemediationItems: number;    // 5 - Max items per plan
  includeReviewThreshold: number; // 60 - Include review lesson below this
  easyDifficulty: number;         // 0.7 - Difficulty multiplier for easier content
}

const DEFAULT_CONFIG: RemediationConfig = {
  minMasteryForAdvanced: 85,
  maxRemediationItems: 5,
  includeReviewThreshold: 60,
  easyDifficulty: 0.7,
};

// In-memory remediation history
const remediationHistoryStore = new Map<string, RemediationPlan[]>();

export const remediationSystem = {
  /**
   * Generate a remediation plan based on struggle indicators
   */
  generatePlan(
    conceptId: string,
    conceptName: string,
    currentMastery: number,
    triggerEvent: RemediationPlan["triggerEvent"],
    userId: string,
    config: Partial<RemediationConfig> = {}
  ): RemediationPlan {
    const fullConfig = { ...DEFAULT_CONFIG, ...config };
    const items: RemediationItem[] = [];
    const now = new Date().toISOString();

    // Skip if mastery is already high
    if (currentMastery >= fullConfig.minMasteryForAdvanced && triggerEvent !== "repeated_error") {
      return {
        conceptId,
        conceptName,
        currentMastery,
        triggerEvent,
        items: [],
        totalEstimatedMinutes: 0,
        priority: 0,
        createdAt: now,
      };
    }

    // Determine remediation strategy based on trigger
    switch (triggerEvent) {
      case "quiz_fail":
        // Failed quiz - needs simpler content and practice
        items.push(this.createSimplerExplanation(conceptName, currentMastery));
        items.push(this.createStepByStepGuide(conceptName));
        items.push(this.createAdditionalFlashcards(conceptId, conceptName));
        items.push(this.createMorePractice(conceptName));
        break;

      case "low_confidence":
        // Low confidence but correct - needs reinforcement
        items.push(this.createAnalogyExplanation(conceptName));
        items.push(this.createAdditionalFlashcards(conceptId, conceptName));
        items.push(this.createVisualExample(conceptName));
        break;

      case "repeated_error":
        // Same error multiple times - needs fundamental review
        items.push(this.createSimplerExplanation(conceptName, currentMastery));
        items.push(this.createReviewLesson(conceptName));
        items.push(this.createStepByStepGuide(conceptName));
        items.push(this.createMorePractice(conceptName));
        items.push(this.createTutorSession(conceptName));
        break;

      case "time_warning":
        // Took too long - needs efficiency tips
        items.push(this.createSimplerExplanation(conceptName, currentMastery));
        items.push(this.createKeyPointsSummary(conceptName));
        break;

      case "struggle":
        // General struggle - comprehensive approach
        items.push(this.createSimplerExplanation(conceptName, currentMastery));
        items.push(this.createVisualExample(conceptName));
        items.push(this.createAdditionalFlashcards(conceptId, conceptName));
        if (currentMastery < fullConfig.includeReviewThreshold) {
          items.push(this.createReviewLesson(conceptName));
        }
        break;
    }

    // Limit items
    const limitedItems = items.slice(0, fullConfig.maxRemediationItems);

    // Calculate priority (higher mastery gap = higher priority)
    const priority = Math.min(100, Math.round((100 - currentMastery) * 1.2));

    const plan: RemediationPlan = {
      conceptId,
      conceptName,
      currentMastery,
      triggerEvent,
      items: limitedItems,
      totalEstimatedMinutes: limitedItems.reduce((sum, item) => sum + item.estimatedMinutes, 0),
      priority,
      createdAt: now,
    };

    // Store in history
    this.addToHistory(userId, plan);

    return plan;
  },

  /**
   * Create a simpler explanation remediation item
   */
  createSimplerExplanation(conceptName: string, currentMastery: number): RemediationItem {
    return {
      id: crypto.randomUUID(),
      type: "simpler_explanation",
      title: `Understanding ${conceptName} (Simplified)`,
      content: this.generateSimplifiedContent(conceptName, currentMastery),
      estimatedMinutes: 10,
      difficulty: "easier",
    };
  },

  /**
   * Create step-by-step guide
   */
  createStepByStepGuide(conceptName: string): RemediationItem {
    return {
      id: crypto.randomUUID(),
      type: "step_by_step_guide",
      title: `${conceptName}: Step-by-Step`,
      content: this.generateStepByStepContent(conceptName),
      estimatedMinutes: 15,
      difficulty: "easier",
    };
  },

  /**
   * Create additional flashcards
   */
  createAdditionalFlashcards(conceptId: string, conceptName: string): RemediationItem {
    return {
      id: crypto.randomUUID(),
      type: "additional_flashcards",
      title: `${conceptName} - Practice Cards`,
      content: this.generateFlashcardContent(conceptName),
      estimatedMinutes: 5,
      difficulty: "same",
    };
  },

  /**
   * Create more practice questions
   */
  createMorePractice(conceptName: string): RemediationItem {
    return {
      id: crypto.randomUUID(),
      type: "more_practice",
      title: `${conceptName} - Extra Practice`,
      content: this.generatePracticeContent(conceptName),
      estimatedMinutes: 15,
      difficulty: "easier",
    };
  },

  /**
   * Create visual example
   */
  createVisualExample(conceptName: string): RemediationItem {
    return {
      id: crypto.randomUUID(),
      type: "visual_example",
      title: `${conceptName} - Visual Guide`,
      content: `## Visual Representation of ${conceptName}\n\n[Interactive diagram placeholder]\n\n### Key Points:\n- Use diagrams to understand relationships\n- Color-code different components\n- Practice drawing the structure`,
      estimatedMinutes: 10,
      difficulty: "easier",
    };
  },

  /**
   * Create review lesson
   */
  createReviewLesson(conceptName: string): RemediationItem {
    return {
      id: crypto.randomUUID(),
      type: "review_lesson",
      title: `Review: ${conceptName}`,
      content: this.generateReviewContent(conceptName),
      estimatedMinutes: 20,
      difficulty: "same",
    };
  },

  /**
   * Create analogy explanation
   */
  createAnalogyExplanation(conceptName: string): RemediationItem {
    return {
      id: crypto.randomUUID(),
      type: "analogy_explanation",
      title: `${conceptName} - Analogy Explained`,
      content: this.generateAnalogyContent(conceptName),
      estimatedMinutes: 8,
      difficulty: "easier",
    };
  },

  /**
   * Create tutor session
   */
  createTutorSession(conceptName: string): RemediationItem {
    return {
      id: crypto.randomUUID(),
      type: "tutor_session",
      title: `AI Tutor: ${conceptName}`,
      content: `## Personal Tutor Session for ${conceptName}\n\nLet's break this down together. The AI tutor will:\n1. Assess your current understanding\n2. Identify gaps in knowledge\n3. Provide personalized explanations\n4. Answer your specific questions\n\n[Start AI Tutor Session]`,
      estimatedMinutes: 15,
      difficulty: "same",
    };
  },

  /**
   * Create key points summary
   */
  createKeyPointsSummary(conceptName: string): RemediationItem {
    return {
      id: crypto.randomUUID(),
      type: "simpler_explanation",
      title: `${conceptName} - Quick Summary`,
      content: `## Quick Summary: ${conceptName}\n\n**Core Ideas:**\n1. Key point one\n2. Key point two\n3. Key point three\n\n**Remember:** Focus on the main concept before diving into details.`,
      estimatedMinutes: 5,
      difficulty: "easier",
    };
  },

  // Helper methods to generate content (simplified versions)
  generateSimplifiedContent(conceptName: string, mastery: number): string {
    const complexity = mastery > 50 ? "intermediate" : "basic";
    return `## ${conceptName} - ${complexity} Explanation

### What is ${conceptName}?
[Simplified definition appropriate for ${complexity} level]

### Why it Matters
[Real-world application or importance]

### Key Takeaway
[The single most important thing to remember about ${conceptName}]
`;
  },

  generateStepByStepContent(conceptName: string): string {
    return `## Step-by-Step Guide to ${conceptName}

### Step 1: Introduction
[Start with the basics]

### Step 2: Core Concept
[Main idea explained simply]

### Step 3: Application
[How to use this in practice]

### Step 4: Common Mistakes
[What to avoid]

### Step 5: Quick Check
[Verify understanding]
`;
  },

  generateFlashcardContent(conceptName: string): string {
    return `## Practice Flashcards for ${conceptName}

**Card 1:** What is the definition of ${conceptName}?
- Front: Definition
- Back: [Definition placeholder]

**Card 2:** What are the key characteristics of ${conceptName}?
- Front: Characteristics
- Back: [List characteristics]

**Card 3:** How does ${conceptName} relate to [related concept]?
- Front: Relationship
- Back: [Explanation]
`;
  },

  generatePracticeContent(conceptName: string): string {
    return `## Extra Practice: ${conceptName}

### Exercise 1
[Practice question at easier difficulty]

### Exercise 2
[Practice question with hint]

### Exercise 3
[Practice question applying concept]

### Answer Key
[Solutions with explanations]
`;
  },

  generateReviewContent(conceptName: string): string {
    return `## Review: ${conceptName}

### Previously Covered
[What you learned before]

### Now Learning
[Current focus areas]

### Learning Objectives
- [ ] Objective 1
- [ ] Objective 2
- [ ] Objective 3

### Practice Activities
[Interactive exercises]
`;
  },

  generateAnalogyContent(conceptName: string): string {
    return `## ${conceptName} Explained Through Analogy

### The Analogy
Think of ${conceptName} like [familiar concept or situation]

### How It Compares
| Real World | ${conceptName} |
|------------|---------------|
| [Item 1]  | [Concept 1]  |
| [Item 2]  | [Concept 2]  |

### Why This Helps
[Explanation of why the analogy works]
`;
  },

  /**
   * Add plan to user's remediation history
   */
  addToHistory(userId: string, plan: RemediationPlan): void {
    const history = remediationHistoryStore.get(userId) || [];
    history.unshift(plan); // Add to beginning
    // Keep last 20 plans
    if (history.length > 20) {
      history.pop();
    }
    remediationHistoryStore.set(userId, history);
  },

  /**
   * Get user's remediation history
   */
  getHistory(userId: string): RemediationPlan[] {
    return remediationHistoryStore.get(userId) || [];
  },

  /**
   * Get remediation for a concept from history
   */
  getRemediationForConcept(userId: string, conceptId: string): RemediationPlan | null {
    const history = this.getHistory(userId);
    return history.find(p => p.conceptId === conceptId) || null;
  },

  /**
   * Mark remediation item as completed
   */
  markItemCompleted(_userId: string, _planId: string, _itemId: string): void {
    // In production, update database
    // For now, just a placeholder
  },

  /**
   * Get config
   */
  getConfig(): RemediationConfig {
    return { ...DEFAULT_CONFIG };
  },

  /**
   * Update config
   */
  updateConfig(updates: Partial<RemediationConfig>): RemediationConfig {
    Object.assign(DEFAULT_CONFIG, updates);
    return { ...DEFAULT_CONFIG };
  },
};
