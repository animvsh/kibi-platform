
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface ArticleProgressProps {
  currentSection: number;
  totalSections: number;
  progress: number;
  showingSummary: boolean;
}

const ArticleProgress: React.FC<ArticleProgressProps> = ({
  currentSection,
  totalSections,
  progress,
  showingSummary
}) => {
  return (
    <div className="flex items-center text-sm text-gray-400">
      <span className="mr-2">
        {showingSummary 
          ? "Summary" 
          : `Section ${currentSection + 1} of ${totalSections}`}
      </span>
      <Progress value={progress} className="h-2 w-24 bg-dark-500" />
    </div>
  );
};

export default ArticleProgress;
