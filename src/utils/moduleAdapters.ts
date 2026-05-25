
import { CourseModule } from '@/types/course';
import { QuizModule as CourseQuizModule } from '@/types/modules/interactive';
import { 
  QuizModule as ComponentQuizModule,
  QuizQuestion as ComponentQuizQuestion,
  MultipleChoiceQuestion,
  TrueFalseQuestion, 
  FillBlankQuestion,
  MatchTermsQuestion,
  ReflectionQuestion 
} from '@/types/quiz';

/**
 * Adapts a course quiz question to a component quiz question format
 */
export function adaptQuizQuestion(question: any): ComponentQuizQuestion {
  // Default to multiple choice if no type is specified
  const questionType = question.type || "multiple_choice";
  
  // Create a base question with required fields for the component
  const baseQuestion: Partial<ComponentQuizQuestion> = {
    id: question.id || `q-${Math.random().toString(36).substr(2, 9)}`,
    question_text: question.question || question.prompt || question.text || "",
    type: questionType,
  };
  
  // Adapt based on question type
  switch (questionType) {
    case "multiple_choice":
      return {
        ...baseQuestion,
        type: "multiple_choice",
        options: question.options || [],
        correct_option: question.correctAnswer !== undefined ? 
          question.options?.[question.correctAnswer] : question.correctOption || "",
        explanation: question.explanation || "",
      } as MultipleChoiceQuestion;
      
    case "true_false":
      return {
        ...baseQuestion,
        type: "true_false",
        answer: question.answer || false,
        explanation: question.explanation || "",
      } as TrueFalseQuestion;
      
    case "fill_blank":
      return {
        ...baseQuestion,
        type: "fill_blank",
        answer: question.answer || "",
        alternatives: question.alternatives || [],
        explanation: question.explanation || "",
      } as FillBlankQuestion;
      
    case "match_terms":
      return {
        ...baseQuestion,
        type: "match_terms",
        pairs: question.pairs || {},
        explanation: question.explanation || "",
      } as MatchTermsQuestion;
      
    case "reflection":
      return {
        ...baseQuestion,
        type: "reflection",
        expected_elements: question.expected_elements || [],
      } as ReflectionQuestion;
      
    default:
      // Default to multiple choice for unknown types
      return {
        ...baseQuestion,
        type: "multiple_choice",
        options: question.options || [],
        correct_option: question.correctOption || "",
        explanation: question.explanation || "",
      } as MultipleChoiceQuestion;
  }
}

/**
 * Adapts a course quiz module to the format expected by the quiz component
 */
export function adaptQuizModuleForComponent(module: CourseModule): ComponentQuizModule {
  // Get questions from different possible sources in the module
  let questions: any[] = [];
  
  if ('questions' in module && Array.isArray(module.questions)) {
    questions = module.questions;
  } else if ('content_json' in module && 
             module.content_json && 
             'questions' in module.content_json && 
             Array.isArray(module.content_json.questions)) {
    questions = module.content_json.questions;
  }
  
  // Convert course question format to component question format
  const adaptedQuestions = questions.map(adaptQuizQuestion);
  
  // Return module in the format expected by the component
  return {
    id: module.id || `quiz-${Math.random().toString(36).substr(2, 9)}`,
    title: module.title,
    questions: adaptedQuestions
  };
}
