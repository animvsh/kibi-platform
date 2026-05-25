
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { QuizModule as QuizModuleType } from '@/types/quiz';

export type UserResponse = {
  questionId: string;
  userAnswer: any;
  isCorrect: boolean;
};

type UseQuizModuleStateProps = {
  module: QuizModuleType;
  onComplete?: () => void;
  isCompleted?: boolean;
};

/**
 * Manages quiz state and logic.
 */
export function useQuizModuleState({ module, onComplete, isCompleted }: UseQuizModuleStateProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (isCompleted) setQuizCompleted(true);
  }, [isCompleted]);

  const handleAnswer = async (isCorrect: boolean, userAnswer: any) => {
    const updatedResponses = [...userResponses];
    updatedResponses[currentQuestion] = {
      questionId: module.questions[currentQuestion].id,
      userAnswer,
      isCorrect,
    };
    setUserResponses(updatedResponses);
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: isCorrect,
    }));
  };

  const completeQuiz = async () => {
    const answered = answers;
    const total = module.questions.length;
    const correctCount = Object.values(answered).filter(Boolean).length;
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    setFinalScore(score);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_module_progress')
          .upsert({
            user_id: user.id,
            module_id: module.id,
            score,
            status: 'complete',
            completed_at: new Date().toISOString(),
            responses: userResponses.map((r) => ({
              question_id: r.questionId,
              user_answer: r.userAnswer,
              correct: r.isCorrect
            })),
          });
      }
    } catch (error) {
      console.error('Error saving quiz results:', error);
      toast({
        title: 'Error',
        description: 'Could not save quiz results',
        variant: 'destructive'
      });
    }

    if (score >= 80) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    setQuizCompleted(true);

    if (onComplete) onComplete();

    toast({
      title: `Quiz Complete: ${score}%`,
      description: `You got ${correctCount} out of ${total} questions correct.`,
    });
  };

  return {
    currentQuestion,
    setCurrentQuestion,
    answers,
    userResponses,
    setUserResponses,
    handleAnswer,
    quizCompleted,
    setQuizCompleted,
    showConfetti,
    setShowConfetti,
    completeQuiz,
    finalScore,
    setAnswers,
    setFinalScore,
    module,
  };
}
