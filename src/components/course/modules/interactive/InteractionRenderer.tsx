
import React, { useState } from 'react';
import { ArticleInteraction } from '@/types/modules/interactive-article';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface InteractionRendererProps {
  interaction: ArticleInteraction;
  onComplete: () => void;
  isCompleted: boolean;
}

const InteractionRenderer: React.FC<InteractionRendererProps> = ({ 
  interaction, 
  onComplete,
  isCompleted 
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shortAnswer, setShortAnswer] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  
  const handleQuizSubmit = () => {
    if (!selectedAnswer) return;
    
    if (interaction.type === 'quiz') {
      const correct = selectedAnswer === interaction.correct_answer;
      setIsCorrect(correct);
      setHasSubmitted(true);
      
      if (correct) {
        toast.success("Correct answer!");
        onComplete();
      } else {
        toast.error("That's not correct. Try again!");
      }
    }
  };
  
  const handleShortAnswerSubmit = () => {
    if (!shortAnswer || shortAnswer.length < 10) {
      toast.warning("Please provide a more detailed answer.");
      return;
    }
    
    setHasSubmitted(true);
    toast.success("Response submitted!");
    onComplete();
  };
  
  // If already completed, show completion state
  if (isCompleted) {
    return (
      <div className="flex items-center text-green-500">
        <Check className="mr-2 h-5 w-5" />
        <span>Interaction completed</span>
      </div>
    );
  }
  
  if (interaction.type === 'quiz') {
    return (
      <Card className="bg-dark-200 p-4">
        <h3 className="text-lg font-medium mb-4">{interaction.question}</h3>
        
        <div className="space-y-2">
          {interaction.choices.map((choice, index) => (
            <Button
              key={index}
              variant={selectedAnswer === choice ? "default" : "outline"}
              className={`w-full justify-start text-left ${
                hasSubmitted && choice === interaction.correct_answer
                  ? "border-green-500 bg-green-500/20"
                  : hasSubmitted && selectedAnswer === choice && selectedAnswer !== interaction.correct_answer
                  ? "border-red-500 bg-red-500/20"
                  : ""
              }`}
              onClick={() => !hasSubmitted && setSelectedAnswer(choice)}
              disabled={hasSubmitted}
            >
              {choice}
            </Button>
          ))}
        </div>
        
        {hasSubmitted && (
          <div className={`mt-4 p-3 rounded-md ${isCorrect ? "bg-green-500/20" : "bg-red-500/20"}`}>
            <div className="flex items-start">
              {isCorrect ? (
                <Check className="h-5 w-5 mr-2 text-green-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2 text-red-500 mt-0.5" />
              )}
              <div>
                <p className={isCorrect ? "text-green-500" : "text-red-500"}>
                  {isCorrect ? "Correct!" : "Incorrect. The correct answer is:"}
                </p>
                {!isCorrect && (
                  <p className="mt-1 text-gray-300">{interaction.correct_answer}</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {!hasSubmitted && (
          <Button 
            onClick={handleQuizSubmit} 
            className="mt-4" 
            disabled={!selectedAnswer}
          >
            Submit Answer
          </Button>
        )}
      </Card>
    );
  }
  
  if (interaction.type === 'short-answer') {
    return (
      <Card className="bg-dark-200 p-4">
        <h3 className="text-lg font-medium mb-4">{interaction.prompt}</h3>
        
        <Textarea
          value={shortAnswer}
          onChange={(e) => setShortAnswer(e.target.value)}
          placeholder="Type your answer here..."
          disabled={hasSubmitted}
          className="min-h-[100px] bg-dark-300"
        />
        
        {!hasSubmitted && (
          <Button 
            onClick={handleShortAnswerSubmit} 
            className="mt-4"
            disabled={shortAnswer.length < 10}
          >
            Submit Response
          </Button>
        )}
        
        {hasSubmitted && (
          <div className="mt-4 p-3 bg-green-500/20 rounded-md">
            <div className="flex items-start">
              <Check className="h-5 w-5 mr-2 text-green-500 mt-0.5" />
              <div>
                <p className="text-green-500">Response submitted!</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  }
  
  return null;
};

export default InteractionRenderer;
