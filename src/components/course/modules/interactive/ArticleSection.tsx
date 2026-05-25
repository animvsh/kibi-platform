
import React, { useState } from 'react';
import { ArticleSection as ArticleSectionType } from '@/types/course';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, HelpCircle, Code, BarChart2, FlipHorizontal, BookOpen } from "lucide-react";
import SectionQuiz from './SectionQuiz';
import CodePrompt from './CodePrompt';
import ChartDisplay from './ChartDisplay';
import FlashcardsViewer from './FlashcardsViewer';
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface ArticleSectionProps {
  section: ArticleSectionType;
  sectionIndex: number;
  onComplete: () => void;
  isCompleted: boolean;
}

const ArticleSection: React.FC<ArticleSectionProps> = ({ 
  section, 
  sectionIndex, 
  onComplete,
  isCompleted 
}) => {
  const [showClarification, setShowClarification] = useState(false);
  const [clarificationText, setClarificationText] = useState<string | null>(null);
  const [isClarifying, setIsClarifying] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [codeCompleted, setCodeCompleted] = useState(false);
  const [flashcardsCompleted, setFlashcardsCompleted] = useState(false);

  const simulateClarification = async () => {
    setIsClarifying(true);
    setClarificationText(null);
    
    // Simulate API call to get clarification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulated response
    setClarificationText(`Here's a simpler explanation of ${section.heading}:\n\n${section.content.slice(0, 100)}...\n\nFor example, think of it like ${section.heading.toLowerCase()} being a tool that helps you accomplish tasks more efficiently.`);
    setIsClarifying(false);
    setShowClarification(true);
  };
  
  // Check if all required interactions are complete
  const checkSectionCompletion = () => {
    const hasQuiz = !!section.quiz;
    const hasCode = !!section.code_prompt;
    const hasFlashcards = !!section.flashcards && section.flashcards.length > 0;
    
    // If section has interactive elements, all must be completed
    if (hasQuiz && !quizCompleted) return;
    if (hasCode && !codeCompleted) return;
    if (hasFlashcards && !flashcardsCompleted) return;
    
    // Mark as complete
    onComplete();
  };
  
  // React to completion of individual elements
  React.useEffect(() => {
    checkSectionCompletion();
  }, [quizCompleted, codeCompleted, flashcardsCompleted]);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center">
          <span className="bg-kibi-600/50 w-8 h-8 flex items-center justify-center rounded-full mr-2">
            {sectionIndex + 1}
          </span>
          {section.heading}
        </h3>
        {isCompleted && (
          <Badge className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" /> Completed
          </Badge>
        )}
      </div>
      
      {/* Content Block */}
      <div className="text-gray-200 prose prose-invert max-w-none">
        {/* Visual at top if present */}
        {section.visual && (
          <div className="my-4">
            <figure className="mx-auto">
              <img 
                src={section.visual.url} 
                alt={section.visual.description}
                className="rounded-lg border-2 border-dark-200 max-w-full mx-auto"
              />
              <figcaption className="text-center text-sm text-gray-400 mt-2">
                {section.visual.description}
              </figcaption>
            </figure>
          </div>
        )}
        
        {/* Main content text */}
        <div className="whitespace-pre-wrap">
          {section.content.split('\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4">{paragraph}</p>
          ))}
        </div>
        
        {/* Chart if present */}
        {section.chart && (
          <div className="my-6 p-4 bg-dark-400 rounded-lg">
            <h4 className="text-lg font-medium mb-2 flex items-center">
              <BarChart2 className="h-4 w-4 mr-2 text-kibi-400" />
              Data Visualization
            </h4>
            <ChartDisplay chart={section.chart} />
          </div>
        )}
      </div>
      
      {/* Quiz Section */}
      {section.quiz && (
        <div className="mt-8 border-t border-dark-200 pt-6">
          <h4 className="text-lg font-medium mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-kibi-400" />
            Knowledge Check
          </h4>
          <SectionQuiz 
            quiz={section.quiz} 
            onComplete={() => setQuizCompleted(true)} 
          />
        </div>
      )}
      
      {/* Code Prompt */}
      {section.code_prompt && (
        <div className="mt-8 border-t border-dark-200 pt-6">
          <h4 className="text-lg font-medium mb-4 flex items-center">
            <Code className="h-5 w-5 mr-2 text-kibi-400" />
            Practice Exercise
          </h4>
          <CodePrompt 
            codePrompt={section.code_prompt} 
            onComplete={() => setCodeCompleted(true)} 
          />
        </div>
      )}
      
      {/* Flashcards */}
      {section.flashcards && section.flashcards.length > 0 && (
        <div className="mt-8 border-t border-dark-200 pt-6">
          <h4 className="text-lg font-medium mb-4 flex items-center">
            <FlipHorizontal className="h-5 w-5 mr-2 text-kibi-400" />
            Flashcards
          </h4>
          <FlashcardsViewer 
            flashcards={section.flashcards} 
            onComplete={() => setFlashcardsCompleted(true)} 
          />
        </div>
      )}
      
      {/* Summary Image */}
      {section.summary_image && (
        <div className="mt-8 border-t border-dark-200 pt-6">
          <h4 className="text-lg font-medium mb-4">Summary Visualization</h4>
          <figure className="mx-auto">
            <img 
              src={section.summary_image.url} 
              alt={section.summary_image.description}
              className="rounded-lg border-2 border-dark-200 max-w-full mx-auto"
            />
            <figcaption className="text-center text-sm text-gray-400 mt-2">
              {section.summary_image.description}
            </figcaption>
          </figure>
        </div>
      )}
      
      {/* Clarification Section */}
      <div className="mt-6 border-t border-dark-200 pt-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={simulateClarification}
          disabled={isClarifying}
          className="flex items-center text-gray-400 hover:text-white"
        >
          <HelpCircle className="h-4 w-4 mr-2" /> 
          {isClarifying ? 'Thinking...' : 'Still confused? Ask for clarification'}
        </Button>
        
        {showClarification && clarificationText && (
          <Card className="mt-4 bg-kibi-900/20 border-kibi-500/30 text-gray-200 p-4 animate-scale-in">
            <Alert>
              <AlertDescription>
                <div className="whitespace-pre-wrap">{clarificationText}</div>
              </AlertDescription>
            </Alert>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ArticleSection;
