
import React from 'react';
import { Sparkles, BookOpen } from 'lucide-react';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ModuleGeneratorHeader = () => {
  const { isDemoMode } = useDemoMode();
  
  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-kibi-500" />
        <h2 className="text-2xl font-bold text-white">Course Generator</h2>
      </div>
      
      <p className="text-gray-400">
        Creating your course content. This may take a few minutes as we generate high-quality educational materials.
      </p>
      
      {isDemoMode && (
        <Alert className="bg-kibi-600/30 border border-kibi-500">
          <Sparkles className="h-4 w-4 text-kibi-400" />
          <AlertDescription className="text-white">
            Demo Mode is enabled. Only generating articles, videos, quizzes, and reviews.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ModuleGeneratorHeader;
