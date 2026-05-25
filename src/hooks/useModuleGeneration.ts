
import { useEffect } from "react";
import { GenerateOutlineResponse } from "@/types/course";
import { useCourseGeneration } from "@/contexts/CourseGenerationContext";
import { useModuleGenerationState } from "./useModuleGenerationState";
import { useModuleGenerationInitialization } from "./useModuleGenerationInitialization";

/**
 * Hook for generating course modules - orchestrates state, initialization, and persistence.
 * @param outline The course outline object
 * @param onCourseComplete Optional callback when course is done
 */
export const useModuleGeneration = (
  outline: GenerateOutlineResponse | null,
  onCourseComplete?: (courseId: string) => void
) => {
  // Local state
  const {
    isLoading,
    setIsLoading,
    error,
    setError,
    courseContent,
    setCourseContent,
    unitStatuses,
    setUnitStatuses,
    totalProgress,
    setTotalProgress,
    isInitialized,
    setIsInitialized
  } = useModuleGenerationState();

  const { generationData } = useCourseGeneration();

  // Use initialization and resume logic
  const {
    handleResumeGeneration,
    initializeGeneration
  } = useModuleGenerationInitialization({
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
    onCourseComplete
  });

  // Auto-initialize or resume when outline or persisted state is found
  useEffect(() => {
    if (generationData && generationData.isActive) {
      const didResume = handleResumeGeneration();
      if (didResume) return;
    }
    if (outline && !isInitialized) {
      initializeGeneration();
    } else if (!outline && !isInitialized) {
      setError("No outline provided. Please return to the outline builder.");
      setIsLoading(false);
    }
  }, [outline, generationData, isInitialized, handleResumeGeneration, initializeGeneration, setError, setIsLoading]);

  return {
    isLoading,
    error,
    courseContent,
    unitStatuses,
    totalProgress,
    initializeGeneration
  };
};
