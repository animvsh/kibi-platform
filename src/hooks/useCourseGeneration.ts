
import { useState, useEffect } from 'react';
import { generateModuleContent, saveCourseToSupabase } from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

interface Module {
  title: string;
  description: string;
  topics: string[];
}

// Define ModuleContent interface that was missing
interface ModuleContent {
  conceptContent: string;
  codeContent?: {
    explanation: string;
    snippet: string;
    language: string;
  };
  videoIds?: string[];
  quizQuestions?: any[];
}

interface ModuleWithContent extends Module {
  content?: ModuleContent;
  status?: 'pending' | 'generating' | 'complete';
}

export interface UnitGenerationStatus {
  title: string;
  status: 'pending' | 'generating' | 'complete';
  modulesCount: number;
  completedModules: number;
  estimatedTime?: number;
}

export const useCourseGeneration = (initialModules: Module[]) => {
  const [modules, setModules] = useState<ModuleWithContent[]>([]);
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(0);
  const [unitStatuses, setUnitStatuses] = useState<UnitGenerationStatus[]>([]);
  const [totalProgress, setTotalProgress] = useState(0);
  const navigate = useNavigate();

  // Initialize module statuses
  useEffect(() => {
    if (initialModules && initialModules.length > 0) {
      setModules(initialModules.map(module => ({
        ...module,
        status: 'pending'
      })));
      
      // Initialize unit statuses
      setUnitStatuses(initialModules.map((module, index) => ({
        title: module.title,
        status: index === 0 ? 'generating' : 'pending',
        modulesCount: Math.max(1, module.topics?.length || 0), 
        completedModules: 0,
        estimatedTime: 10 + (module.topics?.length || 0) * 2 // rough estimate
      })));

      generateContentForCurrentModule(0, initialModules.map(m => ({ ...m })));
    }
  }, [initialModules]);

  const generateContentForCurrentModule = async (index: number, currentModules: ModuleWithContent[]) => {
    if (index >= currentModules.length) {
      setGeneratingIndex(null);
      toast.success("Course content generation complete!");
      
      // Navigate to the course page
      try {
        const courseData = {
          title: "Generated Interactive Course",
          modules: currentModules,
        };
        
        const response = await saveCourseToSupabase(courseData);
        if (response?.courseId) {
          navigate(`/course/${response.courseId}`);
        }
      } catch (error) {
        console.error("Error saving course:", error);
        toast.error("Failed to save course");
      }
      return;
    }

    // Update the current generating module
    setGeneratingIndex(index);
    
    // Update unit status to generating
    setUnitStatuses(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          status: 'generating'
        };
      }
      return updated;
    });
    
    const module = currentModules[index];

    try {
      // Update current unit in progress
      const topicsTotal = Math.max(1, module.topics?.length || 0);
      let completedTopics = 0;
      
      // Fix TS2554: Expected 1-2 arguments, but got 3
      // Update to match the new API signature from openai.ts
      const content = await generateModuleContent({
        title: module.title,
        units: [{
          title: module.title,
          subunits: module.topics || []
        }]
      });

      // Update module with content
      const updatedModules = [...currentModules];
      updatedModules[index] = {
        ...module,
        content,
        status: 'complete'
      };
      
      setModules(updatedModules);
      
      // Update unit status to complete
      setUnitStatuses(prev => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index] = {
            ...updated[index],
            status: 'complete',
            completedModules: updated[index].modulesCount
          };
        }
        return updated;
      });

      // Calculate overall progress
      const newProgress = Math.min(100, Math.round(((index + 1) / currentModules.length) * 100));
      setTotalProgress(newProgress);
      
      // Add small delay for visual feedback
      setTimeout(() => {
        generateContentForCurrentModule(index + 1, updatedModules);
      }, 500);
    } catch (error) {
      console.error("Error generating content for module:", error);
      toast.error(`Failed to generate content for module ${index + 1}`);
      
      // Even if there's an error, mark as complete to continue
      setUnitStatuses(prev => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index] = {
            ...updated[index],
            status: 'complete',
            completedModules: updated[index].modulesCount
          };
        }
        return updated;
      });
      
      setTimeout(() => {
        generateContentForCurrentModule(index + 1, currentModules);
      }, 500);
    }
  };

  return {
    modules,
    generatingIndex,
    setModules,
    unitStatuses,
    totalProgress
  };
};
