
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { InteractiveArticleContent } from '@/types/modules/interactive-article';
import ArticleSectionRenderer from './interactive/ArticleSectionRenderer';
import InteractionRenderer from './interactive/InteractionRenderer';
import ArticleSummaryView from './interactive/ArticleSummaryView';
import ArticleProgress from './interactive/ArticleProgress';
import ArticleNavigation from './interactive/ArticleNavigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface InteractiveArticleViewerProps {
  moduleId: string;
  title: string;
  content: InteractiveArticleContent;
  onComplete: () => void;
  isCompleted?: boolean;
}

const InteractiveArticleViewer: React.FC<InteractiveArticleViewerProps> = ({
  moduleId,
  title,
  content,
  onComplete,
  isCompleted = false
}) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<Record<number, boolean>>({});
  const [showingSummary, setShowingSummary] = useState(false);
  const [animateSection, setAnimateSection] = useState(false);
  
  const totalSections = content.sections.length;
  const progress = Object.keys(completedSections).length / totalSections * 100;
  const currentSection = showingSummary ? null : content.sections[currentSectionIndex];

  useEffect(() => {
    setAnimateSection(true);
    const timeout = setTimeout(() => setAnimateSection(false), 500);
    return () => clearTimeout(timeout);
  }, [currentSectionIndex, showingSummary]);

  const handleSectionComplete = (sectionIndex: number) => {
    setCompletedSections(prev => ({
      ...prev,
      [sectionIndex]: true
    }));
  };

  const goToNextSection = () => {
    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else if (!showingSummary) {
      setShowingSummary(true);
    }
  };

  const handleModuleComplete = () => {
    onComplete();
    toast.success("Module completed!");
  };

  return (
    <Card className="border border-dark-200 bg-dark-400">
      <CardHeader className="bg-dark-300 border-b border-dark-200">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-kibi-500" />
            {title}
          </CardTitle>
          <ArticleProgress 
            currentSection={currentSectionIndex}
            totalSections={totalSections}
            progress={progress}
            showingSummary={showingSummary}
          />
        </div>
      </CardHeader>
      
      <CardContent className={cn("py-6", animateSection && "animate-fade-in")}>
        {showingSummary ? (
          <ArticleSummaryView 
            summary={content.summary} 
            onComplete={handleModuleComplete}
            isCompleted={isCompleted}
          />
        ) : (
          <>
            <ArticleSectionRenderer section={currentSection} />
            
            {currentSection.interaction && (
              <div className="mt-6 border-t border-dark-200 pt-6">
                <InteractionRenderer 
                  interaction={currentSection.interaction} 
                  onComplete={() => handleSectionComplete(currentSectionIndex)}
                  isCompleted={completedSections[currentSectionIndex]}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
      
      <CardFooter className="border-t border-dark-200 pt-4">
        <ArticleNavigation
          showingSummary={showingSummary}
          isCompleted={isCompleted}
          canProgress={!currentSection?.interaction || completedSections[currentSectionIndex]}
          currentSectionIndex={currentSectionIndex}
          totalSections={totalSections}
          onNext={goToNextSection}
          onComplete={handleModuleComplete}
        />
      </CardFooter>
    </Card>
  );
};

export default InteractiveArticleViewer;
