
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import UnitAccordion from './UnitAccordion';
import { ExtendedCourse } from '@/types/extended-course';

interface SidebarContentProps {
  course: ExtendedCourse;
  openAccordions: string[];
  setOpenAccordions: (value: string[]) => void;
  activeUnit: number | null;
  activeSubunit: number | null;
  activeModuleId: string | null;
  completedModules: string[];
  inProgressModules: string[];
  handleModuleClick: (unitIndex: number, subunitIndex: number, moduleIndex: number) => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  course,
  openAccordions,
  setOpenAccordions,
  activeUnit,
  activeSubunit,
  activeModuleId,
  completedModules,
  inProgressModules,
  handleModuleClick
}) => {
  return (
    <ScrollArea className="flex-1 px-2">
      <Accordion
        type="multiple"
        value={openAccordions}
        onValueChange={setOpenAccordions}
        className="space-y-2 py-2"
      >
        {course.modules.map((unit, unitIndex) => (
          <UnitAccordion
            key={`unit-${unitIndex}`}
            unit={unit}
            unitIndex={unitIndex}
            activeUnit={activeUnit !== null ? activeUnit : 0}
            activeSubunit={activeSubunit !== null ? activeSubunit : 0}
            activeModuleId={activeModuleId}
            completedModules={completedModules}
            inProgressModules={inProgressModules}
            handleModuleClick={handleModuleClick}
          />
        ))}
      </Accordion>
    </ScrollArea>
  );
};

export default SidebarContent;
