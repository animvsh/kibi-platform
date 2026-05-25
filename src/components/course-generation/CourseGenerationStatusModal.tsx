import React, { useState, useEffect } from 'react';
import { X, StopCircle, Loader2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
import Logo from "@/components/Logo";
import { useLocation, useNavigate } from 'react-router-dom';
import { useCourseGeneration } from '@/contexts/CourseGenerationContext';
import GenerationConfirmDialog from "./GenerationConfirmDialog";
import ActiveCoursePromptDialog from "./ActiveCoursePromptDialog";
import CourseGenerationMiniStatus from "./CourseGenerationMiniStatus";

const CourseGenerationStatusModal = () => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [showActiveCoursePrompt, setShowActiveCoursePrompt] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [hasDismissedDialog, setHasDismissedDialog] = useState(false);

  const {
    generationData,
    stopCourseGeneration,
    showConfirmDialog,
    setShowConfirmDialog,
    pendingOutline,
    setPendingOutline,
    startCourseGeneration,
    isGenerating,
  } = useCourseGeneration();

  useEffect(() => {
    if (generationData && 
        generationData.isActive && 
        location.pathname !== '/module-generator' && 
        location.pathname !== '/course-review' && 
        !showActiveCoursePrompt && 
        !hasDismissedDialog && 
        !location.pathname.startsWith('/course/')) {
      const timer = setTimeout(() => {
        setShowActiveCoursePrompt(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [generationData, location.pathname, showActiveCoursePrompt, hasDismissedDialog]);

  useEffect(() => {
    if (generationData) {
      const targetProgress = generationData.progress;
      const step = (targetProgress - animatedProgress) / 10;
      
      if (Math.abs(targetProgress - animatedProgress) > 0.5) {
        const timeout = setTimeout(() => {
          setAnimatedProgress(prev => prev + step);
        }, 100);
        return () => clearTimeout(timeout);
      }
    }
  }, [generationData, animatedProgress]);

  useEffect(() => {
    if (generationData && generationData.progress >= 100 && generationData.courseId) {
      // Only auto-navigate if all modules are verified as complete
      const courseContent = generationData.generationState?.courseContent;
      
      if (areAllModulesGenerated(courseContent)) {
        const timer = setTimeout(() => {
          stopCourseGeneration({ hardClear: true });
          toast.success("🎉 Course fully generated!");
          navigate(`/course/${generationData.courseId}`);
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        // If modules aren't complete, don't auto-navigate
        console.warn("Course progress at 100% but modules not fully generated");
        toast.warning("Course generation completing, please wait for all modules...");
      }
    }
  }, [generationData, stopCourseGeneration, navigate]);

  const areAllModulesGenerated = (content: any) => {
    if (!content || !content.modules || !Array.isArray(content.modules)) {
      return false;
    }

    for (const unit of content.modules) {
      if (!unit.content || !Array.isArray(unit.content)) {
        return false;
      }
      
      for (const subunit of unit.content) {
        if (!subunit.modules || !Array.isArray(subunit.modules) || subunit.modules.length === 0) {
          return false;
        }
        
        // Check that each module has proper content
        for (const module of subunit.modules) {
          if (!module.id || !module.type || !module.title) {
            return false;
          }
          
          // Type-specific content validation
          if (module.type === 'article' && !module.content) {
            return false;
          }
          if (module.type === 'lecture' && !module.searchKeyword) {
            return false;
          }
          if (module.type === 'quiz' && 
              (!module.content_json?.questions?.length && 
               !(module as any).questions?.length)) {
            return false;
          }
          if (module.type === 'code' && !module.description) {
            return false;
          }
        }
      }
    }
    
    return true;
  };

  const handleStopGeneration = () => {
    if (stopCourseGeneration) {
      stopCourseGeneration({ hardClear: true });
    }
    setShowActiveCoursePrompt(false);
    setHasDismissedDialog(true);
  };

  const handleNavigateToCourse = () => {
    navigate('/module-generator');
  };

  const handleDismissDialog = () => {
    setHasDismissedDialog(true);
    setShowActiveCoursePrompt(false);

    if (stopCourseGeneration) {
      stopCourseGeneration({ hardClear: true });
    }
  };

  if (
    location.pathname === '/module-generator' ||
    location.pathname === '/course-review' ||
    !generationData ||
    !isGenerating ||
    (generationData && generationData.progress >= 100)
  ) {
    return null;
  }

  return (
    <>
      <GenerationConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        stopCourseGeneration={stopCourseGeneration}
        startCourseGeneration={startCourseGeneration}
        setPendingOutline={setPendingOutline}
        setShowConfirmDialog={setShowConfirmDialog}
        pendingOutline={pendingOutline}
      />

      <ActiveCoursePromptDialog
        open={showActiveCoursePrompt}
        courseName={generationData?.courseName}
        onContinueBrowsing={handleDismissDialog}
        onViewProgress={() => {
          setShowActiveCoursePrompt(false);
          navigate('/module-generator');
        }}
        onOpenChange={setShowActiveCoursePrompt}
      />

      <CourseGenerationMiniStatus
        courseName={generationData.courseName}
        currentUnit={generationData.currentUnit}
        totalUnits={generationData.totalUnits}
        animatedProgress={animatedProgress}
        onStop={handleStopGeneration}
        onViewStatus={handleNavigateToCourse}
      />
    </>
  );
};

export default CourseGenerationStatusModal;
