
import React from "react";
import { X, StopCircle, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import { Progress } from "@/components/ui/progress";

interface CourseGenerationMiniStatusProps {
  courseName: string;
  currentUnit: number;
  totalUnits: number;
  animatedProgress: number;
  onStop: () => void;
  onViewStatus: () => void;
}

const CourseGenerationMiniStatus: React.FC<CourseGenerationMiniStatusProps> = ({
  courseName,
  currentUnit,
  totalUnits,
  animatedProgress,
  onStop,
  onViewStatus,
}) => {
  return (
    <div className="fixed bottom-4 left-4 bg-dark-400 border border-dark-300 rounded-lg shadow-xl z-50 w-80">
      <div className="flex items-center justify-between px-4 py-3 bg-dark-500 rounded-t-lg border-b border-dark-300">
        <div className="flex items-center">
          <Logo size="sm" className="mr-2" />
          <h3 className="text-sm font-medium text-white">Generating Course</h3>
        </div>
        <button
          onClick={onStop}
          className="p-1 rounded-md hover:bg-dark-300"
        >
          <X size={16} />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 rounded-full bg-kibi-500 mr-2 flex items-center justify-center">
            <Loader2 className="h-4 w-4 text-white animate-spin" />
          </div>
          <h4 className="text-sm font-medium text-gray-200 truncate">
            {courseName}
          </h4>
        </div>
        
        <div className="mb-2">
          <Progress 
            value={animatedProgress} 
            className="h-2 bg-dark-300 transition-all duration-300" 
          />
          <p className="text-xs text-gray-400 mt-1 flex justify-between">
            <span>
              {currentUnit === 0 
                ? "Setting up course" 
                : `Generating unit ${currentUnit} of ${totalUnits}`}
            </span>
            <span>{Math.round(animatedProgress)}%</span>
          </p>
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={onStop}
            className="px-3 py-1 bg-red-800/30 hover:bg-red-800/50 text-red-400 rounded-md text-xs flex items-center"
          >
            <StopCircle size={14} className="mr-1" /> Stop Generation
          </button>
          <button
            onClick={onViewStatus}
            className="px-3 py-1 bg-dark-300 hover:bg-dark-300/70 text-white rounded-md text-xs"
          >
            View Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseGenerationMiniStatus;
