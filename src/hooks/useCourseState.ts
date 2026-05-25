
import React from 'react';
import { ExtendedCourse } from '@/types/extended-course';
import { useUserProgress } from '@/hooks/useUserProgress';

export const useCourseState = (course: ExtendedCourse | undefined, progress: any) => {
  const [activeUnit, setActiveUnit] = React.useState(0);
  const [activeSubunit, setActiveSubunit] = React.useState(0);
  const [activeModuleIndex, setActiveModuleIndex] = React.useState(0);
  const [activeModuleId, setActiveModuleId] = React.useState<string | null>(null);
  const [inProgressModules, setInProgressModules] = React.useState<string[]>([]);
  const [showConfetti, setShowConfetti] = React.useState(false);

  React.useEffect(() => {
    if (course && progress) {
      if (progress.current_unit_id && progress.current_subunit_id && progress.current_module_id) {
        const unitIndex = course.modules.findIndex(unit => unit.id === progress.current_unit_id);
        
        if (unitIndex !== -1) {
          const subunitIndex = course.modules[unitIndex]?.content.findIndex(
            subunit => subunit.id === progress.current_subunit_id
          );
          
          if (subunitIndex !== -1) {
            const modules = course.modules[unitIndex].content[subunitIndex].modules || [];
            const moduleIndex = modules.findIndex(module => module.id === progress.current_module_id);
            
            setActiveUnit(unitIndex);
            setActiveSubunit(subunitIndex);
            if (moduleIndex !== -1) {
              setActiveModuleIndex(moduleIndex);
              setActiveModuleId(modules[moduleIndex].id);
            }
          }
        }
      }
      
      if (progress.in_progress_modules) {
        setInProgressModules(progress.in_progress_modules);
      }
    }
  }, [course, progress]);

  return {
    activeUnit,
    activeSubunit,
    activeModuleIndex,
    activeModuleId,
    inProgressModules,
    showConfetti,
    setActiveUnit,
    setActiveSubunit,
    setActiveModuleIndex,
    setActiveModuleId,
    setInProgressModules,
    setShowConfetti
  };
};
