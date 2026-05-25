
// Simplify navigation tabs style with neutral colors and no bright saturation
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModuleNavigationProps } from './types';

const ModuleNavigation: React.FC<ModuleNavigationProps> = ({
  courseContent,
  activeTab,
  setActiveTab,
}) => {
  if (!courseContent?.modules) return null;

  return (
    <TabsList className="w-full overflow-x-auto flex-nowrap whitespace-nowrap mb-6 p-1 bg-gray-100 border border-gray-300 rounded-md">
      {courseContent.modules.map((module, index) => (
        <TabsTrigger
          key={index}
          value={index.toString()}
          className="flex-shrink-0 text-gray-700 hover:text-gray-900"
        >
          <div className="flex items-center">
            <span className="bg-gray-300 text-gray-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm font-semibold">
              {index + 1}
            </span>
            <span className="truncate max-w-[150px]">
              {module.title.split(' ').slice(0, 3).join(' ')}
            </span>
          </div>
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default ModuleNavigation;

