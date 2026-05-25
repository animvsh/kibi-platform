
import React from 'react';
import CourseContentSection from './CourseContentSection';
import { ExtendedCourse } from '@/types/extended-course';

interface CourseMainContentProps {
  course: ExtendedCourse;
  activeUnit: number;
  activeSubunit: number;
  activeModuleId: string | null;
  completedModules: string[];
  inProgressModules: string[];
  hasNextModule: boolean;
  showConfetti: boolean;
  onNavigate: (unitIndex: number, subunitIndex: number, moduleIndex: number, unitId: string, subunitId: string, moduleId: string) => void;
  handleModuleCompletion: (moduleId: string) => void;
  handleNextModule: () => void;
}

const CourseMainContent = ({
  course,
  activeUnit,
  activeSubunit,
  activeModuleId,
  completedModules,
  inProgressModules,
  hasNextModule,
  showConfetti,
  handleModuleCompletion,
  handleNextModule
}: CourseMainContentProps) => {
  return (
    <div className="h-full">
      <CourseContentSection
        course={course}
        activeUnit={activeUnit}
        activeSubunit={activeSubunit}
        activeModuleId={activeModuleId}
        handleModuleCompletion={handleModuleCompletion}
        completedModules={completedModules}
        onNextModule={handleNextModule}
        showConfetti={showConfetti}
        hasNextModule={hasNextModule}
      />
    </div>
  );
};

export default CourseMainContent;
