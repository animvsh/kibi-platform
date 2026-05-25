/**
 * Tutor System
 * Course-aware, progress-aware AI tutor
 */

// Context builder
export {
  buildTutorContext,
  formatContextForPrompt,
  retrieveRelevantContent,
  type TutorContext,
  type BuildContextOptions,
} from "./context-builder";

// Actions
export {
  executeTutorAction,
  getQuickActions,
  detectUnstableConcept,
  recordQuestion,
  type TutorAction,
  type TutorActionResult,
  type ExecuteActionOptions,
} from "./actions";

// Learning updater
export {
  recordTutorInteraction,
  processQuizResponse,
  updateConceptStability,
  generatePracticeRecommendations,
  calculateOverallCourseMastery,
  getLearningStateSummary,
  type LearningUpdateResult,
  type ConceptStabilityUpdate,
} from "./learning-updater";
