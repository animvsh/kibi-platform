
import React, { useEffect } from 'react';
import { ExtendedCourse } from '@/types/extended-course';
import CourseProgress from './sidebar/CourseProgress';
import QuickNavigation from './sidebar/QuickNavigation';
import SidebarContent from './sidebar/SidebarContent';

interface CourseSidebarProps {
  course: ExtendedCourse;
  activeUnit: number | null;
  activeSubunit: number | null;
  activeModuleId: string | null;
  completedModules: string[];
  inProgressModules: string[];
  onNavigate: (unitIndex: number, subunitIndex: number, moduleIndex: number, unitId: string, subunitId: string, moduleId: string) => void;
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({
  course,
  activeUnit,
  activeSubunit,
  activeModuleId,
  completedModules,
  inProgressModules,
  onNavigate
}) => {
  const [openAccordions, setOpenAccordions] = React.useState<string[]>([]);
  
  useEffect(() => {
    if (activeUnit !== null) {
      const unitKey = `unit-${activeUnit}`;
      if (!openAccordions.includes(unitKey)) {
        setOpenAccordions(prev => [...prev, unitKey]);
      }
    }
  }, [activeUnit, openAccordions]);

  const handleSliderChange = (value: number[]) => {
    const unitIndex = value[0];
    if (course.modules[unitIndex]) {
      const unit = course.modules[unitIndex];
      
      // Skip if the unit has no content yet (is being generated)
      if (!unit.content || unit.content.length === 0 || !unit.content[0]?.modules || unit.content[0]?.modules.length === 0) {
        return;
      }
      
      const subunit = unit.content[0];
      const module = subunit.modules[0];
      
      if (unit && subunit && module) {
        onNavigate(
          unitIndex,
          0,
          0,
          unit.id || '',
          subunit.id || '',
          module.id || ''
        );
      }
    }
  };

  const handleModuleClick = (unitIndex: number, subunitIndex: number, moduleIndex: number) => {
    const unit = course.modules[unitIndex];
    
    // Skip if the unit has no content yet (is being generated)
    if (!unit?.content || !unit.content[subunitIndex]?.modules) {
      console.log("Cannot navigate to unit/subunit with no modules");
      return;
    }

    const subunit = unit.content[subunitIndex];
    
    // Make sure the module exists at the specified index
    if (!subunit.modules || !subunit.modules[moduleIndex]) {
      console.error("Module does not exist at index", moduleIndex);
      return;
    }
    
    const module = subunit.modules[moduleIndex];
    
    // Ensure all required IDs exist
    if (!unit.id || !subunit.id || !module.id) {
      console.error("Missing required IDs for navigation");
      return;
    }
    
    console.log("Navigating to:", {
      unitIndex,
      subunitIndex,
      moduleIndex,
      unitId: unit.id,
      subunitId: subunit.id,
      moduleId: module.id
    });
    
    onNavigate(
      unitIndex,
      subunitIndex,
      moduleIndex,
      unit.id,
      subunit.id,
      module.id
    );
  };

  const completedModulesCount = completedModules.length;
  const totalModulesCount = course.modules.reduce((total, unit) => {
    return total + unit.content.reduce((subTotal, subunit) => {
      return subTotal + (subunit.modules?.length || 0);
    }, 0);
  }, 0);

  return (
    <div className="flex flex-col h-full bg-dark-400/50 rounded-xl border border-dark-300/50 shadow-lg backdrop-blur-sm">
      <CourseProgress
        completedModulesCount={completedModulesCount}
        totalModulesCount={totalModulesCount}
      />
      
      <QuickNavigation
        activeUnit={activeUnit || 0}
        totalUnits={course.modules.length}
        onSliderChange={handleSliderChange}
      />

      <SidebarContent
        course={course}
        openAccordions={openAccordions}
        setOpenAccordions={setOpenAccordions}
        activeUnit={activeUnit}
        activeSubunit={activeSubunit}
        activeModuleId={activeModuleId}
        completedModules={completedModules}
        inProgressModules={inProgressModules}
        handleModuleClick={handleModuleClick}
      />
    </div>
  );
};

export default CourseSidebar;
