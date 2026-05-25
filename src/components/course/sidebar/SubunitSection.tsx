
import React from 'react';
import { Check, Circle } from 'lucide-react';
import { ModuleTypeIcon } from './ModuleTypeIcon';
import { ExtendedCourseSubunit } from '@/types/extended-course';
import { toast } from 'sonner';

interface SubunitSectionProps {
  subunit: ExtendedCourseSubunit;
  unitIndex: number;
  subunitIndex: number;
  completedModules: string[];
  inProgressModules: string[];
  activeUnit: number;
  activeSubunit: number;
  activeModuleId: string | null;
  handleModuleClick: (unitIndex: number, subunitIndex: number, moduleIndex: number) => void;
}

const SubunitSection: React.FC<SubunitSectionProps> = ({
  subunit,
  unitIndex,
  subunitIndex,
  completedModules,
  inProgressModules,
  activeUnit,
  activeSubunit,
  activeModuleId,
  handleModuleClick,
}) => {
  const modules = subunit.modules || [];
  
  // Check if this subunit is currently being generated
  const isGenerating = modules.length === 0;
  
  // Handle click with better error handling
  const handleClick = (moduleIndex: number, moduleId?: string) => {
    try {
      console.log(`Navigating to module: Unit=${unitIndex}, Subunit=${subunitIndex}, Module=${moduleIndex}, ID=${moduleId}`);
      handleModuleClick(unitIndex, subunitIndex, moduleIndex);
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Navigation failed. Please try refreshing the page.");
    }
  };

  return (
    <div className="mb-2">
      <div className="px-4 py-2 text-sm font-medium text-gray-300 bg-dark-300 rounded-lg mb-2">
        {subunit.title}
      </div>
      
      {isGenerating ? (
        // Show generating state for subunits without modules
        <div className="pl-4 py-2">
          <div className="flex items-center px-4 py-2 text-sm text-amber-400 rounded-lg">
            <span className="mr-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            <span>Generating content...</span>
          </div>
        </div>
      ) : (
        // Show modules if they exist
        <div className="space-y-1 pl-4">
          {modules.map((module, moduleIndex) => {
            if (!module || !module.id) return null;
            
            const isCompleted = completedModules.includes(module.id);
            const isInProgress = inProgressModules.includes(module.id);
            const isActive = activeUnit === unitIndex && 
                           activeSubunit === subunitIndex && 
                           activeModuleId === module.id;
            
            return (
              <button
                key={module.id}
                onClick={() => handleClick(moduleIndex, module.id)}
                className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-all transform hover:scale-102 ${
                  isActive 
                    ? 'bg-kibi-500 text-white shadow-[0_4px_0_rgba(0,0,0,0.2)] -translate-y-0.5 hover:shadow-[0_2px_0_rgba(0,0,0,0.2)] hover:translate-y-0' 
                    : isCompleted 
                      ? 'text-gray-200 hover:bg-dark-300' 
                      : 'text-gray-400 hover:bg-dark-300 hover:text-gray-200'
                }`}
                data-module-id={module.id}
              >
                <span className="mr-2">
                  {isCompleted ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : isInProgress ? (
                    <Circle className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <ModuleTypeIcon type={module.type} />
                  )}
                </span>
                <span className="text-left truncate">{module.title}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubunitSection;
