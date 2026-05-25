
import React, { useState } from 'react';
import type { MultipleChoiceQuestion } from '@/types/quiz';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";

interface MultipleChoiceQuestionProps {
  question: MultipleChoiceQuestion;
  onAnswer: (isCorrect: boolean, userAnswer: string) => void;
  showFeedback?: boolean;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  onAnswer,
  showFeedback = true
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (!selectedOption) return;

    const correct = selectedOption === question.correct_option;
    setIsCorrect(correct);
    setIsSubmitted(true);
    onAnswer(correct, selectedOption);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{question.question_text}</h3>
      <RadioGroup
        value={selectedOption || undefined}
        onValueChange={setSelectedOption}
        className="space-y-2"
        disabled={isSubmitted}
      >
        {question.options.map((option, idx) => (
          <div
            key={idx}
            className={`flex items-center space-x-3 rounded-lg border p-4 bg-dark-400
              ${isSubmitted
                ? (option === question.correct_option
                  ? 'border-green-500 bg-green-900/20'
                  : selectedOption === option && option !== question.correct_option
                    ? 'border-red-500 bg-red-900/20'
                    : 'border-dark-300')
                : 'border-dark-300'}`
            }
          >
            <RadioGroupItem value={option} id={`option-${idx}`} />
            <label htmlFor={`option-${idx}`} className="flex-grow cursor-pointer">{option}</label>
            {isSubmitted && option === question.correct_option && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {isSubmitted && selectedOption === option && option !== question.correct_option && (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        ))}
      </RadioGroup>
      {!isSubmitted && (
        <Button
          onClick={handleSubmit}
          disabled={!selectedOption}
          className="bg-kibi-500 hover:bg-kibi-600"
        >
          Check Answer
        </Button>
      )}
      {isSubmitted && showFeedback && (
        <Alert className={isCorrect ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}>
          <AlertDescription>
            {isCorrect
              ? 'Correct! Well done.'
              : `Incorrect. The correct answer is: ${question.correct_option}`}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MultipleChoiceQuestion;
