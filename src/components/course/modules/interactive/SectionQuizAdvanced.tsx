
import React from 'react';
import { Card } from "@/components/ui/card";
import QuizQuestion from '@/components/quiz/QuizQuestion';
import { QuizQuestion as QuizQuestionType } from '@/types/quiz';

interface SectionQuizAdvancedProps {
  question: QuizQuestionType;
  onComplete: () => void;
}

const SectionQuizAdvanced: React.FC<SectionQuizAdvancedProps> = ({ 
  question, 
  onComplete 
}) => {
  return (
    <Card className="border-2 border-dark-200 bg-dark-400 p-4">
      <QuizQuestion 
        question={question}
        onAnswer={() => onComplete()}
        showFeedback={true}
      />
    </Card>
  );
};

export default SectionQuizAdvanced;
