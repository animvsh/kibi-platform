
import { useState, useMemo } from 'react';
import { CourseModule } from '@/types/course';
import { 
  isArticleModule,
  isLectureModule,
  isQuizModule,
  isFlashcardModule,
  isInteractiveArticleModule
} from '@/utils/moduleTypeGuards';

export const useModuleEnhancement = (module: CourseModule) => {
  return useMemo(() => {
    const enhancedModuleCopy = { ...module };
    
    if (isArticleModule(enhancedModuleCopy) && !enhancedModuleCopy.content) {
      enhancedModuleCopy.content = `This is an article module about ${enhancedModuleCopy.title}. The content for this module is currently being developed.`;
    }
    
    if (isLectureModule(enhancedModuleCopy) && !enhancedModuleCopy.videoId && !enhancedModuleCopy.searchKeyword) {
      enhancedModuleCopy.searchKeyword = `${enhancedModuleCopy.title} tutorial`;
    }
    
    if (isQuizModule(enhancedModuleCopy) && (!enhancedModuleCopy.questions || enhancedModuleCopy.questions.length === 0)) {
      enhancedModuleCopy.questions = [
        {
          question: `Sample question about ${enhancedModuleCopy.title}?`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 0,
          explanation: "This is a sample explanation for the correct answer."
        },
        {
          question: "Which of the following statements is true?",
          options: ["Statement 1", "Statement 2", "Statement 3", "Statement 4"],
          correctAnswer: 2,
          explanation: "Statement 3 is the correct answer because it accurately represents the concept."
        }
      ];
    }
    
    if (isFlashcardModule(enhancedModuleCopy) && (!enhancedModuleCopy.cards || enhancedModuleCopy.cards.length === 0)) {
      enhancedModuleCopy.cards = [
        {
          front: `Question about ${enhancedModuleCopy.title}?`,
          back: "This is the answer to the question."
        },
        {
          front: "What is the key concept covered in this module?",
          back: `The key concept in ${enhancedModuleCopy.title} is understanding the fundamental principles.`
        }
      ];
    }
    
    if (isInteractiveArticleModule(enhancedModuleCopy) && !enhancedModuleCopy.content) {
      enhancedModuleCopy.content = {
        sections: [{
          title: `Introduction to ${enhancedModuleCopy.title}`,
          content_markdown: `This is a placeholder for interactive article content about ${enhancedModuleCopy.title}`,
          interaction: {
            type: 'short-answer',
            prompt: `What are your thoughts about ${enhancedModuleCopy.title}?`
          }
        }],
        summary: {
          key_takeaways: [`Key concept about ${enhancedModuleCopy.title}`],
          review_task: `Review the concepts of ${enhancedModuleCopy.title}`
        }
      };
    }
    
    return enhancedModuleCopy;
  }, [module]);
};
