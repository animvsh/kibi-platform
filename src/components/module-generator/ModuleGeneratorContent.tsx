import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import HomeLayout from '@/components/home/HomeLayout';
import ModuleGeneratorHeader from '@/components/module-generator/ModuleGeneratorHeader';
import ModuleGeneratorContainer from '@/components/module-generator/ModuleGeneratorContainer';
import ModuleActions from '@/components/module-generator/ModuleActions';
import { useModuleGeneration } from '@/hooks/useModuleGeneration';
import { useCourseGeneration } from '@/contexts/CourseGenerationContext';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { GenerateOutlineResponse } from '@/types/course';

interface ModuleGeneratorContentProps {
  outline: GenerateOutlineResponse;
  searchQuery: string | null;
}

const ModuleGeneratorContent: React.FC<ModuleGeneratorContentProps> = ({ outline, searchQuery }) => {
  const navigate = useNavigate();
  const { stopCourseGeneration } = useCourseGeneration();
  const { isDSADemoMode } = useDemoMode();
  const [hasInitialized, setHasInitialized] = useState(false);
  
  console.log("ModuleGeneratorContent render with outline:", outline);
  console.log("DSA Demo mode enabled:", isDSADemoMode);
  
  const handleCourseComplete = (courseId: string) => {
    console.log("Course generation completed, navigating to dashboard with ID:", courseId);
    
    // For DSA demo mode, navigate to course dashboard with the hardcoded content
    if (isDSADemoMode) {
      console.log("DSA Demo mode: navigating directly to course dashboard");
      navigate(`/course-dashboard/${courseId}`, {
        state: { 
          courseContent, 
          outline, 
          searchQuery,
          isDSADemo: true
        }
      });
    } else {
      navigate(`/course-dashboard/${courseId}`);
    }
  };

  const { 
    isLoading, 
    error, 
    courseContent, 
    unitStatuses, 
    totalProgress,
    initializeGeneration 
  } = useModuleGeneration(outline, handleCourseComplete);

  useEffect(() => {
    // Listen for course generation stop events
    const handleStopGeneration = () => {
      console.log("Detected course generation stop event");
      // We don't need to do anything special here as the state will be updated by the context
    };
    
    document.addEventListener('courseGenerationStop', handleStopGeneration);
    return () => {
      document.removeEventListener('courseGenerationStop', handleStopGeneration);
    };
  }, []);

  useEffect(() => {
    if (outline && !hasInitialized) {
      console.log("Initializing generation with outline:", outline.title, "DSA Demo mode:", isDSADemoMode);
      setHasInitialized(true);
      try {
        initializeGeneration();
      } catch (err) {
        console.error("Error initializing generation:", err);
        toast.error("Failed to start course generation. Please try again.");
      }
    }
  }, [outline, hasInitialized, initializeGeneration, isDSADemoMode]);

  useEffect(() => {
    // Log progress updates to help with debugging
    console.log("Progress update:", totalProgress);
    
    // For DSA demo mode, if we have full course content and 100% progress, navigate immediately
    if (isDSADemoMode && courseContent && totalProgress === 100 && courseContent.modules && courseContent.modules.length > 0) {
      console.log("DSA Demo mode: course is ready, should navigate soon");
    }
  }, [totalProgress, courseContent, isDSADemoMode]);

  const handleUnitClick = (index: number) => {
    if (unitStatuses && unitStatuses[index]) {
      if (unitStatuses[index].status === 'complete') {
        toast.success(`Unit "${unitStatuses[index].title}" is ready to explore!`);
      } else if (unitStatuses[index].status === 'generating') {
        toast.info(`Unit "${unitStatuses[index].title}" is currently being generated...`);
      } else {
        toast.info(`Unit "${unitStatuses[index].title}" is pending generation...`);
      }
    }
  };

  const handleRetry = () => {
    console.log("Retrying generation...");
    stopCourseGeneration({ hardClear: true });
    setHasInitialized(false);
    // Give a slight delay to ensure everything is cleaned up
    setTimeout(() => {
      initializeGeneration();
    }, 100);
  };

  const handleNavigateBack = () => {
    stopCourseGeneration({ hardClear: true });
    navigate('/outline-builder', { 
      state: { searchQuery } 
    });
  };

  const handleViewDashboard = () => {
    if (!courseContent) {
      toast.error("Course structure not ready yet. Please wait for generation to complete.");
      return;
    }
    
    if (!courseContent.modules || courseContent.modules.length === 0) {
      toast.error("No course modules have been generated yet. Please wait or retry.");
      return;
    }
    
    // Navigate to course dashboard instead of review page
    navigate('/course-dashboard', { 
      state: { 
        courseContent, 
        outline, 
        searchQuery
      } 
    });
  };

  // If no outline is provided, show an error
  if (!outline || !outline.title || !Array.isArray(outline.units)) {
    return (
      <HomeLayout>
        <div className="w-full max-w-4xl mx-auto p-4">
          <div className="bg-dark-400 p-6 rounded-xl border-4 border-kibi-600 flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-4">Invalid Course Outline</h3>
            <p className="text-gray-300 mb-6">
              The outline data is invalid or incomplete. Please return to the outline builder.
            </p>
            <Button 
              onClick={handleNavigateBack}
              className="bg-kibi-500 hover:bg-kibi-600 flex items-center gap-2"
            >
              Return to Outline Builder
            </Button>
          </div>
        </div>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      <div className="w-full max-w-5xl mx-auto p-4">
        <div className="bg-dark-400 p-6 rounded-xl border-4 border-kibi-600">
          <ModuleGeneratorHeader />
          <ModuleGeneratorContainer
            isLoading={isLoading}
            error={error}
            courseContent={courseContent}
            unitStatuses={Array.isArray(unitStatuses) ? unitStatuses : []}
            totalProgress={totalProgress}
            onUnitClick={() => {}} // No unit clicking needed for structure-only
          />
          {courseContent && (
            <ModuleActions
              onRegenerate={handleRetry}
              onRetry={handleRetry} 
              onNavigateBack={handleNavigateBack}
              onViewDashboard={handleViewDashboard}
              inputText={searchQuery}
              isGenerating={isLoading}
              courseContent={courseContent}
            />
          )}
          {error && (
            <div className="mt-6 p-4 bg-red-900/20 border border-red-700 rounded-lg text-center">
              <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-2" />
              <h4 className="text-lg font-medium text-white mb-2">Error Generating Structure</h4>
              <p className="text-red-300 mb-4">{error}</p>
              <div className="flex justify-center gap-3">
                <Button onClick={handleRetry} variant="destructive">
                  Try Again
                </Button>
                <Button onClick={handleNavigateBack} variant="outline">
                  Back to Outline Builder
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </HomeLayout>
  );
};

export default ModuleGeneratorContent;
