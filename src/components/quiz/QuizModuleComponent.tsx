
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import QuizQuestion from './QuizQuestion';
import { QuizModule as QuizModuleType } from '@/types/quiz';

interface QuizModuleComponentProps {
  module: QuizModuleType;
  onComplete?: (score: number) => void;
}

const QuizModuleComponent: React.FC<QuizModuleComponentProps> = ({
  module,
  onComplete
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  const handleAnswer = (questionIndex: number, isCorrect: boolean) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: isCorrect
    }));
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < module.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeQuiz();
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const completeQuiz = () => {
    setQuizCompleted(true);
    
    const answeredQuestions = Object.keys(answers).length;
    const correctAnswers = Object.values(answers).filter(Boolean).length;
    const score = Math.round((correctAnswers / answeredQuestions) * 100);
    
    if (onComplete) {
      onComplete(score);
    }
  };
  
  const calculateProgress = () => {
    return Object.keys(answers).length / module.questions.length * 100;
  };
  
  if (quizCompleted) {
    const answeredQuestions = Object.keys(answers).length;
    const correctAnswers = Object.values(answers).filter(Boolean).length;
    const score = Math.round((correctAnswers / answeredQuestions) * 100);
    
    return (
      <Card className="bg-dark-400 border-dark-200">
        <CardHeader>
          <CardTitle className="text-xl text-white">{module.title} - Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center py-6">
            <div className={`text-6xl font-bold mb-4 ${score >= 70 ? 'text-green-400' : 'text-amber-400'}`}>
              {score}%
            </div>
            <p className="text-lg text-white mb-4">
              You answered {correctAnswers} out of {module.questions.length} correctly.
            </p>
            <div className="w-full max-w-md bg-dark-300 h-4 rounded-full mt-4">
              <div 
                className={`h-4 rounded-full ${score >= 70 ? 'bg-green-500' : 'bg-amber-500'}`} 
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={() => {
              setCurrentQuestionIndex(0);
              setAnswers({});
              setQuizCompleted(false);
            }} 
            variant="outline" 
            className="w-full"
          >
            Retake Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  const currentQuestion = module.questions[currentQuestionIndex];
  const isAnswered = answers[currentQuestionIndex] !== undefined;
  
  return (
    <Card className="bg-dark-400 border-dark-200">
      <CardHeader>
        <CardTitle className="text-xl text-white">{module.title}</CardTitle>
        <div className="flex justify-between items-center text-sm text-gray-400">
          <span>Question {currentQuestionIndex + 1} of {module.questions.length}</span>
          <Progress value={calculateProgress()} className="w-24 h-2 bg-dark-500" />
        </div>
      </CardHeader>
      <CardContent>
        <QuizQuestion 
          question={currentQuestion}
          onAnswer={(isCorrect) => handleAnswer(currentQuestionIndex, isCorrect)}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          variant="outline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        
        <Button 
          onClick={handleNext}
          disabled={!isAnswered}
          className="bg-kibi-500 hover:bg-kibi-600"
        >
          {currentQuestionIndex < module.questions.length - 1 ? (
            <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
          ) : (
            <>Complete <CheckCircle className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizModuleComponent;
