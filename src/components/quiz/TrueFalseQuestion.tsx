
import React, { useState } from 'react';
import type { TrueFalseQuestion } from '@/types/quiz';
import { Button } from "@/components/ui/button";

interface TrueFalseQuestionProps {
  question: TrueFalseQuestion;
  onAnswer: (isCorrect: boolean, userAnswer: boolean) => void;
  showFeedback?: boolean;
}

const TrueFalseQuestion: React.FC<TrueFalseQuestionProps> = ({
  question,
  onAnswer,
  showFeedback = true
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleAnswer = (answer: boolean) => {
    setSelectedAnswer(answer);
    if (!isSubmitted) {
      const isCorrect = answer === question.answer;
      onAnswer(isCorrect, answer);
      setIsSubmitted(true);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{question.question_text}</h3>
      <div className="flex space-x-4">
        <Button
          variant={selectedAnswer === true && isSubmitted
            ? (question.answer === true ? 'default' : 'destructive')
            : 'outline'}
          onClick={() => handleAnswer(true)}
          disabled={isSubmitted}
          className="w-full bg-dark-400"
        >
          True
        </Button>
        <Button
          variant={selectedAnswer === false && isSubmitted
            ? (question.answer === false ? 'default' : 'destructive')
            : 'outline'}
          onClick={() => handleAnswer(false)}
          disabled={isSubmitted}
          className="w-full bg-dark-400"
        >
          False
        </Button>
      </div>
      {showFeedback && isSubmitted && (
        <div className="mt-4 text-sm">
          {selectedAnswer === question.answer
            ? "Correct! Great job."
            : `Incorrect. The correct answer is ${question.answer ? 'True' : 'False'}.`}
        </div>
      )}
    </div>
  );
};

export default TrueFalseQuestion;
