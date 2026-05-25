
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookCheck } from "lucide-react";

export interface CourseProgressProps {
  completedModules: number;
  totalModules: number;
}

const CourseProgress: React.FC<CourseProgressProps> = ({ completedModules, totalModules }) => {
  const progressPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

  return (
    <div className="p-4 bg-dark-400 rounded-lg border border-dark-300">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-200">Course Progress</h3>
        <Badge variant="outline" className="bg-kibi-600/20">
          <BookCheck className="w-3 h-3 mr-1" />
          {Math.round(progressPercentage)}%
        </Badge>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      <p className="text-xs text-gray-400 mt-2">
        {completedModules} of {totalModules} modules completed
      </p>
    </div>
  );
}

export default CourseProgress;
