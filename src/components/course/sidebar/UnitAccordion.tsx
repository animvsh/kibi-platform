import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2 } from 'lucide-react';
import { ExtendedCourseUnit } from '@/types/extended-course';
import SubunitSection from './SubunitSection';
import GenerationIndicator from '../GenerationIndicator';

interface UnitAccordionProps {
  unit: ExtendedCourseUnit;
  unitIndex: number;
  activeUnit: number;
  activeSubunit: number;
  activeModuleId: string | null;
  completedModules: string[];
  inProgressModules: string[];
  handleModuleClick: (unitIndex: number, subunitIndex: number, moduleIndex: number) => void;
}

const UnitAccordion: React.FC<UnitAccordionProps> = ({
  unit,
  unitIndex,
  activeUnit,
  activeSubunit,
  activeModuleId,
  completedModules,
  inProgressModules,
  handleModuleClick
}) => {
  const isGenerating = !unit.content || unit.content.length === 0;

  const unitModules = unit.content?.flatMap(subunit => subunit.modules || []) || [];
  const completedModulesInUnit = unitModules
    .filter(module => module && module.id)
    .filter(module => completedModules.includes(module.id));
  
  const progressPercentage = unitModules.length > 0 
    ? Math.round((completedModulesInUnit.length / unitModules.length) * 100) 
    : 0;

  return (
    <AccordionItem
      value={`unit-${unitIndex}`}
      className="bg-dark-300/50 rounded-lg border border-dark-300/50 overflow-hidden transition-colors hover:bg-dark-300/70"
    >
      <AccordionTrigger className="px-4 py-3 text-sm font-medium text-gray-200 hover:text-white hover:no-underline data-[state=open]:bg-dark-300/70">
        <span className="flex items-center w-full justify-between">
          <span className="flex items-center">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center mr-2 text-sm bg-kibi-500 text-white shadow-sm">
              {unitIndex + 1}
            </div>
            <span className="text-left">{unit.title}</span>
          </span>
          
          {isGenerating && (
            <span className="ml-auto mr-4 text-amber-400 text-xs flex items-center">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Generating
            </span>
          )}
        </span>
      </AccordionTrigger>
      <AccordionContent className="bg-dark-400/30 p-2">
        {isGenerating ? (
          <div className="p-4">
            <GenerationIndicator type="unit" message="Generating unit content..." />
          </div>
        ) : (
          <>
            {unit.content && unit.content.map((subunit, subunitIndex) => (
              <SubunitSection
                key={`subunit-${unitIndex}-${subunitIndex}`}
                subunit={subunit}
                unitIndex={unitIndex}
                subunitIndex={subunitIndex}
                activeUnit={activeUnit}
                activeSubunit={activeSubunit}
                activeModuleId={activeModuleId}
                completedModules={completedModules}
                inProgressModules={inProgressModules}
                handleModuleClick={handleModuleClick}
              />
            ))}
            
            {!isGenerating && unitModules.length > 0 && (
              <div className="px-4 py-2 mt-2">
                <div className="w-full h-1 bg-dark-300 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-kibi-500 transition-all duration-500 ease-out" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-gray-400 flex justify-between">
                  <span>{completedModulesInUnit.length} completed</span>
                  <span>{progressPercentage}%</span>
                </div>
              </div>
            )}
          </>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default UnitAccordion;
