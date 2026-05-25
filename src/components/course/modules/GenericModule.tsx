
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getModuleTypeLabel } from '../ModuleTypeBadge';
import { CheckCircle } from 'lucide-react';
import { CourseModule } from '@/types/course';
import { ExtendedCourseModule } from '@/types/extended-course';

interface GenericModuleProps {
  module: CourseModule | ExtendedCourseModule;
  moduleIdx: number;
  onComplete?: () => void;
  isCompleted?: boolean;
}

const GenericModule: React.FC<GenericModuleProps> = ({ module, moduleIdx, onComplete, isCompleted }) => {
  return (
    <Card className="bg-dark-300 mb-6">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="bg-kibi-600 text-white w-8 h-8 rounded-full flex items-center justify-center">
              {moduleIdx + 1}
            </span>
            <h3 className="text-lg font-bold text-white">{module.title}</h3>
          </div>
          {getModuleTypeLabel(module.type)}
        </div>

        <div className="py-4">
          <p className="text-gray-300">This module type ({module.type}) is not fully implemented yet.</p>
        </div>

        {!isCompleted && (
          <div className="flex justify-end mt-4">
            <Button onClick={onComplete} className="bg-kibi-500 hover:bg-kibi-600">
              Mark as Complete
            </Button>
          </div>
        )}
        
        {isCompleted && (
          <div className="flex items-center justify-end mt-4 text-green-500">
            <CheckCircle className="mr-2 h-5 w-5" />
            <span>Completed</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GenericModule;
