
import React from "react";
import { Loader2 } from "lucide-react";

interface CourseLoadingFooterProps {
  currentUnitIndex: number;
  displayUnits: { title: string }[];
}

const CourseLoadingFooter: React.FC<CourseLoadingFooterProps> = ({
  currentUnitIndex,
  displayUnits,
}) => {
  // Make sure displayUnits is an array and has elements
  const safeDisplayUnits = Array.isArray(displayUnits) ? displayUnits : [];
  
  // Check if currentUnitIndex is valid
  const isValidIndex = currentUnitIndex >= 0 && currentUnitIndex < safeDisplayUnits.length;
  const currentTitle = isValidIndex ? safeDisplayUnits[currentUnitIndex].title : "next unit";

  return (
    <div className="flex justify-center mt-6 bg-kibi-800/70 backdrop-blur-sm rounded-b-3xl p-5 shadow-inner border-t-4 border-kibi-700">
      <div className="flex items-center gap-4 text-kibi-100 font-bold cartoon-text text-lg">
        <span className="inline-block">
          <Loader2 className="w-8 h-8 animate-spin text-kibi-200 drop-shadow-md" />
        </span>
        <span>
          {isValidIndex ? (
            <>
              <span className="text-kibi-200 mr-1">Generating:</span>
              <span className="text-white ml-1">{currentTitle}</span>
            </>
          ) : (
            <span className="text-white">Finalizing course...</span>
          )}
        </span>
      </div>
    </div>
  );
};

export default CourseLoadingFooter;
