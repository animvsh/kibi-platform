
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { GenerateOutlineResponse } from '@/types/course';

export interface UseModuleGeneratorOutlineResult {
  outline: GenerateOutlineResponse | null;
  searchQuery: string | null;
  error: string | null;
  isLoading: boolean;
}

export function useModuleGeneratorOutline(): UseModuleGeneratorOutlineResult {
  const location = useLocation();
  const [outline, setOutline] = useState<GenerateOutlineResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setError(null);
    
    const loadOutline = async () => {
      try {
        // First try to get outline from location state (highest priority)
        if (location.state?.outline) {
          const locationOutline = location.state.outline;
          const locationSearchQuery = location.state.searchQuery;

          console.log("Found outline in location state:", locationOutline);
          
          // Validate outline structure
          if (!locationOutline.title || !Array.isArray(locationOutline.units)) {
            throw new Error("Invalid outline format");
          }
          
          // Save the outline to session storage for persistence
          sessionStorage.setItem('course_outline', JSON.stringify(locationOutline));
          if (locationSearchQuery) {
            sessionStorage.setItem('course_search_query', locationSearchQuery);
          }
          
          if (isMounted) {
            setOutline(locationOutline);
            setSearchQuery(locationSearchQuery || null);
            setIsLoading(false);
          }
          return;
        }

        // If no outline in location state, try to get from session storage
        const storedOutline = sessionStorage.getItem('course_outline');
        const storedSearchQuery = sessionStorage.getItem('course_search_query');
        
        if (storedOutline) {
          console.log("Found outline in session storage");
          try {
            const parsedOutline = JSON.parse(storedOutline);
            
            // Validate outline structure
            if (!parsedOutline.title || !Array.isArray(parsedOutline.units)) {
              throw new Error("Invalid stored outline format");
            }
            
            if (isMounted) {
              setOutline(parsedOutline);
              setSearchQuery(storedSearchQuery);
              setIsLoading(false);
            }
          } catch (parseError) {
            console.error("Error parsing stored outline:", parseError);
            throw new Error("Invalid stored outline format");
          }
        } else {
          console.log("No outline found in session storage");
          if (isMounted) {
            setError("No course outline found. Please create one first.");
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error("Error in useModuleGeneratorOutline:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "An unexpected error occurred");
          setIsLoading(false);
          
          // Clear invalid storage on error
          if ((err instanceof Error) && err.message.includes("Invalid")) {
            sessionStorage.removeItem('course_outline');
            sessionStorage.removeItem('course_search_query');
          }
        }
      }
    };

    loadOutline();

    return () => {
      isMounted = false;
    };
  }, [location.state]);

  return { outline, searchQuery, error, isLoading };
}
