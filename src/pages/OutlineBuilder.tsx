
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { FileText, Info, AlertTriangle } from "lucide-react";
import HomeLayout from '@/components/home/HomeLayout';
import { generateCourseOutline } from '@/services/openai';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GenerateOutlineResponse } from '@/types/course';
import OutlineLoading from '@/components/outline-builder/OutlineLoading';
import OutlineError from '@/components/outline-builder/OutlineError';
import OutlineUnit from '@/components/outline-builder/OutlineUnit';
import OutlineActions from '@/components/outline-builder/OutlineActions';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const OutlineBuilder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get search query from location state or session storage with better validation
  const getSearchQuery = () => {
    // First check location state
    const locationQuery = location.state?.searchQuery;
    
    if (locationQuery && typeof locationQuery === 'string' && locationQuery.trim()) {
      // Store valid query in session storage for persistence
      sessionStorage.setItem('course_search_query', locationQuery);
      return locationQuery;
    }
    
    // Then check session storage
    const storedQuery = sessionStorage.getItem('course_search_query');
    if (storedQuery && storedQuery.trim()) {
      return storedQuery;
    }
    
    // Return empty string if no valid query is found
    return "";
  };
  
  const searchQuery = getSearchQuery();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [outline, setOutline] = useState<GenerateOutlineResponse | null>(null);
  const [regenerating, setRegenerating] = useState<boolean>(false);
  const [apiKeyError, setApiKeyError] = useState<boolean>(false);
  
  useEffect(() => {
    // Only attempt to generate outline if we have a valid search query
    if (!searchQuery || !searchQuery.trim()) {
      setIsLoading(false);
      // Don't set an error here, we'll handle the empty state in the UI
      return;
    }
    
    // Reset any stored outline to ensure a fresh generation based on the current query
    sessionStorage.removeItem('course_outline');
    
    const generateOutline = async () => {
      try {
        setIsLoading(true);
        setApiKeyError(false);
        console.log("Generating course outline for query:", searchQuery);
        const result = await generateCourseOutline(searchQuery);
        console.log("Generated outline result:", result);
        setOutline(result);
        
        // Store the outline in session storage for persistence
        sessionStorage.setItem('course_outline', JSON.stringify(result));
        
        toast.success("Course outline generated!");
      } catch (err: any) {
        console.error("Error generating outline:", err);
        
        // Check if the error is related to the OpenAI API key
        if (err.message && (
          err.message.includes("OpenAI API key is not configured") || 
          err.message.includes("OpenAI API key") ||
          err.message.includes("API key")
        )) {
          setApiKeyError(true);
          setError("OpenAI API key is missing or invalid. Please configure it in the Supabase Edge Function Secrets.");
        } else {
          setError("Failed to generate course outline. Please try again.");
        }
        
        toast.error("Failed to generate course outline");
      } finally {
        setIsLoading(false);
      }
    };
    
    generateOutline();
  }, [searchQuery]);
  
  const handleGenerateModules = () => {
    if (outline) {
      try {
        // Double check the outline is valid before navigating
        if (!outline.title || !Array.isArray(outline.units) || outline.units.length === 0) {
          toast.error("Invalid course outline. Please regenerate.");
          return;
        }
        
        // Store outline in session storage before navigating
        sessionStorage.setItem('course_outline', JSON.stringify(outline));
        
        // Navigate to module generator with state
        console.log("Navigating to module generator with outline:", outline);
        navigate('/module-generator', { 
          state: { outline, searchQuery } 
        });
      } catch (err) {
        console.error("Error navigating to module generator:", err);
        toast.error("Failed to navigate to module generator. Please try again.");
      }
    } else {
      toast.error("No outline available. Please generate an outline first.");
    }
  };
  
  const handleRegenerateOutline = async () => {
    if (!searchQuery) return;
    
    try {
      setRegenerating(true);
      setApiKeyError(false);
      toast.info("Regenerating course outline...");
      const result = await generateCourseOutline(searchQuery);
      setOutline(result);
      
      // Update the stored outline
      sessionStorage.setItem('course_outline', JSON.stringify(result));
      
      toast.success("Course outline regenerated!");
    } catch (err: any) {
      console.error("Error regenerating outline:", err);
      
      // Check if the error is related to the OpenAI API key
      if (err.message && (
        err.message.includes("OpenAI API key is not configured") || 
        err.message.includes("OpenAI API key") ||
        err.message.includes("API key")
      )) {
        setApiKeyError(true);
        setError("OpenAI API key is missing or invalid. Please configure it in the Supabase Edge Function Secrets.");
      } else {
        toast.error("Failed to regenerate outline");
      }
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <HomeLayout>
      <div className="w-full max-w-4xl mx-auto p-4">
        <div className="bg-dark-400 p-6 rounded-xl border-4 border-kibi-600">
          <div className="flex items-center mb-6">
            <FileText className="h-8 w-8 text-kibi-400 mr-3" />
            <h1 className="text-3xl font-bold text-white cartoon-text">Course Outline Builder</h1>
          </div>
          
          {apiKeyError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>OpenAI API Key Required</AlertTitle>
              <AlertDescription>
                This feature requires an OpenAI API key to be configured in the Supabase Edge Function Secrets.
                Please add the OPENAI_API_KEY secret to continue.
              </AlertDescription>
            </Alert>
          )}
          
          {searchQuery ? (
            <div className="mb-6">
              <p className="text-gray-300 mb-2">Creating a comprehensive outline based on your search:</p>
              <div className="bg-dark-300 p-4 rounded-lg border border-dark-200">
                <p className="text-white break-words">{searchQuery}</p>
              </div>
            </div>
          ) : (
            <div className="text-center p-6 bg-dark-300 rounded-lg border border-dark-200 mb-6">
              <p className="text-white mb-4">No search query found. Please enter a topic to generate a course outline.</p>
              <Button asChild className="bg-kibi-500 hover:bg-kibi-600">
                <Link to="/">Return to Home</Link>
              </Button>
            </div>
          )}
          
          {isLoading ? (
            <OutlineLoading />
          ) : error ? (
            <OutlineError error={error} />
          ) : outline ? (
            <div className="animate-fadeIn">
              <div className="mb-8 p-4 border-2 border-kibi-500 rounded-xl bg-dark-400">
                <h2 className="text-2xl font-bold mb-2 text-white cartoon-text">{outline.title}</h2>
                <div className="flex items-center">
                  <p className="text-gray-300">
                    AI-generated course with {outline.units.length} units
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 ml-2 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Generated with OpenAI GPT-3.5</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              <div className="space-y-6">
                {outline.units.map((unit, index) => (
                  <OutlineUnit key={index} unit={unit} index={index} />
                ))}
              </div>
              
              <OutlineActions 
                onRegenerate={handleRegenerateOutline}
                onGenerateModules={handleGenerateModules}
                regenerating={regenerating}
              />
            </div>
          ) : !searchQuery ? (
            null
          ) : (
            <div className="text-center p-6">
              <p className="text-gray-300 mb-4">Unable to generate an outline. Please try again with a different topic.</p>
              <Button asChild>
                <Link to="/">Return to Home</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </HomeLayout>
  );
};

export default OutlineBuilder;
