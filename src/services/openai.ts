
import { supabase } from "@/integrations/supabase/client";
import { GenerateOutlineResponse } from "@/types/course";
import { toast } from "sonner";

// This function uses a Supabase Edge Function to call OpenAI API
export const generateCourseOutline = async (inputText: string): Promise<GenerateOutlineResponse> => {
  console.log("Calling edge function to generate outline from:", inputText);
  
  try {
    const { data, error } = await supabase.functions.invoke("generate-course-outline", {
      body: { inputText }
    });
    
    if (error) {
      console.error("Edge function error:", error);
      throw new Error(`Failed to generate course outline: ${error.message}`);
    }
    
    if (!data) {
      throw new Error("No data received from API");
    }

    // Check if the response contains an error status
    if (data.status === 'error') {
      console.error("Edge function returned error status:", data.error);
      throw new Error(`Failed to generate course outline: ${data.error}`);
    }
    
    if (!data.title || !Array.isArray(data.units)) {
      console.error("Invalid response structure:", data);
      throw new Error("Invalid outline structure received from API");
    }
    
    return data as GenerateOutlineResponse;
  } catch (error) {
    console.error("Error in generateCourseOutline:", error);
    throw error;
  }
};

// This function uses a Supabase Edge Function to call OpenAI API
export const generateModuleContent = async (outline: GenerateOutlineResponse | any, unitIndex?: number, demoMode: boolean = false): Promise<any> => {
  if (!outline || !outline.title || !Array.isArray(outline.units)) {
    console.error("Invalid outline provided to generateModuleContent:", outline);
    return { 
      conceptContent: "Error: Invalid outline", 
      codeContent: { explanation: "", snippet: "", language: "" },
      videoIds: [],
      quizQuestions: []
    };
  }
  
  console.log(`Calling edge function to generate module content for unit ${unitIndex !== undefined ? unitIndex : 'all'} of: ${outline.title}`);
  console.log("Demo mode:", demoMode ? "enabled" : "disabled");
  
  try {    
    // Prepare the function URL with or without unitIndex
    let url = "generate-module-content";
    if (unitIndex !== undefined) {
      url += `?unitIndex=${unitIndex}`;
    }
    
    // Call the Supabase edge function
    const { data, error } = await supabase.functions.invoke(url, {
      body: { outline, demoMode }
    });
    
    if (error) {
      console.error("Edge function error:", error);
      throw new Error(`Failed to generate module content: ${error.message}`);
    }
    
    if (!data) {
      throw new Error("No data returned from module content generation");
    }

    // If the data contains an error message from the edge function
    if (data.status === 'error' || data.error) {
      console.error("Edge function returned error:", data.error);
      return { 
        conceptContent: "Generation error: " + (data.error || "Unknown error"), 
        codeContent: { explanation: "", snippet: "", language: "" },
        videoIds: [],
        quizQuestions: []
      };
    }
    
    // Make sure we return valid data, even if it's empty
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error("Failed to parse JSON response:", e);
        return { 
          conceptContent: "Error parsing JSON response", 
          codeContent: { explanation: "", snippet: "", language: "" },
          videoIds: [],
          quizQuestions: []
        };
      }
    }
    
    return data;
  } catch (error) {
    console.error("Error in generateModuleContent:", error);
    if (unitIndex !== undefined) {
      // For incremental generation, log the error but don't show toast for each unit
      return { 
        conceptContent: "Error: " + (error.message || "Failed to generate module content"), 
        codeContent: { explanation: "", snippet: "", language: "" },
        videoIds: [],
        quizQuestions: []
      };
    } else {
      toast.error("Failed to generate module content. Please try again.");
      throw error;
    }
  }
};
