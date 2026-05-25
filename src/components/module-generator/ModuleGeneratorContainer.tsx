
import React from 'react';
import GenerationProgressBar from './GenerationProgressBar';
import UnitGenerationCard from './UnitGenerationCard';
import { useGenerationProgress } from '@/hooks/useGenerationProgress';
import { UnitStatus } from '@/utils/unitStatusUtils';

interface ModuleGeneratorContainerProps {
  isLoading: boolean;
  error: string | null;
  courseContent: any;
  unitStatuses: UnitStatus[];
  totalProgress: number;
  onUnitClick: (index: number) => void;
}

const ModuleGeneratorContainer: React.FC<ModuleGeneratorContainerProps> = ({
  isLoading,
  error,
  courseContent,
  unitStatuses,
  totalProgress,
  onUnitClick,
}) => {
  const courseId = courseContent?.id;
  const { statuses, overallProgress } = useGenerationProgress(courseId);

  return (
    <div className="space-y-6">
      <GenerationProgressBar
        progress={overallProgress || totalProgress}
        title={courseContent?.title || "Generating Your Course..."}
      />
      
      <div className="space-y-4">
        {unitStatuses.map((unit, index) => (
          <UnitGenerationCard
            key={index}
            title={unit.title}
            status={unit.status}
            index={index}
            onClick={() => onUnitClick(index)}
            progress={
              statuses.find(s => s.module_index === index)?.progress_percent ||
              (unit.status === 'complete' ? 100 : 0)
            }
            error={error && index === 0}
          />
        ))}
      </div>
    </div>
  );
};

export default ModuleGeneratorContainer;
