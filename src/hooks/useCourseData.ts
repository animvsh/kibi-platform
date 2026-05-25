
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/types/course';
import { Json } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useCourseData = (courseId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!courseId) throw new Error('Course ID is required');
      
      console.log("Fetching course data for ID:", courseId);
      
      const { data, error } = await supabase
        .from('courses')
        .select('*, user_id, is_public, is_paid_only, share_token')
        .eq('id', courseId)
        .single();
      
      if (error) {
        console.error("Error fetching course:", error);
        throw error;
      }
      
      if (!data) {
        console.error("No course found with ID:", courseId);
        throw new Error('Course not found');
      }

      // Check access permissions
      if (!data.is_public && data.user_id !== user?.id) {
        throw new Error('You do not have access to this course');
      }

      if (data.is_paid_only) {
        // Here you would check if the user has a paid subscription
        // For now, we'll just show a message
        toast.warning('This is a premium course. Some features may be restricted.');
      }
      
      console.log("Retrieved course data:", data);
      
      // Handle both string and object content formats
      let courseContent: any;
      
      try {
        if (typeof data.content === 'string') {
          courseContent = JSON.parse(data.content);
        } else {
          courseContent = data.content;
        }
      } catch (e) {
        console.error("Error parsing course content:", e);
        courseContent = {
          title: data.title || "Untitled Course",
          modules: []
        };
      }
      
      // Ensure content is properly structured
      if (!courseContent) {
        courseContent = {
          title: data.title || "Untitled Course",
          modules: []
        };
      }
      
      // Check if modules property exists and is an array
      if (!courseContent.modules) {
        courseContent.modules = [];
      } else if (!Array.isArray(courseContent.modules)) {
        console.error("Modules is not an array:", courseContent.modules);
        courseContent.modules = [];
      }
      
      // Ensure each module has content array
      courseContent.modules = courseContent.modules.map((module: any) => {
        if (!module.content) {
          module.content = [];
        }
        return module;
      });
      
      if (!courseContent.title) {
        courseContent.title = data.title || "Untitled Course";
      }
      
      if (!courseContent.description) {
        courseContent.description = "No description provided";
      }

      const extendedCourse = {
        ...courseContent,
        id: data.id,
        user_id: data.user_id,
        is_public: data.is_public,
        is_paid_only: data.is_paid_only,
        share_token: data.share_token
      };
      
      return extendedCourse;
    },
    enabled: !!courseId,
    retry: 1,
    meta: {
      onError: (error: any) => {
        toast.error(`Failed to load course: ${error.message || 'Unknown error'}`);
      }
    }
  });
};
