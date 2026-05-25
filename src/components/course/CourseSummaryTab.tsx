
import React from 'react';
import { Card } from "@/components/ui/card";
import { getModuleIcon } from './ModuleTypeBadge';
import { CourseUnit } from '@/types/course';

interface CourseSummaryTabProps {
  units: CourseUnit[];
}

const CourseSummaryTab: React.FC<CourseSummaryTabProps> = ({ units }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {units.map((unit, unitIdx) => (
        <Card key={unitIdx} className="p-4 border-2 border-dark-100 bg-dark-300">
          <h3 className="text-xl font-bold mb-3 flex items-center">
            <span className="bg-kibi-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">
              {unitIdx + 1}
            </span>
            {unit.title}
          </h3>
          
          <div className="pl-11 space-y-2">
            {unit.content.map((subunit, subIdx) => (
              <div key={subIdx} className="border-l-2 border-dark-100 pl-4 pb-3">
                <h4 className="text-lg font-semibold mb-2">{subunit.title}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {subunit.modules?.map((module, moduleIdx) => (
                    <div key={moduleIdx} className="flex items-center gap-2 text-sm">
                      {getModuleIcon(module.type)}
                      <span className="text-gray-300 truncate">{module.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CourseSummaryTab;
