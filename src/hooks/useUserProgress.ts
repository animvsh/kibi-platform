
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/types/course';

export function useUserProgress(courseId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: progress, isLoading } = useQuery({
    queryKey: ['user-progress', courseId],
    queryFn: async () => {
      if (!user || !courseId) return null;

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Cast the data to Progress type
      return data as Progress | null;
    },
    enabled: !!user && !!courseId,
  });

  const updateProgress = useMutation({
    mutationFn: async (updates: Partial<Progress>) => {
      if (!user || !courseId) throw new Error('User or course ID missing');

      const { data, error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          ...updates,
          last_active: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      
      // Cast the data to Progress type
      return data as Progress;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-progress', courseId] });
    },
  });

  return {
    progress,
    isLoading,
    updateProgress
  };
}
