
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, RefreshCw, CheckCircle } from "lucide-react";
import { Flashcard } from '@/types/course';
import { Progress } from "@/components/ui/progress";

interface FlashcardsViewerProps {
  flashcards: Flashcard[];
  onComplete: () => void;
}

const FlashcardsViewer: React.FC<FlashcardsViewerProps> = ({ flashcards, onComplete }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewedCards, setViewedCards] = useState<number[]>([]);
  
  const progressPercentage = (viewedCards.length / flashcards.length) * 100;
  
  useEffect(() => {
    if (viewedCards.length === flashcards.length) {
      onComplete();
    }
  }, [viewedCards, flashcards.length, onComplete]);
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped && !viewedCards.includes(currentCard)) {
      setViewedCards([...viewedCards, currentCard]);
    }
  };
  
  const handleNext = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
    } else {
      setCurrentCard(0);
      setIsFlipped(false);
    }
  };
  
  const handlePrevious = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setIsFlipped(false);
    } else {
      setCurrentCard(flashcards.length - 1);
      setIsFlipped(false);
    }
  };
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-300">
          Card {currentCard + 1} of {flashcards.length}
        </div>
        <div className="flex items-center gap-2">
          <Progress value={progressPercentage} className="h-2 w-24 bg-dark-500" />
          <span className="text-sm text-gray-300">{Math.round(progressPercentage)}%</span>
          {viewedCards.length === flashcards.length && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
        </div>
      </div>
      
      <div 
        className="w-full h-48 perspective-1000 cursor-pointer mb-6" 
        onClick={handleFlip}
      >
        <div 
          className={`relative w-full h-full transition-all duration-700 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front of Card */}
          <Card className="absolute w-full h-full p-6 flex flex-col justify-center items-center backface-hidden bg-dark-500 border-2 border-kibi-500/30">
            <h3 className="text-xl font-bold text-center">{flashcards[currentCard].front}</h3>
            <p className="text-sm text-gray-400 mt-4">Click to flip</p>
          </Card>
          
          {/* Back of Card */}
          <Card className="absolute w-full h-full p-6 flex flex-col justify-center items-center backface-hidden rotate-y-180 bg-kibi-800/30 border-2 border-kibi-600/50">
            <p className="text-center">{flashcards[currentCard].back}</p>
            <p className="text-sm text-gray-400 mt-4">Click to flip back</p>
          </Card>
        </div>
      </div>
      
      <div className="flex justify-center gap-4">
        <Button 
          onClick={handlePrevious} 
          variant="outline" 
          size="sm"
          className="w-24"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Previous
        </Button>
        <Button 
          onClick={handleFlip}
          variant="outline"
          size="sm"
          className="w-24"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Flip
        </Button>
        <Button 
          onClick={handleNext}
          variant="outline"
          size="sm"
          className="w-24"
        >
          Next <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default FlashcardsViewer;
