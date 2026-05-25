
import React from "react";
import { Loader2 } from "lucide-react";
import CourseLoadingPanel from './CourseLoadingPanel';
import CourseLoadingFooter from './CourseLoadingFooter';
import Logo from "@/components/Logo";
import { Progress } from "@/components/ui/progress";

interface CourseLoadingProps {
  courseTitle?: string;
  units?: {
    title: string;
    status: 'pending' | 'generating' | 'complete';
    modulesCount: number;
    completedModules: number;
    estimatedTime?: number;
  }[];
  currentUnitIndex?: number;
  totalProgress?: number;
  onUnitClick?: (index: number) => void;
}

const CourseLoading: React.FC<CourseLoadingProps> = ({
  courseTitle = "Building Your Course",
  units = [],
  currentUnitIndex = 0,
  totalProgress = 0,
  onUnitClick = () => {}
}) => {
  const displayUnits = Array.isArray(units) ? units : [];

  return (
    <div className="w-full flex flex-col">
      <div className="mb-6">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative mb-6">
            <Logo size="lg" variant="glow" animated={true} />
            <div className="absolute -bottom-1 -right-1">
              <div className="bg-kibi-500 rounded-full p-1.5">
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              </div>
            </div>
          </div>
          
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            {courseTitle}
          </h2>
          
          <div className="w-full max-w-md mb-4">
            <Progress value={totalProgress} className="h-3 bg-dark-300" />
            <p className="text-center text-sm text-gray-400 mt-2">
              {totalProgress}% complete
            </p>
          </div>
        </div>
        
        <div className="border-2 border-dark-300 rounded-2xl overflow-hidden bg-dark-500 p-4 shadow-md">
          <div className="space-y-3 mb-4 px-2">
            {displayUnits.map((unit, index) => (
              <CourseLoadingPanel
                key={index}
                title={unit.title}
                status={unit.status}
                index={index}
                modulesCount={unit.modulesCount}
                completedModules={unit.completedModules}
                estimatedTime={unit.estimatedTime}
                onClick={() => onUnitClick(index)}
              />
            ))}
          </div>
          
          <CourseLoadingFooter
            currentUnitIndex={currentUnitIndex}
            displayUnits={displayUnits}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseLoading;
