
import React from 'react';
import { InteractiveArticleModule as InteractiveArticleModuleType } from '@/types/modules/interactive-article';
import EmptyInteractiveArticle from './interactive/EmptyInteractiveArticle';
import InteractiveArticleViewer from './InteractiveArticleViewer';

interface InteractiveArticleModuleProps {
  module: InteractiveArticleModuleType;
  moduleIdx: number;
  onComplete?: () => void;
  isCompleted?: boolean;
}

const InteractiveArticleModule: React.FC<InteractiveArticleModuleProps> = ({
  module,
  moduleIdx,
  onComplete,
  isCompleted = false
}) => {
  if (!module.content) {
    return (
      <EmptyInteractiveArticle
        title={module.title}
        type={module.type}
        onComplete={onComplete}
      />
    );
  }

  return (
    <InteractiveArticleViewer
      moduleId={module.id}
      title={module.title}
      content={module.content}
      onComplete={onComplete || (() => {})}
      isCompleted={isCompleted}
    />
  );
};

export default InteractiveArticleModule;
