
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GenerationStatus {
  module_name: string;
  progress_stage: string;
  progress_percent: number;
  module_index: number;
}

export const useGenerationProgress = (courseId: string | null) => {
  const [statuses, setStatuses] = useState<GenerationStatus[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    if (!courseId) return;

    // Initial fetch of existing statuses
    const fetchInitialStatus = async () => {
      const { data } = await supabase
        .from('generation_status')
        .select('*')
        .eq('course_id', courseId)
        .order('module_index', { ascending: true });

      if (data) {
        setStatuses(data);
        updateOverallProgress(data);
      }
    };

    fetchInitialStatus();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('generation_progress')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generation_status',
          filter: `course_id=eq.${courseId}`,
        },
        (payload) => {
          console.log('Generation status update:', payload);
          setStatuses((current) => {
            const newStatuses = [...current];
            
            // Ensure payload.new exists and has the required property
            if (payload.new && typeof payload.new === 'object') {
              // Further check if module_index exists on the payload.new object
              if ('module_index' in payload.new) {
                const moduleIndex = (payload.new as GenerationStatus).module_index;
                const index = newStatuses.findIndex(
                  (s) => s.module_index === moduleIndex
                );
                
                if (index >= 0) {
                  newStatuses[index] = payload.new as GenerationStatus;
                } else {
                  newStatuses.push(payload.new as GenerationStatus);
                }
                
                updateOverallProgress(newStatuses);
              }
            }
            
            return newStatuses;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [courseId]);

  const updateOverallProgress = (currentStatuses: GenerationStatus[]) => {
    if (currentStatuses.length === 0) return;
    
    const totalProgress = currentStatuses.reduce(
      (sum, status) => sum + status.progress_percent,
      0
    );
    
    setOverallProgress(Math.round(totalProgress / currentStatuses.length));
  };

  return {
    statuses,
    overallProgress
  };
};
