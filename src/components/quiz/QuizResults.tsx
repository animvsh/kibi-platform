
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Confetti from '@/components/animations/Confetti';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  correctCount: number;
  moduleTitle: string;
  moduleIdx: number;
  canRetry: boolean;
  onRetry: () => void;
  onRetake: () => void;
  showConfetti: boolean;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  score, totalQuestions, correctCount, moduleTitle, moduleIdx, canRetry, onRetry, onRetake, showConfetti
}) => {
  return (
    <>
      {showConfetti && score >= 80 && <Confetti />}
      <Card className="bg-dark-400 border-dark-200 mb-6 animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-3">
            <span className="bg-kibi-500 h-8 w-8 rounded-full flex items-center justify-center text-white">
              {moduleIdx + 1}
            </span>
            Quiz Results: {moduleTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center py-8">
            <div className={`text-6xl font-bold mb-4 ${score >= 70 ? 'text-green-400' : 'text-amber-400'}`}>
              {score}%
            </div>
            <p className="text-lg text-white mb-4">
              You answered {correctCount} out of {totalQuestions} correctly.
            </p>
            <div className="w-full max-w-md bg-dark-300 h-4 rounded-full mt-4">
              <div
                className={`h-4 rounded-full ${score >= 70 ? 'bg-green-500' : 'bg-amber-500'}`}
                style={{ width: `${score}%` }}
              ></div>
            </div>
            {canRetry && (
              <Alert className="bg-yellow-900/20 border-yellow-500/50 mt-4">
                <AlertDescription>
                  Missed some? Try again for only the incorrect questions below!
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-center">
          <Button
            onClick={canRetry ? onRetry : onRetake}
            variant="outline"
          >
            {canRetry ? "Retry Incorrect Only" : "Retake Quiz"}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default QuizResults;

