
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Save, ChevronLeft, RefreshCcw } from 'lucide-react';
import { GenerateOutlineResponse } from '@/types/course';

interface CourseReviewActionsProps {
  onSave: () => void;
  isSaving: boolean;
  outline?: GenerateOutlineResponse | null;
  inputText?: string | null;
  isGenerating?: boolean;
}

const CourseReviewActions: React.FC<CourseReviewActionsProps> = ({ 
  onSave, 
  isSaving, 
  outline,
  inputText,
  isGenerating = false
}) => {
  const navigate = useNavigate();
  
  const handleBackToGeneration = () => {
    navigate('/module-generator');
  };
  
  const handleCreateNewCourse = () => {
    navigate('/outline-builder', { 
      state: { searchQuery: inputText } 
    });
  };
  
  return (
    <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div>
        <Button 
          variant="outline" 
          onClick={handleBackToGeneration} 
          className="flex items-center"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Generation
        </Button>
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          onClick={handleCreateNewCourse}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          New Course
        </Button>
        
        <Button 
          onClick={onSave} 
          disabled={isSaving}
          className="bg-kibi-500 hover:bg-kibi-600 flex items-center"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : isGenerating ? 'Save Current Progress' : 'Save Course'}
        </Button>
      </div>
    </div>
  );
};

export default CourseReviewActions;
