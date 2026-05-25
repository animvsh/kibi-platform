
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getModuleIcon, getModuleTypeLabel } from '../../ModuleTypeBadge';

interface EmptyInteractiveArticleProps {
  title: string;
  type: string;
  onComplete?: () => void;
}

const EmptyInteractiveArticle: React.FC<EmptyInteractiveArticleProps> = ({
  title,
  type,
  onComplete
}) => {
  return (
    <Card className="p-4 border-2 border-dark-100 bg-dark-300 mb-6">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <div className="bg-kibi-600/60 p-2 rounded-full">
            {getModuleIcon(type)}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-bold">{title}</h5>
            {getModuleTypeLabel(type)}
          </div>
          
          <div className="text-gray-300 mt-2">
            <p>This interactive article is being prepared. Check back soon!</p>
          </div>
          
          {onComplete && (
            <div className="flex justify-end mt-4">
              <Button onClick={onComplete} className="bg-kibi-500 hover:bg-kibi-600">
                Mark as Complete
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EmptyInteractiveArticle;
