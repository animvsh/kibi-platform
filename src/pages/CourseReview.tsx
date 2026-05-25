
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HomeLayout from '@/components/home/HomeLayout';
import { saveCourseToSupabase } from '@/services/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import EmptyCourseState from '@/components/course/EmptyCourseState';
import CourseReviewActions from '@/components/course/CourseReviewActions';
import { useCourseGeneration } from '@/contexts/CourseGenerationContext';
import { Progress } from '@/components/ui/progress';

const CourseReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { generationData } = useCourseGeneration();
  
  // Get state data with fallback to session storage
  const getStateData = () => {
    const locationCourseContent = location.state?.courseContent;
    const locationOutline = location.state?.outline;
    const locationSearchQuery = location.state?.searchQuery;
    const isGenerating = location.state?.isGenerating;
    
    if (locationCourseContent) {
      // Save to session storage for persistence
      sessionStorage.setItem('course_content', JSON.stringify(locationCourseContent));
      
      if (locationOutline) {
        sessionStorage.setItem('course_outline', JSON.stringify(locationOutline));
      }
      
      if (locationSearchQuery) {
        sessionStorage.setItem('course_input_text', locationSearchQuery);
      }
      
      return { 
        courseContent: locationCourseContent, 
        outline: locationOutline, 
        inputText: locationSearchQuery,
        isGenerating
      };
    }
    
    // Try to restore from session storage
    try {
      const storedContent = sessionStorage.getItem('course_content');
      const storedOutline = sessionStorage.getItem('course_outline');
      const storedInputText = sessionStorage.getItem('course_input_text');
      
      if (storedContent) {
        return {
          courseContent: JSON.parse(storedContent),
          outline: storedOutline ? JSON.parse(storedOutline) : null,
          inputText: storedInputText,
          // If we're restoring from storage and there's active generation, we're likely still generating
          isGenerating: generationData && generationData.isActive
        };
      }
    } catch (err) {
      console.error("Error parsing stored data:", err);
    }
    
    return { 
      courseContent: null, 
      outline: null, 
      inputText: null, 
      isGenerating: false 
    };
  };
  
  const { courseContent, outline, inputText, isGenerating } = getStateData();
  
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSaveCourse = async () => {
    if (!courseContent) {
      toast.error('No course content to save');
      return;
    }
    
    setIsSaving(true);
    try {
      const courseTitle = courseContent.title || inputText || "Generated Course";
      const courseDescription = courseContent.description || "An interactive learning course";
      
      const courseData = {
        title: courseTitle,
        description: courseDescription,
        content: courseContent,
        tags: [],
        level: 'beginner',
        duration: '1h',
        topics: []
      };
      
      console.log("Saving course data:", courseData);
      
      const response = await saveCourseToSupabase(courseData);
      
      console.log("Save course response:", response);
      
      if (response?.courseId) {
        toast.success("Course saved successfully!");
        
        // Clear session storage data after successful save
        sessionStorage.removeItem('course_content');
        sessionStorage.removeItem('course_outline');
        sessionStorage.removeItem('course_input_text');
        
        // Wait a moment to ensure the database has been updated
        setTimeout(() => {
          // Navigate to the course page
          navigate(`/course/${response.courseId}`);
        }, 500);
      } else {
        toast.error("Failed to save course.");
      }
    } catch (error: any) {
      console.error("Error saving course:", error);
      toast.error(`Error saving course: ${error.message || 'Please try again'}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!courseContent) {
    return (
      <HomeLayout>
        <div className="container mx-auto px-4 py-8">
          <EmptyCourseState inputText={inputText} />
        </div>
      </HomeLayout>
    );
  }
  
  return (
    <HomeLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-dark-400 p-6 rounded-xl border-4 border-kibi-600">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white cartoon-text">Course Review</h1>
            
            {isGenerating && generationData && (
              <div className="flex items-center gap-2 bg-kibi-500/20 px-3 py-1 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-kibi-400" />
                <p className="text-sm text-kibi-300">
                  Generation in progress: {Math.round(generationData.progress)}%
                </p>
              </div>
            )}
          </div>
          
          {isGenerating && generationData && (
            <div className="mb-6 p-3 bg-dark-500 rounded-lg">
              <p className="text-sm text-yellow-300 mb-2">
                Note: This course is still being generated. You can save now with the current content,
                or wait for generation to complete for the full course.
              </p>
              <Progress 
                value={generationData.progress} 
                className="h-2 bg-dark-300 transition-all duration-300" 
              />
            </div>
          )}
          
          <div className="mb-6 p-4 border-2 border-kibi-500 rounded-xl bg-dark-400">
            <h2 className="text-2xl font-bold mb-2 text-white cartoon-text">{courseContent.title}</h2>
            <p className="text-gray-300">{courseContent.description}</p>
          </div>
          
          <div className="space-y-6">
            {courseContent.modules && courseContent.modules.map((module, index) => (
              <div key={index} className="p-4 border-2 border-dark-200 rounded-xl bg-dark-300">
                <h3 className="text-xl font-bold mb-2">{module.title}</h3>
                <p className="text-gray-300">{module.introduction}</p>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {module.content && module.content.map((subunit, subIndex) => (
                    <div key={subIndex} className="p-3 border border-dark-100 rounded-lg bg-dark-400">
                      <h4 className="font-bold text-kibi-400">{subunit.title}</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        {subunit.modules ? `${subunit.modules.length} learning activities` : 'No activities'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <CourseReviewActions
            onSave={handleSaveCourse}
            isSaving={isSaving}
            outline={outline}
            inputText={inputText}
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </HomeLayout>
  );
};

export default CourseReview;
