
import React from 'react';
import { ExtendedCourse } from '@/types/extended-course';
import CourseContent from './CourseContent';
import ModulePlaceholder from './ModulePlaceholder';
import { Loader2 } from 'lucide-react';

interface CourseContentSectionProps {
  course: ExtendedCourse;
  activeUnit: number;
  activeSubunit: number;
  activeModuleId: string | null;
  handleModuleCompletion: (moduleId: string) => void;
  completedModules: string[];
  onNextModule: () => void;
  showConfetti: boolean;
  hasNextModule: boolean;
}

const CourseContentSection: React.FC<CourseContentSectionProps> = ({
  course,
  activeUnit,
  activeSubunit,
  activeModuleId,
  handleModuleCompletion,
  completedModules,
  onNextModule,
  showConfetti,
  hasNextModule
}) => {
  // Get the current module
  const currentModule = activeModuleId ? 
    course.modules[activeUnit]?.content[activeSubunit]?.modules?.find(m => m.id === activeModuleId) : 
    course.modules[activeUnit]?.content[activeSubunit]?.modules?.[0];
  
  // Check if this unit/subunit is being generated (e.g., has no modules)
  const isUnitBeingGenerated = !course.modules[activeUnit]?.content?.[activeSubunit]?.modules?.length;
  
  console.log("CourseContentSection rendering with:", {
    activeUnit,
    activeSubunit,
    activeModuleId,
    isUnitBeingGenerated,
    hasModules: !!course.modules[activeUnit]?.content?.[activeSubunit]?.modules?.length,
    currentModule: currentModule ? currentModule.id : 'none'
  });
  
  // If the unit is being generated, show a loading state
  if (isUnitBeingGenerated) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full">
        <div className="w-16 h-16 bg-dark-300 rounded-full flex items-center justify-center mb-6">
          <Loader2 className="h-8 w-8 text-kibi-500 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Generating Content</h2>
        <p className="text-gray-300 text-center max-w-md mb-6">
          This unit is currently being generated. Please wait a moment while we prepare the content for you.
        </p>
        <div className="w-full max-w-md h-2 bg-dark-300 rounded-full overflow-hidden">
          <div className="h-full bg-kibi-500 animate-pulse" style={{width: '60%'}}></div>
        </div>
      </div>
    );
  }
  
  // If no module is found, show a placeholder
  if (!currentModule) {
    console.log("No module found. Creating placeholder module for Unit:", activeUnit, "Subunit:", activeSubunit);
    
    // Create a placeholder module if none exists
    const placeholderModule = {
      id: `placeholder-module-${Date.now()}`,
      title: "New Module",
      type: 'article' as const,
      description: "This module is being prepared and will be available soon.",
      placeholder: true
    };
    
    return (
      <div className="animate-fade-in">
        <ModulePlaceholder 
          module={placeholderModule}
          onComplete={() => handleModuleCompletion(placeholderModule.id)}
        />
      </div>
    );
  }

  console.log("Rendering module:", currentModule.id, currentModule.title, currentModule.type);

  // Always render the actual content instead of placeholders for DSA demo mode
  return (
    <div className="animate-fade-in">
      <CourseContent
        module={currentModule}
        moduleIndex={course.modules[activeUnit]?.content[activeSubunit]?.modules?.findIndex(m => m.id === currentModule.id) ?? 0}
        onComplete={() => handleModuleCompletion(currentModule.id)}
        isCompleted={completedModules.includes(currentModule.id)}
        onNextModule={onNextModule}
        showConfetti={showConfetti}
        hasNextModule={hasNextModule}
      />
    </div>
  );
};

export default CourseContentSection;
