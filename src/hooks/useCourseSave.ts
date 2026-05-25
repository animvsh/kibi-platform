
import { useState } from 'react';
import { saveCourseToSupabase } from "@/services/api";
import { Course, CourseModule, CourseSubunit, CourseUnit } from "@/types/course";
import { toast } from "sonner";

interface Module {
  title: string;
  description: string;
  content?: {
    conceptContent: string;
    codeContent?: {
      explanation: string;
      snippet: string;
      language: string;
    };
    videoIds?: string[];
  };
}

export const useCourseSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);

  const saveCourse = async (modules: Module[], inputText: string) => {
    if (isSaving) return null;
    
    setIsSaving(true);
    try {
      console.log("Starting course save process with modules:", modules.length);
      
      if (!modules || modules.length === 0) {
        throw new Error("No modules to save");
      }
      
      const courseData: Course = {
        title: inputText || "Untitled Course",
        description: inputText || "No description provided",
        modules: modules.map(module => {
          // First create a properly typed CourseUnit
          const courseUnit: CourseUnit = {
            title: module.title,
            introduction: module.description,
            content: []
          };
          
          // Only add content if it exists
          if (module.content) {
            // Create a properly typed CourseSubunit
            const subunit: CourseSubunit = {
              title: module.title,
              modules: []
            };
            
            // Add Article module (concept content)
            if (module.content.conceptContent) {
              const articleModule: CourseModule = {
                type: 'article',
                title: module.title,
                content: module.content.conceptContent
              };
              subunit.modules.push(articleModule);
            }
            
            // Add Lecture module (video content) if videoIds exist
            if (module.content.videoIds && module.content.videoIds.length > 0) {
              const lectureModule: CourseModule = {
                type: 'lecture',
                title: `${module.title} Video`,
                searchKeyword: module.content.videoIds.join(',')
              };
              subunit.modules.push(lectureModule);
            }
            
            // Add Code module (code practice) if codeContent exists
            if (module.content.codeContent) {
              const codeModule: CourseModule = {
                type: 'code',
                title: `${module.title} Practice`,
                description: module.content.codeContent.explanation,
                prompt: module.content.codeContent.snippet
              };
              subunit.modules.push(codeModule);
            }
            
            // Only add the subunit if it has modules
            if (subunit.modules.length > 0) {
              courseUnit.content.push(subunit);
            }
          }
          
          return courseUnit;
        }).filter(unit => {
          // Filter out any units that don't have content
          return unit.content && unit.content.length > 0;
        })
      };
      
      // Log what we're saving to help debug
      console.log("Saving course with title:", courseData.title);
      console.log("Course has modules:", courseData.modules?.length);
      
      if (!courseData.modules || courseData.modules.length === 0) {
        throw new Error("Course has no valid modules with content");
      }
      
      // Always set is_public to true when creating a new course
      const response = await saveCourseToSupabase({
        ...courseData, 
        is_public: true
      });
      
      if (response && response.courseId) {
        setSaveComplete(true);
        toast.success("Course saved successfully!");
        return response.courseId;
      } else if (response && response.error) {
        console.error("Error response:", response.error);
        throw new Error(response.error.message || "Failed to save course");
      } else {
        throw new Error("Unknown error saving course");
      }
    } catch (error) {
      console.error("Error saving course:", error);
      toast.error(`Failed to save course: ${error.message || 'Please try again'}`);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveComplete,
    saveCourse
  };
};
