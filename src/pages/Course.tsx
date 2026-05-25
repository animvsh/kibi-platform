
import React from 'react';
import { useParams } from 'react-router-dom';
import HomeLayout from '@/components/home/HomeLayout';
import { useCourseData } from '@/hooks/useCourseData';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useCourseState } from '@/hooks/useCourseState';
import { useModuleProgress } from '@/hooks/useModuleProgress';
import { useCourseNavigation } from '@/hooks/useCourseNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import CourseLoading from '@/components/course/CourseLoading';
import { CourseNotFound } from '@/components/course/CourseNotFound';
import CourseHeader from '@/components/course/CourseHeader';
import CourseMainContent from '@/components/course/CourseMainContent';
import CourseSidebar from '@/components/course/CourseSidebar';
import Confetti from '@/components/animations/Confetti';

const Course = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const { data: course, isLoading: courseLoading, error: courseError } = useCourseData(courseId);
  const { progress, isLoading: progressLoading, updateProgress } = useUserProgress(courseId);
  
  const {
    activeUnit,
    activeSubunit,
    activeModuleIndex,
    activeModuleId,
    inProgressModules,
    showConfetti,
    setActiveUnit,
    setActiveSubunit,
    setActiveModuleIndex,
    setActiveModuleId,
    setInProgressModules,
    setShowConfetti
  } = useCourseState(course, progress);

  const { handleModuleCompletion, handleModuleStart } = useModuleProgress(
    progress,
    updateProgress,
    inProgressModules,
    setInProgressModules,
    setShowConfetti
  );

  const { handleNavigation, handleNextModule } = useCourseNavigation(
    course,
    updateProgress,
    handleModuleStart
  );

  // Set initial module when course loads
  React.useEffect(() => {
    if (course && course.modules?.length > 0 && !activeModuleId) {
      console.log("Course loaded with modules:", course.modules.length);
      
      // Find first unit with content
      for (let unitIdx = 0; unitIdx < course.modules.length; unitIdx++) {
        const unit = course.modules[unitIdx];
        if (unit && unit.content && unit.content.length > 0) {
          
          // Find first subunit with modules
          for (let subunitIdx = 0; subunitIdx < unit.content.length; subunitIdx++) {
            const subunit = unit.content[subunitIdx];
            if (subunit && subunit.modules && subunit.modules.length > 0) {
              
              // Find first module with an ID
              for (let moduleIdx = 0; moduleIdx < subunit.modules.length; moduleIdx++) {
                const module = subunit.modules[moduleIdx];
                if (module && module.id) {
                  console.log("Setting initial module:", module.title, module.id);
                  
                  // Set as active module
                  handleNavigation(
                    unitIdx,
                    subunitIdx, 
                    moduleIdx,
                    unit.id || '',
                    subunit.id || '',
                    module.id
                  );
                  
                  // Only need to find one valid module
                  return;
                }
              }
            }
          }
        }
      }
    }
  }, [course, activeModuleId, handleNavigation]);

  if (courseLoading || progressLoading) {
    return (
      <HomeLayout>
        <CourseLoading />
      </HomeLayout>
    );
  }

  if (courseError || !course) {
    console.error("Course error or not found:", courseError);
    return (
      <HomeLayout>
        <CourseNotFound />
      </HomeLayout>
    );
  }

  const modules = course.modules || [];
  if (modules.length === 0) {
    toast.error("This course has no content. Please try another course.");
    return (
      <HomeLayout>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center p-8 bg-dark-400 rounded-xl max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">Empty Course</h2>
            <p className="text-gray-300 mb-4">This course doesn't have any content yet.</p>
          </div>
        </div>
      </HomeLayout>
    );
  }
  
  const isOwner = user?.id === course.user_id;
  const hasNextModule = 
    activeModuleIndex !== null && 
    activeUnit !== null && 
    activeSubunit !== null && 
    course.modules[activeUnit]?.content?.[activeSubunit]?.modules &&
    ((activeModuleIndex < (course.modules[activeUnit]?.content[activeSubunit]?.modules?.length || 0) - 1) ||
    (activeSubunit < course.modules[activeUnit]?.content?.length - 1) ||
    (activeUnit < course.modules?.length - 1));

  return (
    <HomeLayout>
      {showConfetti && <Confetti />}
      
      <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-gradient-to-b from-dark-500 to-dark-600">
        <CourseHeader
          title={course?.title || "Loading..."}
          courseId={course?.id || ""}
          shareToken={course?.share_token}
          isOwner={isOwner}
          className="border-b border-dark-300/50 backdrop-blur-xl bg-dark-400/50"
        />
        
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex gap-6 p-6">
            <div className="w-80 flex-shrink-0">
              <CourseSidebar
                course={course}
                activeUnit={activeUnit}
                activeSubunit={activeSubunit}
                activeModuleId={activeModuleId}
                completedModules={progress?.completed_modules || []}
                inProgressModules={inProgressModules}
                onNavigate={handleNavigation}
              />
            </div>
            
            <div className="flex-1 overflow-auto">
              <CourseMainContent
                course={course}
                activeUnit={activeUnit}
                activeSubunit={activeSubunit}
                activeModuleId={activeModuleId}
                completedModules={progress?.completed_modules || []}
                inProgressModules={inProgressModules}
                hasNextModule={hasNextModule}
                showConfetti={showConfetti}
                onNavigate={handleNavigation}
                handleModuleCompletion={handleModuleCompletion}
                handleNextModule={() => handleNextModule(
                  activeUnit,
                  activeSubunit,
                  activeModuleIndex !== null ? activeModuleIndex : 0,
                  setActiveUnit,
                  setActiveSubunit,
                  setActiveModuleIndex,
                  setActiveModuleId
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};

export default Course;
