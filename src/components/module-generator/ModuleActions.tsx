
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  RefreshCw, 
  ArrowRight,
  Clock,
  BookOpen
} from "lucide-react";

interface ModuleActionsProps {
  onRegenerate: () => void;
  onNavigateBack: () => void;
  onViewDashboard: () => void;
  onRetry?: () => void;
  inputText?: string | null;
  isGenerating?: boolean;
  courseContent?: any;
}

const ModuleActions = ({ 
  onRegenerate, 
  onNavigateBack, 
  onViewDashboard,
  onRetry,
  inputText, 
  isGenerating,
  courseContent 
}: ModuleActionsProps) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      onRegenerate();
    }
  };

  // Check if course structure is generated
  const isCourseStructureReady = () => {
    return courseContent && courseContent.modules && courseContent.modules.length > 0;
  };

  const structureReady = isCourseStructureReady();
  
  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap gap-4 justify-center">
        <Button 
          onClick={onNavigateBack}
          variant="outline" 
          className="flex items-center gap-2"
          disabled={isGenerating}
        >
          Back to Outline
        </Button>
        
        <Button 
          onClick={handleRetry}
          variant="outline" 
          className="flex items-center gap-2"
          disabled={isGenerating}
        >
          <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} /> 
          Regenerate Structure
        </Button>
        
        <Button 
          onClick={onViewDashboard}
          className="bg-kibi-500 hover:bg-kibi-600 flex items-center gap-2"
          disabled={isGenerating || !structureReady}
        >
          {isGenerating ? (
            <>
              <Clock className="h-4 w-4" />
              Generating Structure...
            </>
          ) : !structureReady ? (
            <>
              <Clock className="h-4 w-4" />
              Waiting for Structure
            </>
          ) : (
            <>
              <BookOpen className="h-4 w-4" />
              View Course Dashboard
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
      
      {!structureReady && !isGenerating && (
        <div className="text-center text-sm text-amber-400">
          Please wait for the course structure to be generated.
        </div>
      )}
    </div>
  );
};

export default ModuleActions;
