
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { HelpCircle, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SectionQuizProps {
  quiz: {
    question_text: string;
    options: string[];
    correct_option: string;
  };
  onComplete: () => void;
}

const SectionQuiz: React.FC<SectionQuizProps> = ({ quiz, onComplete }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const handleSubmit = () => {
    if (!selectedAnswer) return;
    
    const correctIndex = quiz.options.findIndex(option => option === quiz.correct_option);
    const selectedIndex = parseInt(selectedAnswer);
    
    setIsCorrect(selectedIndex === correctIndex);
    setIsSubmitted(true);
    onComplete();
  };
  
  return (
    <Card className="border-2 border-dark-200 bg-dark-400 p-4">
      <h5 className="text-lg font-medium mb-4">{quiz.question_text}</h5>
      
      <RadioGroup 
        value={selectedAnswer} 
        onValueChange={setSelectedAnswer}
        className="space-y-3"
        disabled={isSubmitted}
      >
        {quiz.options.map((option, idx) => (
          <div 
            key={idx} 
            className={`flex items-center space-x-3 rounded-lg border p-4 
              ${isSubmitted 
                ? (option === quiz.correct_option 
                  ? 'border-green-500 bg-green-900/20' 
                  : parseInt(selectedAnswer!) === idx && option !== quiz.correct_option 
                    ? 'border-red-500 bg-red-900/20' 
                    : 'border-dark-300') 
                : 'border-dark-300'}`
              }
          >
            <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
            <label 
              htmlFor={`option-${idx}`} 
              className="flex-grow cursor-pointer"
            >
              {option}
            </label>
            {isSubmitted && option === quiz.correct_option && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {isSubmitted && parseInt(selectedAnswer!) === idx && option !== quiz.correct_option && (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        ))}
      </RadioGroup>
      
      {!isSubmitted ? (
        <Button 
          onClick={handleSubmit} 
          disabled={selectedAnswer === null}
          className="mt-4 bg-kibi-500 hover:bg-kibi-600"
        >
          Submit Answer
        </Button>
      ) : (
        <Alert className={`mt-4 ${isCorrect ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
          <AlertDescription>
            <p className="font-medium mb-2">
              {isCorrect ? 'Correct!' : 'Incorrect'} 
            </p>
            <p>The correct answer is: {quiz.correct_option}</p>
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
};

export default SectionQuiz;
