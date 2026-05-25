
import React from 'react';
import { Card } from "@/components/ui/card";
import QuizModuleComponent from '@/components/quiz/QuizModuleComponent';
import { useQuizModuleState } from './quiz/useQuizModuleState';
import QuizResults from '@/components/quiz/QuizResults';
import QuizInteraction from '@/components/quiz/QuizInteraction';
import { useRetryQuiz } from './quiz/useRetryQuiz';
import RetryQuizBuilder from '@/components/quiz/RetryQuizBuilder';
import { QuizModule as QuizModuleType } from '@/types/quiz';

interface QuizModuleProps {
  module: QuizModuleType;
  moduleIdx: number;
  onComplete?: () => void;
  isCompleted?: boolean;
}

const QuizModule: React.FC<QuizModuleProps> = ({
  module,
  moduleIdx,
  onComplete,
  isCompleted = false
}) => {
  const {
    currentQuestion,
    setCurrentQuestion,
    answers,
    handleAnswer,
    quizCompleted,
    showConfetti,
    completeQuiz,
    finalScore,
    userResponses
  } = useQuizModuleState({
    module,
    onComplete,
    isCompleted
  });

  const retryQuizData = useRetryQuiz(userResponses);
  const {
    generatedRetryQuiz,
    setGeneratedRetryQuiz,
    isRetrying,
    setIsRetrying,
    generateRetryQuiz
  } = retryQuizData;

  // Calculate score and status
  const totalQuestions = module.questions.length;
  const correctCount = Object.values(answers).filter(Boolean).length;
  const score = finalScore !== null ? finalScore : (totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0);
  
  // Determine if a retry is possible (some questions were answered incorrectly)
  const canRetry = correctCount < totalQuestions && userResponses.some(r => !r.isCorrect);

  if (!module.questions || module.questions.length === 0) {
    return (
      <Card className="bg-dark-400 border-dark-200 mb-6 p-6 text-center">
        <div className="text-gray-300 mb-4">This quiz has no questions.</div>
      </Card>
    );
  }

  return (
    <div className="quiz-module">
      {quizCompleted ? (
        <>
          <QuizResults
            score={score}
            totalQuestions={totalQuestions}
            correctCount={correctCount}
            moduleTitle={module.title}
            moduleIdx={moduleIdx}
            canRetry={canRetry}
            onRetry={() => {
              if (canRetry) {
                generateRetryQuiz(module);
                setIsRetrying(true);
              }
            }}
            onRetake={() => {
              setCurrentQuestion(0);
              setIsRetrying(false);
              setGeneratedRetryQuiz(null);
            }}
            showConfetti={showConfetti}
          />
          
          <RetryQuizBuilder
            show={isRetrying && !!generatedRetryQuiz}
            retryQuizModule={generatedRetryQuiz}
            moduleIdx={moduleIdx}
            onComplete={onComplete || (() => {})}
          />
        </>
      ) : (
        <QuizInteraction
          questions={module.questions}
          moduleTitle={module.title}
          currentQuestion={currentQuestion}
          onQuestionChange={setCurrentQuestion}
          answers={answers}
          onAnswer={handleAnswer}
          onFinish={completeQuiz}
        />
      )}
    </div>
  );
};

export default QuizModule;
