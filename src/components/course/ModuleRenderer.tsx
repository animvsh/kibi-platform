
import React from 'react';
import { CourseModule } from '@/types/course';
import ArticleModuleComponent from './modules/ArticleModule';
import LectureModuleComponent from './modules/LectureModule';
import InteractiveLectureModuleComponent from './modules/InteractiveLectureModule';
import CodeModuleComponent from './modules/CodeModule';
import SimulationModuleComponent from './modules/SimulationModule';
import QuizModuleComponent from './modules/QuizModule'; // Updated import path
import FlashcardModuleComponent from './modules/FlashcardModule';
import ReviewSummaryModuleComponent from './modules/ReviewSummaryModule';
import InteractiveArticleModuleComponent from './modules/InteractiveArticleModule';
import GenericModuleComponent from './modules/GenericModule';
import { 
  isArticleModule,
  isLectureModule,
  isInteractiveLectureModule,
  isCodeModule,
  isSimulationModule,
  isQuizModule,
  isFlashcardModule,
  isReviewModule,
  isInteractiveArticleModule
} from '@/utils/moduleTypeGuards';
import { adaptQuizModuleForComponent } from '@/utils/moduleAdapters';

interface ModuleRendererProps {
  module: CourseModule;
  moduleIdx: number;
  onComplete?: () => void;
  isCompleted?: boolean;
}

const ModuleRenderer: React.FC<ModuleRendererProps> = ({
  module,
  moduleIdx,
  onComplete,
  isCompleted
}) => {
  console.log("ModuleRenderer rendering:", {
    type: module.type,
    id: module.id || 'no-id',
    hasQuestions: isQuizModule(module) && !!(module as any).questions?.length,
    hasContent: isArticleModule(module) && !!(module as any).content
  });

  if (isArticleModule(module)) {
    return <ArticleModuleComponent module={module} moduleIdx={moduleIdx} onComplete={onComplete} isCompleted={isCompleted} />;
  }
  if (isLectureModule(module)) {
    return <LectureModuleComponent module={module} moduleIdx={moduleIdx} onComplete={onComplete} isCompleted={isCompleted} />;
  }
  if (isInteractiveLectureModule(module)) {
    return <InteractiveLectureModuleComponent module={module} moduleIdx={moduleIdx} onComplete={onComplete} isCompleted={isCompleted} />;
  }
  if (isCodeModule(module)) {
    return <CodeModuleComponent module={module} moduleIdx={moduleIdx} onComplete={onComplete} isCompleted={isCompleted} />;
  }
  if (isSimulationModule(module)) {
    return <SimulationModuleComponent module={module} moduleIdx={moduleIdx} onComplete={onComplete} isCompleted={isCompleted} />;
  }
  if (isQuizModule(module)) {
    const adaptedModule = adaptQuizModuleForComponent(module);
    
    return <QuizModuleComponent 
      module={adaptedModule}
      moduleIdx={moduleIdx} 
      onComplete={onComplete} 
      isCompleted={isCompleted} 
    />;
  }
  if (isFlashcardModule(module)) {
    return <FlashcardModuleComponent module={module} moduleIdx={moduleIdx} onComplete={onComplete} isCompleted={isCompleted} />;
  }
  if (isReviewModule(module)) {
    return <ReviewSummaryModuleComponent module={module} moduleIdx={moduleIdx} onComplete={onComplete} isCompleted={isCompleted} />;
  }
  if (isInteractiveArticleModule(module)) {
    return <InteractiveArticleModuleComponent 
      module={module}
      moduleIdx={moduleIdx} 
      onComplete={onComplete} 
      isCompleted={isCompleted} 
    />;
  }

  return <GenericModuleComponent module={module} moduleIdx={moduleIdx} onComplete={onComplete} isCompleted={isCompleted} />;
};

export default ModuleRenderer;
