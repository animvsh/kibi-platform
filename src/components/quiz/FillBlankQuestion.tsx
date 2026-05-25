
import React, { useState } from 'react';
import type { FillBlankQuestion } from '@/types/quiz';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FillBlankQuestionProps {
  question: FillBlankQuestion;
  onAnswer: (isCorrect: boolean, userAnswer: string) => void;
  showFeedback?: boolean;
}

const FillBlankQuestion: React.FC<FillBlankQuestionProps> = ({
  question,
  onAnswer,
  showFeedback = true
}) => {
  const [answer, setAnswer] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const checkAnswer = (userAnswer: string) => {
    // Case-insensitive comparison
    const correct = userAnswer.trim().toLowerCase() === question.answer.toLowerCase();
    const matchesAlternative = question.alternatives
      ? question.alternatives.some(alt =>
        userAnswer.trim().toLowerCase() === alt.toLowerCase())
      : false;
    return correct || matchesAlternative;
  };

  const handleSubmit = () => {
    if (!answer.trim()) return;

    const correct = checkAnswer(answer);
    setIsCorrect(correct);
    setIsSubmitted(true);
    onAnswer(correct, answer);
  };

  const processedQuestion = question.question_text.replace('____',
    isSubmitted
      ? `<span class="font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}">${answer}</span>`
      : `<span class="px-4 py-0.5 bg-dark-400 rounded">____</span>`
  );

  return (
    <div className="space-y-4">
      <h3
        className="text-lg font-medium"
        dangerouslySetInnerHTML={{ __html: processedQuestion }}
      />
      <div className="flex gap-2">
        <Input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here"
          className="bg-dark-400"
          disabled={isSubmitted}
        />
        {!isSubmitted && (
          <Button
            onClick={handleSubmit}
            disabled={!answer.trim()}
            className="bg-kibi-500 hover:bg-kibi-600 shrink-0"
          >
            Submit
          </Button>
        )}
      </div>
      {isSubmitted && showFeedback && (
        <Alert className={isCorrect ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}>
          <AlertDescription>
            {isCorrect
              ? 'Correct! Well done.'
              : `Incorrect. The answer is: ${question.answer}`}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FillBlankQuestion;
