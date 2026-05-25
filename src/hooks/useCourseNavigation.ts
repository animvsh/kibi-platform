
import React from 'react';
import { ExtendedCourse } from '@/types/extended-course';
import { Progress } from '@/types/course';

export const useCourseNavigation = (
  course: ExtendedCourse | undefined,
  updateProgress: any,
  handleModuleStart: (moduleId: string) => void
) => {
  const handleNavigation = React.useCallback((
    unitIndex: number, 
    subunitIndex: number, 
    moduleIndex: number,
    unitId: string, 
    subunitId: string,
    moduleId: string
  ) => {
    if (!moduleId) {
      console.error("Cannot navigate: moduleId is undefined");
      return;
    }
    
    console.log("Navigation triggered:", { unitIndex, subunitIndex, moduleIndex, moduleId });
    
    handleModuleStart(moduleId);
    
    // Update last accessed module in database
    updateProgress.mutate({
      current_unit_id: unitId,
      current_subunit_id: subunitId,
      current_module_id: moduleId
    });
  }, [handleModuleStart, updateProgress]);

  const handleNextModule = React.useCallback((
    activeUnit: number,
    activeSubunit: number,
    activeModuleIndex: number,
    setActiveUnit: (index: number) => void,
    setActiveSubunit: (index: number) => void,
    setActiveModuleIndex: (index: number) => void,
    setActiveModuleId: (id: string) => void
  ) => {
    if (!course) return;
    console.log("Next module requested");
    
    const currentUnit = course.modules[activeUnit];
    if (!currentUnit) return;
    
    const currentSubunit = currentUnit.content[activeSubunit];
    if (!currentSubunit || !currentSubunit.modules) return;
    
    // Make sure we have modules to navigate to
    if (currentSubunit.modules.length === 0) return;
    
    if (activeModuleIndex < currentSubunit.modules.length - 1) {
      // Move to next module in the same subunit
      const nextModuleIndex = activeModuleIndex + 1;
      const nextModule = currentSubunit.modules[nextModuleIndex];
      if (!nextModule || !nextModule.id) {
        console.error("Next module or its ID is undefined");
        return;
      }
      
      console.log("Moving to next module in same subunit:", nextModule.title);
      handleNavigation(
        activeUnit, 
        activeSubunit, 
        nextModuleIndex,
        currentUnit.id,
        currentSubunit.id,
        nextModule.id
      );
      setActiveModuleIndex(nextModuleIndex);
      setActiveModuleId(nextModule.id);
    } else if (activeSubunit < currentUnit.content.length - 1) {
      // Move to first module of next subunit in same unit
      const nextSubunitIndex = activeSubunit + 1;
      const nextSubunit = currentUnit.content[nextSubunitIndex];
      if (!nextSubunit.modules || nextSubunit.modules.length === 0) {
        console.error("Next subunit has no modules");
        return;
      }
      
      const firstModule = nextSubunit.modules[0];
      if (!firstModule || !firstModule.id) {
        console.error("First module of next subunit or its ID is undefined");
        return;
      }
      
      console.log("Moving to first module of next subunit:", nextSubunit.title);
      handleNavigation(
        activeUnit, 
        nextSubunitIndex, 
        0,
        currentUnit.id,
        nextSubunit.id,
        firstModule.id
      );
      setActiveSubunit(nextSubunitIndex);
      setActiveModuleIndex(0);
      setActiveModuleId(firstModule.id);
    } else if (activeUnit < course.modules.length - 1) {
      // Move to first module of first subunit of next unit
      const nextUnitIndex = activeUnit + 1;
      const nextUnit = course.modules[nextUnitIndex];
      if (!nextUnit || !nextUnit.content || nextUnit.content.length === 0) {
        console.error("Next unit has no content");
        return;
      }
      
      const nextSubunit = nextUnit.content[0];
      if (!nextSubunit || !nextSubunit.modules || nextSubunit.modules.length === 0) {
        console.error("First subunit of next unit has no modules");
        return;
      }
      
      const firstModule = nextSubunit.modules[0];
      if (!firstModule || !firstModule.id) {
        console.error("First module of next unit or its ID is undefined");
        return;
      }
      
      console.log("Moving to first module of next unit:", nextUnit.title);
      handleNavigation(
        nextUnitIndex, 
        0, 
        0,
        nextUnit.id,
        nextSubunit.id,
        firstModule.id
      );
      setActiveUnit(nextUnitIndex);
      setActiveSubunit(0);
      setActiveModuleIndex(0);
      setActiveModuleId(firstModule.id);
    }
  }, [course, handleNavigation]);

  return {
    handleNavigation,
    handleNextModule
  };
};
