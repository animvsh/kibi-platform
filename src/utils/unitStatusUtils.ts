
import { Dispatch, SetStateAction } from 'react';
import { GenerateOutlineResponse } from '@/types/course';

export interface UnitStatus {
  title: string;
  status: 'pending' | 'generating' | 'complete';
  modulesCount: number;
  completedModules: number;
  error?: boolean;
  progress?: number; // Add progress tracking
}

/**
 * Creates initial unit statuses based on the outline
 */
export const createInitialUnitStatuses = (outline: GenerateOutlineResponse): UnitStatus[] => {
  if (!Array.isArray(outline.units)) return [];
  
  return outline.units.map((unit, index) => ({
    title: unit.title || `Unit ${index + 1}`,
    status: index === 0 ? 'generating' : 'pending',
    modulesCount: Array.isArray(unit.subunits) ? unit.subunits.length : 1,
    completedModules: 0,
    progress: 0
  }));
};

/**
 * Updates the status of a specific unit to 'generating'
 */
export const setUnitToGenerating = (
  unitIndex: number,
  setUnitStatuses: Dispatch<SetStateAction<UnitStatus[]>>
) => {
  setUnitStatuses(prev => {
    const updated = [...prev];
    if (updated[unitIndex]) {
      updated[unitIndex] = { 
        ...updated[unitIndex], 
        status: 'generating',
        progress: 0
      };
    }
    return updated;
  });
};

/**
 * Updates the progress of a unit that's currently being generated
 */
export const updateUnitProgress = (
  unitIndex: number,
  progress: number,
  setUnitStatuses: Dispatch<SetStateAction<UnitStatus[]>>
) => {
  setUnitStatuses(prev => {
    const updated = [...prev];
    if (updated[unitIndex]) {
      const completedModules = Math.floor((progress / 100) * updated[unitIndex].modulesCount);
      updated[unitIndex] = { 
        ...updated[unitIndex], 
        progress,
        completedModules
      };
    }
    return updated;
  });
};

/**
 * Marks a unit as complete
 */
export const setUnitToComplete = (
  unitIndex: number,
  setUnitStatuses: Dispatch<SetStateAction<UnitStatus[]>>,
  hasError: boolean = false
) => {
  setUnitStatuses(prev => {
    const updated = [...prev];
    if (updated[unitIndex]) {
      updated[unitIndex] = { 
        ...updated[unitIndex], 
        status: 'complete',
        completedModules: updated[unitIndex].modulesCount,
        progress: 100,
        error: hasError 
      };
    }
    return updated;
  });
};
