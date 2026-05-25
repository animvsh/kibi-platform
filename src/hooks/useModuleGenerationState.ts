
import { useState } from "react";
import { UnitStatus } from '@/utils/unitStatusUtils';

export interface ModuleGenerationState {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  courseContent: any;
  setCourseContent: React.Dispatch<React.SetStateAction<any>>;
  unitStatuses: UnitStatus[];
  setUnitStatuses: React.Dispatch<React.SetStateAction<UnitStatus[]>>;
  totalProgress: number;
  setTotalProgress: React.Dispatch<React.SetStateAction<number>>;
  isInitialized: boolean;
  setIsInitialized: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Handles all module generation local state in one place.
 */
export const useModuleGenerationState = (): ModuleGenerationState => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [courseContent, setCourseContent] = useState<any>(null);
  const [unitStatuses, setUnitStatuses] = useState<UnitStatus[]>([]);
  const [totalProgress, setTotalProgress] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  return {
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
    setIsInitialized,
  };
};
