
import React from 'react';
import { CheckCircle } from "lucide-react";
import ModuleContent from './ModuleContent';
import { CourseUnit } from '@/types/course';

interface UnitContentTabProps {
  unit: CourseUnit;
  unitIdx: number;
}

const UnitContentTab: React.FC<UnitContentTabProps> = ({ unit, unitIdx }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="p-4 border-2 border-kibi-500 rounded-xl bg-dark-400">
        <h3 className="text-xl font-bold mb-2">{unit.title}</h3>
        <p className="text-gray-300">{unit.introduction}</p>
      </div>
      
      {unit.content.map((subunit, subunitIdx) => (
        <div key={subunitIdx} className="border-2 border-dark-200 rounded-xl overflow-hidden">
          <div className="bg-dark-300 p-4 border-b border-dark-200">
            <h4 className="text-lg font-bold flex items-center">
              <CheckCircle className="h-5 w-5 text-kibi-400 mr-2" />
              {subunit.title}
            </h4>
          </div>
          
          <div className="p-4 space-y-4">
            {subunit.modules?.map((module, moduleIdx) => (
              <ModuleContent 
                key={moduleIdx} 
                module={module} 
                moduleIdx={moduleIdx} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UnitContentTab;
