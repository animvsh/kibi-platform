import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { GenerateOutlineResponse } from '@/types/course';

export interface CourseGenerationData {
  isActive: boolean;
  courseId: string | null;
  courseName: string;
  totalUnits: number;
  currentUnit: number;
  progress: number;
  outlineId?: string;
  generationState?: {
    courseContent?: any;
    unitStatuses?: any[];
  };
}

interface StopCourseGenerationOptions {
  hardClear?: boolean;
}

interface CourseGenerationContextType {
  generationData: CourseGenerationData | null;
  startCourseGeneration: (data: Omit<CourseGenerationData, 'isActive'>) => void;
  updateCourseGenerationProgress: (progress: number, currentUnit: number, generationState?: any) => void;
  completeCourseGeneration: (courseId: string) => void;
  stopCourseGeneration: (opts?: StopCourseGenerationOptions) => void;
  clearCourseGeneration: () => void;
  showConfirmDialog: boolean;
  setShowConfirmDialog: React.Dispatch<React.SetStateAction<boolean>>;
  pendingOutline: GenerateOutlineResponse | null;
  setPendingOutline: React.Dispatch<React.SetStateAction<GenerateOutlineResponse | null>>;
  isGenerating: boolean;
}

const CourseGenerationContext = createContext<CourseGenerationContextType>({
  generationData: null,
  startCourseGeneration: () => {},
  updateCourseGenerationProgress: () => {},
  completeCourseGeneration: () => {},
  stopCourseGeneration: () => {},
  clearCourseGeneration: () => {},
  showConfirmDialog: false,
  setShowConfirmDialog: () => {},
  pendingOutline: null,
  setPendingOutline: () => {},
  isGenerating: false,
});

export const CourseGenerationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [generationData, setGenerationData] = useState<CourseGenerationData | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [pendingOutline, setPendingOutline] = useState<GenerateOutlineResponse | null>(null);

  const hardClearGeneration = () => {
    console.log('[CourseGeneration] Clearing ALL temp progress + listeners.');
    localStorage.removeItem('activeCourseGeneration');
    setGenerationData(null);
    // Dispatch an event that can be listened to by any components that need to respond to course generation stopping
    document.dispatchEvent(new Event('courseGenerationStop'));
  };

  useEffect(() => {
    const storedData = localStorage.getItem('activeCourseGeneration');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (parsedData && parsedData.isActive) {
          console.log("Loaded active course generation from storage:", parsedData.courseName);
          setGenerationData(parsedData);
        }
      } catch (error) {
        console.error("Error parsing stored generation data:", error);
        localStorage.removeItem('activeCourseGeneration');
      }
    }
  }, []);

  useEffect(() => {
    if (generationData) {
      console.log("Storing generation data in localStorage:", generationData.courseName);
      localStorage.setItem('activeCourseGeneration', JSON.stringify(generationData));
    } else {
      localStorage.removeItem('activeCourseGeneration');
    }
  }, [generationData]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (generationData?.isActive) {
        console.log("Saving generation state before unload");
        localStorage.setItem('activeCourseGeneration', JSON.stringify(generationData));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [generationData]);

  const startCourseGeneration = (data: Omit<CourseGenerationData, 'isActive'>) => {
    const newGenerationData = {
      ...data,
      isActive: true,
    };
    setGenerationData(newGenerationData);
    console.log("Starting course generation:", data.courseName);
  };

  const updateCourseGenerationProgress = (progress: number, currentUnit: number, generationState?: any) => {
    if (!generationData) return;
    
    setGenerationData(prev => {
      if (!prev) return null;
      
      // Keep the existing generation state if not provided
      const updatedState = generationState ? generationState : prev.generationState;
      
      const updatedData = {
        ...prev,
        progress,
        currentUnit,
        generationState: updatedState
      };
      
      // Save to localStorage immediately for persistence
      localStorage.setItem('activeCourseGeneration', JSON.stringify(updatedData));
      
      return updatedData;
    });
  };

  const completeCourseGeneration = (courseId: string) => {
    if (!generationData) return;

    setGenerationData(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        isActive: false,
        courseId,
        progress: 100,
      };
      
      // Save final state
      localStorage.setItem('activeCourseGeneration', JSON.stringify(updated));
      return updated;
    });

    // Clear data after a delay
    setTimeout(() => {
      setGenerationData(prev => {
        if (!prev || prev.courseId !== courseId) return prev;
        localStorage.removeItem('activeCourseGeneration');
        return null;
      });
    }, 5000);
  };

  const stopCourseGeneration = (opts: StopCourseGenerationOptions = {}) => {
    if (generationData?.isActive) {
      console.log("Stopping course generation (opts=", opts, ")");
      const event = new Event('courseGenerationStop');
      document.dispatchEvent(event);
      
      if (opts.hardClear) {
        hardClearGeneration();
      } else {
        setGenerationData(prev => {
          if (!prev) return null;
          const updated = {
            ...prev,
            isActive: false,
          };
          localStorage.setItem('activeCourseGeneration', JSON.stringify(updated));
          return updated;
        });
        toast.info("Course generation stopped");
      }
    } else if (opts.hardClear) {
      hardClearGeneration();
    }
  };

  const clearCourseGeneration = () => {
    localStorage.removeItem('activeCourseGeneration');
    setGenerationData(null);
  };

  const isGenerating = !!(generationData && generationData.isActive);

  return (
    <CourseGenerationContext.Provider
      value={{
        generationData,
        startCourseGeneration,
        updateCourseGenerationProgress,
        completeCourseGeneration,
        stopCourseGeneration,
        clearCourseGeneration,
        showConfirmDialog,
        setShowConfirmDialog,
        pendingOutline,
        setPendingOutline,
        isGenerating,
      }}
    >
      {children}
    </CourseGenerationContext.Provider>
  );
};

export const useCourseGeneration = () => useContext(CourseGenerationContext);
