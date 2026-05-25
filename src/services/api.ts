
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/types/course';

// Save a course to Supabase database
export const saveCourseToSupabase = async (courseData: any): Promise<{ courseId?: string; error?: any }> => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const userId = user.id;
    
    // Create the course record - ensure search_text is excluded as it's handled by a database trigger
    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        title: courseData.title || '',
        content: courseData,
        user_id: userId,
        is_public: courseData.is_public !== undefined ? courseData.is_public : true,
        // Explicitly omit search_text field since it's created by the database trigger
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error saving course:', error);
      throw error;
    }
    
    return { courseId: course.id };
  } catch (error) {
    console.error('Error in saveCourseToSupabase:', error);
    return { error };
  }
};

// Track course interaction
export const trackCourseInteraction = async (courseId: string, interactionType: string) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    const userId = user?.user?.id;
    
    const { error } = await supabase
      .from('course_interactions')
      .insert({
        course_id: courseId,
        user_id: userId,
        interaction_type: interactionType,
        session_id: !userId ? crypto.randomUUID() : undefined
      });
      
    if (error) {
      console.error('Error tracking course interaction:', error);
    }
  } catch (error) {
    console.error('Failed to track interaction:', error);
  }
};

// Get public courses
export const getPublicCourses = async (limit = 10, offset = 0) => {
  try {
    // Ensure limit and offset are numbers
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const offsetNum = typeof offset === 'string' ? parseInt(offset, 10) : offset;
    
    const { data, error, count } = await supabase
      .from('courses')
      .select('*, profiles(*)', { count: 'exact' })
      .eq('is_public', true)
      .order('interaction_count', { ascending: false })
      .range(offsetNum, offsetNum + limitNum - 1);
    
    if (error) {
      console.error('Error fetching public courses:', error);
      throw error;
    }
    
    return { courses: data || [], count };
  } catch (error) {
    console.error('Error in getPublicCourses:', error);
    throw error;
  }
};

// Export the OpenAI functions from services/openai.ts
export { generateCourseOutline, generateModuleContent } from './openai';
