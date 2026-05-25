
import { useState } from 'react';
import type { UserResponse } from './useQuizModuleState';
import type { QuizModule } from '@/types/quiz';

/**
 * Hook for managing quiz retry functionality
 */
export function useRetryQuiz(userResponses: UserResponse[]) {
  const [generatedRetryQuiz, setGeneratedRetryQuiz] = useState<any | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  /**
   * Generate a new quiz focused on incorrectly answered questions
   */
  const generateRetryQuiz = async (module: QuizModule) => {
    try {
      // Filter out incorrect responses
      const incorrectResponses = userResponses.filter(r => !r.isCorrect);
      
      if (incorrectResponses.length === 0) {
        console.error("No incorrect responses to retry");
        return;
      }

      // Create a simplified retry quiz from the incorrect questions
      const incorrectQuestionIds = incorrectResponses.map(r => r.questionId);
      const incorrectQuestions = module.questions
        .filter(q => incorrectQuestionIds.includes(q.id));

      // Generate a new module with just the incorrect questions
      const retryQuiz = {
        module: {
          id: `retry-${module.id}`,
          title: `Retry: ${module.title}`,
          content_json: {
            questions: incorrectQuestions,
          }
        }
      };
      
      setGeneratedRetryQuiz(retryQuiz);
      setIsRetrying(true);
    } catch (error) {
      console.error("Error generating retry quiz:", error);
      setIsRetrying(false);
    }
  };

  return {
    generatedRetryQuiz,
    setGeneratedRetryQuiz,
    isRetrying,
    setIsRetrying,
    generateRetryQuiz,
  };
}
