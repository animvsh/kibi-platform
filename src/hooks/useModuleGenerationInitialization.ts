
import { useCallback } from "react";
import { toast } from "sonner";
import { GenerateOutlineResponse } from '@/types/course';
import { generateCourseContent } from '@/utils/courseGenerationUtils';
import { createInitialUnitStatuses, UnitStatus } from '@/utils/unitStatusUtils';
import { emitProgress, emitModuleDone } from '@/utils/progressEvents';
import { useCourseGeneration } from "@/contexts/CourseGenerationContext";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { getHardcodedDSACourse } from '@/utils/dsaDemoContent';

interface UseModuleGenerationInitializationProps {
  outline: GenerateOutlineResponse | null;
  isInitialized: boolean;
  setIsInitialized: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  setError: (v: string | null) => void;
  setCourseContent: (content: any) => void;
  setUnitStatuses: (statuses: UnitStatus[] | ((prev: UnitStatus[]) => UnitStatus[])) => void;
  setTotalProgress: (progress: number) => void;
  courseContent: any;
  unitStatuses: UnitStatus[];
  totalProgress: number;
  onCourseComplete?: (courseId: string) => void;
}

export const useModuleGenerationInitialization = ({
  outline,
  isInitialized,
  setIsInitialized,
  setIsLoading,
  setError,
  setCourseContent,
  setUnitStatuses,
  setTotalProgress,
  courseContent,
  unitStatuses,
  totalProgress,
  onCourseComplete,
}: UseModuleGenerationInitializationProps) => {
  const {
    startCourseGeneration, 
    updateCourseGenerationProgress, 
    completeCourseGeneration,
    generationData,
    clearCourseGeneration
  } = useCourseGeneration();
  
  const { isDemoMode, isDSADemoMode } = useDemoMode();

  // Resume from previous persisted state if any
  const handleResumeGeneration = useCallback(() => {
    if (!generationData || !generationData.isActive) return false;

    if (generationData.generationState && generationData.generationState.courseContent) {
      setCourseContent(generationData.generationState.courseContent);

      if (Array.isArray(generationData.generationState.unitStatuses)) {
        setUnitStatuses(generationData.generationState.unitStatuses);
      }

      setTotalProgress(generationData.progress || 0);
      setIsLoading(generationData.isActive);
      setIsInitialized(true);

      if (typeof generationData.currentUnit === 'number') {
        const currentUnitIndex = Math.max(0, generationData.currentUnit - 1);
        emitProgress(currentUnitIndex, generationData.progress);
      }
      return true;
    }
    return false;
  }, [
    generationData,
    setCourseContent,
    setUnitStatuses,
    setTotalProgress,
    setIsLoading,
    setIsInitialized
  ]);

  // Check if all module structures are generated (updated for simplified generation)
  const areAllModulesGenerated = useCallback((content: any) => {
    if (!content || !content.modules || !Array.isArray(content.modules)) {
      return false;
    }

    // For simplified structure generation, we only need to check that each unit has content
    // and each subunit has modules with basic structure
    for (const unit of content.modules) {
      if (!unit.content || !Array.isArray(unit.content)) {
        return false;
      }
      
      for (const subunit of unit.content) {
        if (!subunit.modules || !Array.isArray(subunit.modules) || subunit.modules.length === 0) {
          return false;
        }
        
        // For structure generation, just check that each module has required basic properties
        for (const module of subunit.modules) {
          if (!module.type || !module.title || !module.id) {
            return false;
          }
          
          // For placeholder modules, we only need type, title, id, and description
          if (!module.description) {
            return false;
          }
        }
      }
    }
    
    return true;
  }, []);

  // Start new generation
  const initializeGeneration = useCallback(() => {
    if (!outline || isInitialized) return;

    console.log("Initializing course generation with isDemoMode:", isDemoMode, "isDSADemoMode:", isDSADemoMode);
    
    // Use hardcoded DSA course if DSA demo mode is enabled
    const effectiveOutline = isDSADemoMode ? getHardcodedDSACourse() : outline;
    
    setIsInitialized(true);
    setIsLoading(true);
    setError(null);

    const initialCourseContent = {
      title: effectiveOutline.title || "Generated Course",
      description: `Course on ${effectiveOutline.title || "selected topic"}`,
      modules: []
    };

    setCourseContent(initialCourseContent);
    setTotalProgress(0);

    const initialStatuses = createInitialUnitStatuses(effectiveOutline);
    setUnitStatuses(initialStatuses);

    startCourseGeneration({
      courseId: null,
      courseName: effectiveOutline.title || "New Course",
      totalUnits: initialStatuses.length,
      currentUnit: 0,
      progress: 0,
      outlineId: effectiveOutline.id !== undefined ? String(effectiveOutline.id) : undefined,
      generationState: {
        courseContent: initialCourseContent,
        unitStatuses: initialStatuses
      }
    });

    if (initialStatuses.length > 0) {
      generateCourseContent(
        effectiveOutline, 
        setIsLoading, 
        setError, 
        (newContent) => {
          console.log("Course content updated:", newContent);
          setCourseContent(newContent);
          updateCourseGenerationProgress(
            totalProgress,
            generationData?.currentUnit || 0,
            { courseContent: newContent, unitStatuses }
          );
        },
        (newStatuses) => {
          console.log("Unit statuses updated:", newStatuses);
          setUnitStatuses(newStatuses);
          updateCourseGenerationProgress(
            totalProgress,
            generationData?.currentUnit || 0,
            { courseContent, unitStatuses: newStatuses }
          );
        },
        (progress: number, unitIndex?: number) => {
          console.log("Progress updated:", progress, "Unit index:", unitIndex);
          setTotalProgress(progress);
          if (initialStatuses.length > 0) {
            const progressPercent = typeof progress === 'number' ? progress : 0;
            const statusesLength = initialStatuses.length;
            let nextUnitNumber = unitIndex;
            if (typeof unitIndex !== 'number' && statusesLength > 0) {
              nextUnitNumber = Math.min(
                Math.floor((progressPercent / 100) * statusesLength),
                statusesLength - 1
              );
            }
            const currentUnitIndex = typeof nextUnitNumber === 'number' ? nextUnitNumber : 0;
            updateCourseGenerationProgress(
              progress,
              currentUnitIndex + 1,
              { courseContent, unitStatuses }
            );
            emitProgress(currentUnitIndex, progress);

            if (progress >= 100) {
              emitModuleDone(currentUnitIndex);
            }
          }
        },
        (courseId) => {
          console.log("Course generation complete callback triggered with ID:", courseId);
          console.log("Current courseContent:", courseContent);
          
          if (courseId) {
            // For DSA demo mode, we don't need to verify modules since they're hardcoded
            if (isDSADemoMode || areAllModulesGenerated(courseContent)) {
              console.log("Completing course generation and calling onCourseComplete");
              completeCourseGeneration(courseId);
              if (onCourseComplete) {
                onCourseComplete(courseId);
              }
            } else {
              console.error("Course generation incomplete - not all module structures generated");
              setError("Course generation incomplete. Some module structures failed to generate properly.");
              toast.error("Course generation incomplete. Please retry generation.");
            }
          } else {
            console.error("Course generation complete but no courseId returned");
            setError("Failed to save the generated course structure");
          }
        },
        isDemoMode,
        isDSADemoMode
      );
    } else {
      setIsLoading(false);
      setError("No units found in outline. Please regenerate the outline.");
    }
  }, [
    outline,
    isInitialized,
    isDemoMode,
    isDSADemoMode,
    setIsInitialized,
    setIsLoading,
    setError,
    setCourseContent,
    setTotalProgress,
    setUnitStatuses,
    startCourseGeneration,
    totalProgress,
    generationData,
    updateCourseGenerationProgress,
    completeCourseGeneration,
    courseContent,
    unitStatuses,
    onCourseComplete,
    areAllModulesGenerated
  ]);

  return { handleResumeGeneration, initializeGeneration };
};
