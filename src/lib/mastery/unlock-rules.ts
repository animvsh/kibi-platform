/**
 * Unit Unlock Rules
 * Enforces that users must meet mastery requirements before accessing units
 */

import type { CourseUnit, UserConceptMastery } from "@/types";
import { conceptGraph } from "./concept-graph";
import { masteryCalculator } from "./calculator";

export interface UnlockCheckResult {
  unitId: string;
  isUnlocked: boolean;
  canTakeMasteryCheck: boolean;
  averageConceptMastery: number;
  criticalConceptsBelow75: string[];
  requiredConceptsBelow85: string[];
  masteryCheckScore?: number;
  missingPrerequisites: string[];
  completedRequiredActivities: boolean;
  blockingReason?: string;
  remediationPath?: RemediationStep[];
}

export interface RemediationStep {
  type: "review_lesson" | "practice_quiz" | "review_concept" | "watch_video" | "flashcard_review";
  conceptId?: string;
  lessonId?: string;
  quizId?: string;
  estimatedMinutes: number;
  priority: number; // 1 = highest
}

export interface UnitUnlockConfig {
  requiredAverageMastery: number;     // Default: 85
  criticalConceptMinimum: number;      // Default: 75
  masteryCheckPassingScore: number;    // Default: 80
  requireActivitiesCompletion: boolean; // Default: true
}

// Default configuration
const DEFAULT_CONFIG: UnitUnlockConfig = {
  requiredAverageMastery: 85,
  criticalConceptMinimum: 75,
  masteryCheckPassingScore: 80,
  requireActivitiesCompletion: true,
};

// In-memory mastery storage
const userConceptMasteryStore = new Map<string, UserConceptMastery>();
const unitMasteryChecksStore = new Map<string, { score: number; passedAt: string }>();

export const unlockRules = {
  /**
   * Check if a unit is unlocked for a user
   * Atomic check - all conditions must be met
   */
  async checkUnlock(
    unitId: string,
    userId: string,
    courseId: string,
    unit: CourseUnit,
    config: Partial<UnitUnlockConfig> = {}
  ): Promise<UnlockCheckResult> {
    const fullConfig = { ...DEFAULT_CONFIG, ...config };

    // Get all concepts required for this unit
    const requiredConcepts = await this.getUnitRequiredConcepts(unitId, courseId);

    if (requiredConcepts.length === 0) {
      // No requirements means unit is always unlocked
      return {
        unitId,
        isUnlocked: true,
        canTakeMasteryCheck: true,
        averageConceptMastery: 0,
        criticalConceptsBelow75: [],
        requiredConceptsBelow85: [],
        missingPrerequisites: [],
        completedRequiredActivities: true,
      };
    }

    // Get user's mastery for each required concept
    const conceptMasteries: UserConceptMastery[] = [];
    for (const conceptId of requiredConcepts) {
      const mastery = await this.getUserConceptMastery(userId, conceptId);
      conceptMasteries.push(mastery);
    }

    // Calculate average mastery
    const totalMastery = conceptMasteries.reduce((sum, m) => sum + m.masteryScore, 0);
    const averageMastery = Math.round(totalMastery / conceptMasteries.length);

    // Find critical concepts (core) below minimum
    const criticalBelow75 = conceptMasteries
      .filter(m => {
        // Note: In production, would check concept.isCore here
        return m.masteryScore < fullConfig.criticalConceptMinimum;
      })
      .map(m => m.conceptId);

    // Find required concepts below average threshold
    const requiredBelow85 = conceptMasteries
      .filter(m => m.masteryScore < fullConfig.requiredAverageMastery)
      .map(m => m.conceptId);

    // Check prerequisites completion
    const missingPrereqs = await this.checkPrerequisites(unit, userId, courseId);

    // Check if mastery check was passed
    const masteryCheck = unitMasteryChecksStore.get(`${userId}:${unitId}`);
    const canTakeMasteryCheck = averageMastery >= fullConfig.requiredAverageMastery &&
      criticalBelow75.length === 0;

    // Determine if unlocked
    const isUnlocked =
      averageMastery >= fullConfig.requiredAverageMastery &&
      criticalBelow75.length === 0 &&
      missingPrereqs.length === 0 &&
      (!fullConfig.requireActivitiesCompletion || true); // Activity check would go here

    let blockingReason: string | undefined;
    if (!isUnlocked) {
      if (averageMastery < fullConfig.requiredAverageMastery) {
        blockingReason = `Average concept mastery (${averageMastery}) is below required (${fullConfig.requiredAverageMastery})`;
      } else if (criticalBelow75.length > 0) {
        blockingReason = `${criticalBelow75.length} critical concept(s) below minimum mastery`;
      } else if (missingPrereqs.length > 0) {
        blockingReason = `Missing prerequisite units: ${missingPrereqs.join(", ")}`;
      }
    }

    // Generate remediation path if locked
    let remediationPath: RemediationStep[] | undefined;
    if (!isUnlocked) {
      remediationPath = await this.generateRemediationPath(
        unitId,
        userId,
        courseId,
        conceptMasteries,
        fullConfig
      );
    }

    return {
      unitId,
      isUnlocked,
      canTakeMasteryCheck,
      averageConceptMastery: averageMastery,
      criticalConceptsBelow75: criticalBelow75,
      requiredConceptsBelow85: requiredBelow85,
      masteryCheckScore: masteryCheck?.score,
      missingPrerequisites: missingPrereqs,
      completedRequiredActivities: true,
      blockingReason,
      remediationPath,
    };
  },

  /**
   * Record a mastery check result
   */
  async recordMasteryCheck(
    userId: string,
    unitId: string,
    score: number
  ): Promise<{ passed: boolean; newUnlockStatus?: UnlockCheckResult }> {
    const now = new Date().toISOString();
    const passingScore = DEFAULT_CONFIG.masteryCheckPassingScore;
    const passed = score >= passingScore;

    unitMasteryChecksStore.set(`${userId}:${unitId}`, { score, passedAt: now });

    return { passed };
  },

  /**
   * Get user mastery for a specific concept
   */
  async getUserConceptMastery(
    userId: string,
    conceptId: string
  ): Promise<UserConceptMastery> {
    const key = `${userId}:${conceptId}`;
    const existing = userConceptMasteryStore.get(key);

    if (existing) return existing;

    // Return default mastery (not learned)
    return {
      id: crypto.randomUUID(),
      userId,
      courseId: "", // Would be set properly in production
      conceptId,
      masteryScore: 0,
      confidenceScore: 0,
      lastPracticedAt: new Date().toISOString(),
      nextReviewAt: new Date().toISOString(),
      learningSpeed: 1.0,
      status: "not_learned",
    };
  },

  /**
   * Update user concept mastery
   */
  async updateConceptMastery(
    userId: string,
    courseId: string,
    conceptId: string,
    newScore: number,
    confidence?: number
  ): Promise<UserConceptMastery> {
    const key = `${userId}:${conceptId}`;
    const now = new Date().toISOString();

    const existing = userConceptMasteryStore.get(key);

    const updated: UserConceptMastery = {
      id: existing?.id || crypto.randomUUID(),
      userId,
      courseId,
      conceptId,
      masteryScore: newScore,
      confidenceScore: confidence ?? existing?.confidenceScore ?? 50,
      lastPracticedAt: now,
      nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Placeholder
      learningSpeed: existing?.learningSpeed ?? 1.0,
      status: masteryCalculator.getStatus(newScore),
    };

    userConceptMasteryStore.set(key, updated);
    return updated;
  },

  /**
   * Get concepts required for a unit
   */
  async getUnitRequiredConcepts(unitId: string, courseId: string): Promise<string[]> {
    // In production, this would query the database
    // For now, return empty array (no required concepts)
    return [];
  },

  /**
   * Check if prerequisites are met
   */
  async checkPrerequisites(
    unit: CourseUnit,
    userId: string,
    courseId: string
  ): Promise<string[]> {
    // In production, check if previous units are completed
    return [];
  },

  /**
   * Generate remediation path for locked unit
   */
  async generateRemediationPath(
    unitId: string,
    userId: string,
    courseId: string,
    conceptMasteries: UserConceptMastery[],
    config: UnitUnlockConfig
  ): Promise<RemediationStep[]> {
    const steps: RemediationStep[] = [];

    // Sort by priority (lowest mastery = highest priority)
    const sortedMasteries = [...conceptMasteries]
      .filter(m => m.masteryScore < config.requiredAverageMastery)
      .sort((a, b) => a.masteryScore - b.masteryScore);

    for (const mastery of sortedMasteries) {
      const concept = await conceptGraph.getConcept(mastery.conceptId);

      if (concept) {
        // Add concept review step
        steps.push({
          type: "review_concept",
          conceptId: mastery.conceptId,
          estimatedMinutes: 10,
          priority: Math.round(100 - mastery.masteryScore),
        });

        // If very low mastery, add practice quiz
        if (mastery.masteryScore < 50) {
          steps.push({
            type: "practice_quiz",
            conceptId: mastery.conceptId,
            estimatedMinutes: 15,
            priority: Math.round(90 - mastery.masteryScore),
          });
        }

        // If critical (below 75), add flashcard review
        if (mastery.masteryScore < config.criticalConceptMinimum) {
          steps.push({
            type: "flashcard_review",
            conceptId: mastery.conceptId,
            estimatedMinutes: 5,
            priority: Math.round(85 - mastery.masteryScore),
          });
        }
      }
    }

    // Sort by priority
    return steps.sort((a, b) => b.priority - a.priority);
  },

  /**
   * Get all locked units for a user
   */
  async getLockedUnits(
    userId: string,
    courseId: string,
    units: CourseUnit[]
  ): Promise<UnlockCheckResult[]> {
    const results: UnlockCheckResult[] = [];

    for (const unit of units) {
      const result = await this.checkUnlock(unit.id, userId, courseId, unit);
      if (!result.isUnlocked) {
        results.push(result);
      }
    }

    return results;
  },

  /**
   * Get the configuration for unlock rules
   */
  getConfig(): UnitUnlockConfig {
    return { ...DEFAULT_CONFIG };
  },

  /**
   * Update unlock configuration
   */
  updateConfig(updates: Partial<UnitUnlockConfig>): UnitUnlockConfig {
    Object.assign(DEFAULT_CONFIG, updates);
    return { ...DEFAULT_CONFIG };
  },
};
