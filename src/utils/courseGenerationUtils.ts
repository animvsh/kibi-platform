
import { GenerateOutlineResponse } from '@/types/course';
import { toast } from 'sonner';
import { generateModuleContent } from '@/services/openai';
import { saveCourseToSupabase } from '@/services/api';
import { Dispatch, SetStateAction } from 'react';
import { UnitStatus, setUnitToGenerating, setUnitToComplete } from './unitStatusUtils';
import { supabase } from '@/integrations/supabase/client';
import { generateHardcodedDSAModuleContent, getHardcodedDSACourse } from './dsaDemoContent';

export const generateCourseContent = async (
  outlineData: GenerateOutlineResponse,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string | null>>,
  setCourseContent: Dispatch<SetStateAction<any>>,
  setUnitStatuses: Dispatch<SetStateAction<UnitStatus[]>>,
  setTotalProgress: (progress: number, unitIndex?: number) => void,
  onCourseComplete?: (courseId: string) => void,
  isDemoMode: boolean = false,
  isDSADemoMode: boolean = false
) => {
  // If DSA demo mode is enabled, immediately show the complete course
  if (isDSADemoMode) {
    console.log("DSA Demo mode enabled - generating complete hardcoded course");
    
    const dsaCourse = getHardcodedDSACourse();
    console.log("DSA Course outline:", dsaCourse);
    
    const modules: any[] = [];
    
    // Generate all units immediately
    for (let unitIndex = 0; unitIndex < dsaCourse.units.length; unitIndex++) {
      console.log(`Generating DSA unit ${unitIndex + 1}/${dsaCourse.units.length}`);
      const unitContent = generateHardcodedDSAModuleContent(unitIndex);
      if (unitContent && unitContent.currentUnit) {
        modules[unitIndex] = unitContent.currentUnit;
        console.log(`DSA Unit ${unitIndex + 1} generated:`, unitContent.currentUnit.title);
      }
    }
    
    const finalCourse = {
      title: dsaCourse.title,
      description: `A comprehensive course on ${dsaCourse.title}`,
      modules: modules
    };
    
    console.log("Final DSA course structure:", finalCourse);
    
    // Set the course content immediately
    setCourseContent(finalCourse);
    
    // Update progress to 100%
    setTotalProgress(100);
    
    // Mark all units as complete
    const completedStatuses = dsaCourse.units.map((unit, index) => ({
      id: `unit-${index}`,
      title: unit.title,
      status: 'complete' as const,
      progress: 100
    }));
    setUnitStatuses(completedStatuses);
    
    // Stop loading
    setIsLoading(false);
    
    // Show success message
    toast.success("🎉 DSA Demo Course ready!");
    
    // Complete generation immediately with a demo course ID
    const demoCourseId = `dsa-demo-${Date.now()}`;
    console.log("Completing DSA demo course with ID:", demoCourseId);
    
    if (onCourseComplete) {
      console.log("Calling onCourseComplete callback");
      onCourseComplete(demoCourseId);
    }
    return;
  }

  if (!outlineData || !Array.isArray(outlineData.units) || outlineData.units.length === 0) {
    setError("Invalid outline structure");
    setIsLoading(false);
    return;
  }

  console.log("Starting course structure generation with outline:", outlineData);
  
  const units = outlineData.units;
  const modules: any[] = [];
  let isCancelled = false;

  const handleGenerationStop = (event: Event) => {
    console.log("Received generation stop event");
    isCancelled = true;
  };
  document.addEventListener('courseGenerationStop', handleGenerationStop);

  try {
    // Process units sequentially to simulate generation
    for (let unitIndex = 0; unitIndex < units.length; unitIndex++) {
      if (isCancelled) {
        setError("Course generation was cancelled");
        setIsLoading(false);
        document.removeEventListener('courseGenerationStop', handleGenerationStop);
        return;
      }

      const unit = units[unitIndex];
      console.log(`Generating structure for unit ${unitIndex + 1}/${units.length}: ${unit.title}`);
      setUnitToGenerating(unitIndex, setUnitStatuses);

      try {
        let unitContent;
        
        if (isDemoMode) {
          // Add a small delay to simulate generation
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Use normal generation but in demo mode
          unitContent = await generateModuleContent(outlineData, unitIndex, isDemoMode);
        } else {
          // Use normal generation
          unitContent = await generateModuleContent(outlineData, unitIndex, isDemoMode);
        }

        if (unitContent && !unitContent.error && unitContent.currentUnit) {
          modules[unitIndex] = unitContent.currentUnit;
          setUnitToComplete(unitIndex, setUnitStatuses);

          // Update progress
          const currentProgress = Math.round(((unitIndex + 1) / units.length) * 100);
          setTotalProgress(currentProgress, unitIndex);

          // Update course content after each unit
          const updatedCourse = {
            title: outlineData.title || "Generated Course",
            description: `Course on ${outlineData.title || "selected topic"}`,
            modules: modules.filter(m => m) // Remove empty slots
          };
          setCourseContent(updatedCourse);
        } else {
          throw new Error(unitContent?.error || "Failed to generate unit structure");
        }
      } catch (error) {
        console.error(`Error generating unit ${unitIndex + 1}:`, error);
        toast.error(`Failed to generate structure for unit ${unitIndex + 1}`);
        setError(`Failed to generate structure for unit: ${unit.title}`);
        setIsLoading(false);
        document.removeEventListener('courseGenerationStop', handleGenerationStop);
        return;
      }
    }

    // Check if user is authenticated before trying to save
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // User is not authenticated - complete generation without saving to database
      console.log("User not authenticated, completing generation without database save");
      const finalCourse = {
        title: outlineData.title || "Generated Course",
        description: `Course on ${outlineData.title || "selected topic"}`,
        modules: modules
      };
      
      toast.success("🎉 Course structure generated successfully!");
      setIsLoading(false);
      
      // Generate a temporary course ID for the onCourseComplete callback
      if (onCourseComplete) {
        const tempCourseId = `temp-${Date.now()}`;
        onCourseComplete(tempCourseId);
      }
      return;
    }

    // Save the course structure to database only if user is authenticated
    try {
      const finalCourse = {
        title: outlineData.title || "Generated Course",
        description: `Course on ${outlineData.title || "selected topic"}`,
        modules: modules
      };

      console.log("Saving course structure to database:", finalCourse);
      const response = await saveCourseToSupabase(finalCourse);
      
      if (response?.courseId) {
        toast.success("🎉 Course structure generated successfully!");
        setIsLoading(false);
        if (onCourseComplete) {
          onCourseComplete(response.courseId);
        }
      } else {
        throw new Error("No course ID returned from save operation");
      }
    } catch (error) {
      console.error("Error saving course:", error);
      setError("Failed to save course structure");
      toast.error("Failed to save course structure");
    }

  } catch (error) {
    console.error("Error in course generation:", error);
    setError("Course generation failed");
    setIsLoading(false);
    toast.error("Course generation failed");
  } finally {
    document.removeEventListener('courseGenerationStop', handleGenerationStop);
  }
};
