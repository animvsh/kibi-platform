
import React from 'react';
import { toast } from '@/hooks/use-toast';

export const useModuleProgress = (
  progress: any,
  updateProgress: any,
  inProgressModules: string[],
  setInProgressModules: (modules: string[]) => void,
  setShowConfetti: (show: boolean) => void
) => {
  const handleModuleCompletion = React.useCallback(async (moduleId: string) => {
    if (!progress) return;
    if (!moduleId) {
      console.error("Module ID is undefined or null");
      toast({
        title: "Error saving progress",
        description: "Invalid module ID. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("handleModuleCompletion called with moduleId:", moduleId);

    // Get the current completed modules or initialize as empty array
    const completedModules = [...(progress.completed_modules || [])];
    const updatedInProgressModules = inProgressModules.filter(id => id !== moduleId);
    
    // Check if module is already completed to prevent duplicates
    if (!completedModules.includes(moduleId)) {
      completedModules.push(moduleId);
      try {
        console.log("Updating progress with completed modules:", completedModules);
        
        // Update completed modules in the database
        await updateProgress.mutateAsync({
          completed_modules: completedModules,
          in_progress_modules: updatedInProgressModules
        });
        
        // Update local state
        setInProgressModules(updatedInProgressModules);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        
        toast({
          title: "Module completed! 🎉",
          description: "Your progress has been saved.",
          variant: "default"
        });
      } catch (error) {
        console.error("Failed to update progress:", error);
        toast({
          title: "Error saving progress",
          description: "Please try again.",
          variant: "destructive"
        });
      }
    } else {
      console.log("Module is already completed:", moduleId);
    }
  }, [progress, updateProgress, inProgressModules, setInProgressModules, setShowConfetti]);

  const handleModuleStart = React.useCallback(async (moduleId: string) => {
    if (!moduleId) {
      console.error("Module ID is undefined or null");
      return;
    }
    
    console.log("handleModuleStart called with moduleId:", moduleId);
    
    if (!progress || (progress.completed_modules || []).includes(moduleId)) {
      console.log("Module already completed or no progress data");
      return;
    }
    
    // Add the module to inProgressModules when clicked, if not already there
    if (!inProgressModules.includes(moduleId)) {
      console.log("Adding module to inProgressModules:", moduleId);
      const updatedInProgressModules = [...inProgressModules, moduleId];
      setInProgressModules(updatedInProgressModules);
      
      // Update in-progress modules in the database
      try {
        await updateProgress.mutateAsync({
          in_progress_modules: updatedInProgressModules
        });
      } catch (error) {
        console.error("Failed to update in-progress modules:", error);
      }
    }
  }, [progress, inProgressModules, setInProgressModules, updateProgress]);

  return {
    handleModuleCompletion,
    handleModuleStart
  };
};
