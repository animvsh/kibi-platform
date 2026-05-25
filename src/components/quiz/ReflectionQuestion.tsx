
import React, { useState } from 'react';
import type { ReflectionQuestion } from '@/types/quiz';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ReflectionQuestionProps {
  question: ReflectionQuestion;
  onAnswer: (isCorrect: boolean, userAnswer: string) => void;
  showFeedback?: boolean;
}

const ReflectionQuestion: React.FC<ReflectionQuestionProps> = ({
  question,
  onAnswer,
  showFeedback = true
}) => {
  const [answer, setAnswer] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExample, setShowExample] = useState(false);

  const handleSubmit = () => {
    if (!answer.trim()) return;
    setIsSubmitted(true);
    // Always mark as correct - we don't auto-grade reflections
    onAnswer(true, answer);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{question.question_text}</h3>
      <Textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here..."
        className="bg-dark-400 min-h-[120px]"
        disabled={isSubmitted}
      />
      {!isSubmitted ? (
        <Button
          onClick={handleSubmit}
          disabled={!answer.trim()}
          className="bg-kibi-500 hover:bg-kibi-600"
        >
          Submit
        </Button>
      ) : showFeedback && (
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={() => setShowExample(!showExample)}
          >
            {showExample ? 'Hide' : 'Show'} Example Answer
          </Button>
          {showExample && (
            <Alert className="bg-dark-400 border-kibi-500/50">
              <AlertDescription>
                <div className="space-y-2">
                  <h4 className="font-medium">Example elements to include:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {question.expected_elements.map((element, idx) => (
                      <li key={idx}>{element}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

export default ReflectionQuestion;
