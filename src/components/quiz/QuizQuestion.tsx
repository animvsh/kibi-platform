
import React from 'react';
import {
  QuizQuestion as QuizQuestionType,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  FillBlankQuestion,
  MatchTermsQuestion,
  ReflectionQuestion,
} from '@/types/quiz';
import MultipleChoiceQuestionComponent from './MultipleChoiceQuestion';
import TrueFalseQuestionComponent from './TrueFalseQuestion';
import FillBlankQuestionComponent from './FillBlankQuestion';
import MatchTermsQuestionComponent from './MatchTermsQuestion';
import ReflectionQuestionComponent from './ReflectionQuestion';

interface QuizQuestionProps {
  question: QuizQuestionType;
  onAnswer: (isCorrect: boolean, userAnswer: any) => void;
  showFeedback?: boolean;
}

// Adapter components to pass userAnswer to parent (for analytics)
const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  onAnswer,
  showFeedback = true
}) => {
  switch (question.type) {
    case 'multiple_choice':
      return (
        <MultipleChoiceQuestionComponent
          question={question as MultipleChoiceQuestion}
          onAnswer={onAnswer}
          showFeedback={showFeedback}
        />
      );
    case 'true_false':
      return (
        <TrueFalseQuestionComponent
          question={question as TrueFalseQuestion}
          onAnswer={onAnswer}
          showFeedback={showFeedback}
        />
      );
    case 'fill_blank':
      return (
        <FillBlankQuestionComponent
          question={question as FillBlankQuestion}
          onAnswer={onAnswer}
          showFeedback={showFeedback}
        />
      );
    case 'match_terms':
      return (
        <MatchTermsQuestionComponent
          question={question as MatchTermsQuestion}
          onAnswer={onAnswer}
          showFeedback={showFeedback}
        />
      );
    case 'reflection':
      return (
        <ReflectionQuestionComponent
          question={question as ReflectionQuestion}
          onAnswer={onAnswer}
          showFeedback={showFeedback}
        />
      );
    default:
      return <div>Unknown question type</div>;
  }
};

export default QuizQuestion;
