
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import type { QuizQuestion } from '@/types/quiz';
import QuizModuleComponent from '@/components/quiz/QuizModuleComponent';
import type { QuizModule } from '@/types/quiz';
import { v4 as uuidv4 } from 'uuid';

interface QuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  errorMessage: string | null;
  quizQuestions: any[]; // legacy QuizQuestion[]
  selectedAnswers: number[];
  onAnswerSelect: (questionIndex: number, answerIndex: number) => void;
  onSubmit: () => void;
  quizResults: { score: number; total: number } | null;
  onClose: () => void;
}

const QuizDialog: React.FC<QuizDialogProps> = ({
  open,
  onOpenChange,
  loading,
  errorMessage,
  quizQuestions,
  selectedAnswers,
  onAnswerSelect,
  onSubmit,
  quizResults,
  onClose
}) => {
  // Convert legacy quiz questions to new format with unique id
  const convertedQuestions: QuizQuestion[] = quizQuestions.map(q => ({
    id: uuidv4(),
    type: 'multiple_choice',
    question_text: q.question,
    options: q.options,
    correct_option: q.options[q.correctAnswer]
  }));
  
  const quizModule: QuizModule = {
    id: uuidv4(),
    title: "Checkpoint Quiz",
    questions: convertedQuestions
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-dark-400 text-white border-kibi-500 max-w-lg max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Checkpoint Quiz</DialogTitle>
          <DialogDescription>
            Test your understanding of the content so far.
          </DialogDescription>
        </DialogHeader>
        
        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kibi-500 mb-4"></div>
            <p>Generating quiz questions...</p>
          </div>
        )}
        
        {errorMessage && (
          <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-md flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p>{errorMessage}</p>
          </div>
        )}
        
        {!loading && !errorMessage && !quizResults && convertedQuestions.length > 0 && (
          <QuizModuleComponent 
            module={quizModule}
            onComplete={(score) => {
              onSubmit();
            }}
          />
        )}
        
        {quizResults && (
          <div className="py-6 text-center space-y-6">
            <div className="text-6xl font-bold mb-4 text-center">
              <span className={quizResults.score >= 70 ? "text-green-400" : "text-amber-400"}>
                {quizResults.score}%
              </span>
            </div>
            <p className="text-lg">
              You got {quizResults.score * quizResults.total / 100} out of {quizResults.total} questions correct.
            </p>
            <div className="w-full bg-dark-300 h-3 rounded-full">
              <div 
                className={`h-3 rounded-full ${quizResults.score >= 70 ? "bg-green-500" : "bg-amber-500"}`} 
                style={{ width: `${quizResults.score}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          {quizResults && (
            <Button onClick={onClose} className="bg-kibi-500 hover:bg-kibi-600">
              Continue Learning
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuizDialog;
