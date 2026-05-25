import React, { useEffect } from 'react';
import ModuleContent from './ModuleContent';
import { ExtendedCourseModule } from '@/types/extended-course';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronRight } from 'lucide-react';
import Confetti from '@/components/animations/Confetti';
import { CourseModule } from '@/types/course';

interface CourseContentProps {
  module: ExtendedCourseModule;
  moduleIndex: number;
  onComplete: (moduleId: string) => void;
  isCompleted: boolean;
  onNextModule: () => void;
  showConfetti: boolean;
  hasNextModule: boolean;
}

const CourseContent: React.FC<CourseContentProps> = ({
  module,
  moduleIndex,
  onComplete,
  isCompleted,
  onNextModule,
  showConfetti,
  hasNextModule
}) => {
  const [showMarkCompleteButton, setShowMarkCompleteButton] = React.useState(false);
  const [animation, setAnimation] = React.useState<'enter' | 'exit' | null>(null);
  
  useEffect(() => {
    setAnimation('enter');
    const timer = setTimeout(() => setAnimation(null), 500);
    return () => clearTimeout(timer);
  }, [module.id]);

  useEffect(() => {
    setShowMarkCompleteButton(!isCompleted);
  }, [isCompleted, module.id]);

  const handleMarkComplete = () => {
    if (!module.id) {
      console.error("Cannot mark module as complete: Module ID is undefined");
      return;
    }
    
    console.log("Marking module as complete in CourseContent:", module.id);
    onComplete(module.id);
    setShowMarkCompleteButton(false);
  };
  
  const handleNext = () => {
    console.log("Moving to next module");
    setAnimation('exit');
    
    setTimeout(() => {
      onNextModule();
    }, 300);
  };

  useEffect(() => {
    console.log("CourseContent rendered with:", {
      moduleId: module.id,
      isCompleted,
      hasNextModule
    });
  }, [module.id, isCompleted, hasNextModule]);

  return (
    <main className="bg-dark-400 rounded-lg p-6 relative">
      {showConfetti && <Confetti />}
      
      <div className={`transition-all duration-300 ${animation === 'enter' ? 'animate-fade-in' : animation === 'exit' ? 'opacity-0 translate-x-[-20px]' : ''}`}>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-dark-300">
          <div>
            <h1 className="text-2xl font-bold text-white">{module.title}</h1>
            <p className="text-gray-300 text-sm mt-1">Module {moduleIndex + 1}</p>
          </div>
          
          {isCompleted && (
            <div className="flex items-center text-green-400 text-sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              Completed
            </div>
          )}
        </div>
        
        <ModuleContent 
          key={module.id} 
          module={module as CourseModule}
          moduleIdx={moduleIndex}
          onComplete={() => handleMarkComplete()}
          isCompleted={isCompleted}
        />
      </div>
      
      <div className="flex justify-between mt-6 pt-4 border-t border-dark-300">
        {showMarkCompleteButton && !isCompleted && (
          <Button 
            onClick={handleMarkComplete}
            variant="outline"
            className="bg-dark-300 hover:bg-dark-200 border-dark-200 text-white flex items-center gap-2"
          >
            <CheckCircle size={16} />
            Mark Complete
          </Button>
        )}
        
        {hasNextModule && (
          <Button 
            onClick={handleNext}
            className="bg-kibi-500 hover:bg-kibi-600 ml-auto flex items-center gap-2 transition-transform hover:translate-x-1"
          >
            Next Module
            <ChevronRight size={16} />
          </Button>
        )}
      </div>
    </main>
  );
};

export default CourseContent;
