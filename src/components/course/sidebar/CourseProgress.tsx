
import React from 'react';

interface CourseProgressProps {
  completedModulesCount: number;
  totalModulesCount: number;
}

const CourseProgress: React.FC<CourseProgressProps> = ({
  completedModulesCount,
  totalModulesCount
}) => {
  const progressPercentage = totalModulesCount > 0 
    ? (completedModulesCount / totalModulesCount) * 100 
    : 0;

  return (
    <div className="p-4 border-b border-dark-300/50">
      <h3 className="text-white text-sm font-medium mb-2">Course Progress</h3>
      <div className="w-full bg-dark-300/50 h-2 rounded-full mb-1 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-kibi-400 to-kibi-600 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>{completedModulesCount} completed</span>
        <span>{totalModulesCount} total</span>
      </div>
    </div>
  );
};

export default CourseProgress;
