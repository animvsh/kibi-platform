
import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronRight } from "lucide-react";

interface ArticleNavigationProps {
  showingSummary: boolean;
  isCompleted: boolean;
  canProgress: boolean;
  currentSectionIndex: number;
  totalSections: number;
  onNext: () => void;
  onComplete: () => void;
}

const ArticleNavigation: React.FC<ArticleNavigationProps> = ({
  showingSummary,
  isCompleted,
  canProgress,
  currentSectionIndex,
  totalSections,
  onNext,
  onComplete
}) => {
  if (showingSummary) {
    return (
      <Button 
        onClick={onComplete} 
        className="ml-auto bg-kibi-500 hover:bg-kibi-600"
        disabled={isCompleted}
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        Complete Module
      </Button>
    );
  }

  return (
    <Button
      onClick={onNext}
      className="ml-auto"
      variant="outline"
      disabled={!canProgress}
    >
      {!canProgress ? (
        "Complete interaction to continue"
      ) : (
        <>
          Next {currentSectionIndex < totalSections - 1 ? "Section" : "to Summary"}
          <ChevronRight className="w-4 h-4 ml-2" />
        </>
      )}
    </Button>
  );
};

export default ArticleNavigation;
