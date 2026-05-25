
import React, { useState } from 'react';
import { FlashcardModuleProps } from '@/types/course';
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const FlashcardModule: React.FC<FlashcardModuleProps> = ({ module, moduleIdx, onComplete, isCompleted }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [showFront, setShowFront] = useState(true);
  
  const handleNextCard = () => {
    if (currentCard < module.cards.length - 1) {
      setCurrentCard(currentCard + 1);
      setShowFront(true);
    } else {
      // Loop back to the first card
      setCurrentCard(0);
      setShowFront(true);
    }
  };
  
  const handlePreviousCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setShowFront(true);
    } else {
      // Loop to the last card
      setCurrentCard(module.cards.length - 1);
      setShowFront(true);
    }
  };
  
  const handleFlipCard = () => {
    setShowFront(!showFront);
  };
  
  return (
    <Card className="bg-dark-400 border-dark-200 mb-6">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-3">
          <span className="bg-kibi-500 h-8 w-8 rounded-full flex items-center justify-center text-white">
            {moduleIdx + 1}
          </span>
          Flashcards: {module.title}
        </CardTitle>
        <div className="flex justify-between items-center text-sm text-gray-400">
          <span>Card {currentCard + 1} of {module.cards.length}</span>
        </div>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div 
          className="w-full max-w-md h-64 perspective-1000 cursor-pointer" 
          onClick={handleFlipCard}
        >
          <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${showFront ? '' : 'rotate-y-180'}`}>
            <div className="absolute w-full h-full bg-dark-300 border-2 border-kibi-500/30 rounded-xl p-6 flex flex-col justify-center items-center backface-hidden">
              <p className="text-xl text-white text-center font-medium">
                {module.cards[currentCard]?.front || "No content"}
              </p>
              <p className="text-sm text-gray-400 mt-4">Click to flip</p>
            </div>
            <div className="absolute w-full h-full bg-kibi-800/30 border-2 border-kibi-600/50 rounded-xl p-6 flex flex-col justify-center items-center backface-hidden rotate-y-180">
              <p className="text-white text-center">
                {module.cards[currentCard]?.back || "No content"}
              </p>
              <p className="text-sm text-gray-400 mt-4">Click to flip back</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-center gap-4">
        <div className="flex space-x-4">
          <Button 
            onClick={handlePreviousCard} 
            variant="outline" 
            size="sm"
            className="w-24"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button 
            onClick={handleFlipCard}
            variant="outline"
            size="sm"
            className="w-24"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Flip
          </Button>
          <Button 
            onClick={handleNextCard}
            variant="outline"
            size="sm" 
            className="w-24"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
        
        {!isCompleted && (
          <div className="w-full flex justify-center mt-4">
            <Button onClick={onComplete} className="bg-kibi-500 hover:bg-kibi-600">
              Mark Set Complete
            </Button>
          </div>
        )}
        
        {isCompleted && (
          <div className="w-full flex items-center justify-center mt-4 text-green-500">
            <CheckCircle className="mr-2 h-5 w-5" />
            <span>Completed</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default FlashcardModule;
