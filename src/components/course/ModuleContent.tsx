
import React from 'react';
import { CourseModule } from '@/types/course';
import { useModuleEnhancement } from '@/hooks/useModuleEnhancement';
import ModuleRenderer from './ModuleRenderer';

interface ModuleContentProps {
  module: CourseModule;
  moduleIdx: number;
  onComplete?: () => void;
  isCompleted?: boolean;
}

const ModuleContent: React.FC<ModuleContentProps> = ({ 
  module, 
  moduleIdx, 
  onComplete = () => {}, 
  isCompleted = false 
}) => {
  const enhancedModule = useModuleEnhancement(module);
  
  // Log the module to help debug
  console.log("ModuleContent rendering:", {
    moduleType: module.type,
    moduleId: module.id || 'no-id',
    hasQuestions: module.type === 'quiz' && 
      (('content_json' in module && !!module.content_json?.questions?.length) ||
       ('questions' in module && !!(module as any).questions?.length)),
    hasContent: module.type === 'article' && ('content' in module) ? !!module.content : false
  });
  
  const handleComplete = () => {
    console.log("Module completion triggered");
    if (onComplete && typeof onComplete === 'function') {
      onComplete();
    }
  };

  return (
    <ModuleRenderer
      module={enhancedModule}
      moduleIdx={moduleIdx}
      onComplete={handleComplete}
      isCompleted={isCompleted}
    />
  );
};

export default ModuleContent;
