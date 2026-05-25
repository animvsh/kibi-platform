
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import QuizQuestionComponent from '@/components/quiz/QuizQuestion';
import { QuizQuestion } from '@/types/quiz';

interface QuizInteractionProps {
  questions: QuizQuestion[];
  moduleTitle: string;
  currentQuestion: number;
  onQuestionChange: (idx: number) => void;
  answers: Record<number, boolean>;
  onAnswer: (isCorrect: boolean, userAnswer: any) => void;
  onFinish: () => void;
}

const QuizInteraction: React.FC<QuizInteractionProps> = ({
  questions,
  moduleTitle,
  currentQuestion,
  onQuestionChange,
  answers,
  onAnswer,
  onFinish
}) => {
  const isAnswered = answers[currentQuestion] !== undefined;

  return (
    <Card className="bg-dark-400 border-dark-200 mb-6 animate-fadeIn">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-3">
          Quiz: {moduleTitle}
        </CardTitle>
        <div className="flex justify-between items-center text-sm text-gray-400">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <div className="flex gap-1">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full ${
                  idx === currentQuestion
                    ? 'bg-kibi-500'
                    : answers[idx] === undefined
                      ? 'bg-dark-300'
                      : answers[idx]
                        ? 'bg-green-500'
                        : 'bg-red-500'
                }`}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <QuizQuestionComponent
          question={questions[currentQuestion]}
          onAnswer={onAnswer}
        />
      </CardContent>
      <CardFooter className="justify-between">
        <div className="flex space-x-3">
          <Button
            onClick={() => onQuestionChange(Math.max(currentQuestion - 1, 0))}
            disabled={currentQuestion === 0}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={() => {
              if (currentQuestion < questions.length - 1) {
                onQuestionChange(currentQuestion + 1);
              } else {
                onFinish();
              }
            }}
            disabled={!isAnswered}
            className="gap-2 bg-kibi-500 hover:bg-kibi-600"
          >
            {currentQuestion < questions.length - 1
              ? 'Next Question'
              : 'Complete Quiz'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default QuizInteraction;

