
import React, { useEffect, Suspense } from 'react';
import { useModuleGeneratorOutline } from '@/hooks/useModuleGeneratorOutline';
import ModuleGeneratorContent from '@/components/module-generator/ModuleGeneratorContent';
import HomeLayout from '@/components/home/HomeLayout';
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

const ModuleGenerator = () => {
  const { outline, searchQuery, error, isLoading } = useModuleGeneratorOutline();
  const navigate = useNavigate();
  
  console.log("ModuleGenerator render:", { 
    hasOutline: !!outline, 
    outlineDetails: outline, // Log more details about the outline
    searchQuery, 
    error,
    isLoading 
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to load course outline: " + error);
    }
  }, [error]);

  const handleNavigateBack = () => {
    navigate('/outline-builder', { 
      state: { searchQuery } 
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <HomeLayout>
        <div className="w-full max-w-4xl mx-auto p-4">
          <div className="bg-dark-400 p-6 rounded-xl border-4 border-kibi-600 flex flex-col items-center justify-center text-center">
            <Loader2 className="h-16 w-16 text-kibi-500 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Loading Course Outline</h3>
            <p className="text-gray-300">Please wait while we prepare your course generation...</p>
          </div>
        </div>
      </HomeLayout>
    );
  }

  // Show error or no outline state
  if (!outline || error) {
    return (
      <HomeLayout>
        <div className="w-full max-w-4xl mx-auto p-4">
          <div className="bg-dark-400 p-6 rounded-xl border-4 border-kibi-600 flex flex-col items-center justify-center text-center">
            {error ? (
              <>
                <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-4">Failed to Load Course Outline</h3>
                <p className="text-gray-300 mb-6">
                  {error}. Please try creating a new outline.
                </p>
              </>
            ) : (
              <>
                <AlertCircle className="h-16 w-16 text-yellow-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-4">No Course Outline Found</h3>
                <p className="text-gray-300 mb-6">You need to create a course outline first before generating modules.</p>
              </>
            )}
            <Button 
              onClick={handleNavigateBack}
              className="bg-kibi-500 hover:bg-kibi-600 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Create Outline
            </Button>
          </div>
        </div>
      </HomeLayout>
    );
  }

  // Wrap content in error boundary and suspense
  return (
    <Suspense fallback={
      <HomeLayout>
        <div className="w-full flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-kibi-500" />
        </div>
      </HomeLayout>
    }>
      <ModuleGeneratorContent outline={outline} searchQuery={searchQuery} />
    </Suspense>
  );
};

export default ModuleGenerator;
