
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Code, Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeSectionProps {
  codeContent?: {
    explanation: string;
    snippet: string;
    language: string;
  };
  isLoading: boolean;
}

const CodeSection = ({ codeContent, isLoading }: CodeSectionProps) => {
  const [result, setResult] = React.useState<string | null>(null);
  const [isRunning, setIsRunning] = React.useState(false);

  const handleRunCode = async () => {
    if (!codeContent?.snippet) return;
    
    setIsRunning(true);
    try {
      // In a real application, this would make a call to Judge0 API
      // For now, we'll simulate the API response
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResult("Code executed successfully! ✅\n\nSimulated output would appear here.\nConnect to Judge0 API for actual code execution.");
    } catch (error) {
      setResult("Error running code.");
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-lg bg-kibi-600/30 flex items-center justify-center mr-3">
          <Code className="w-5 h-5 text-kibi-400" />
        </div>
        <h3 className="text-lg font-bold text-white">Practice Exercise</h3>
      </div>
      
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full bg-dark-300" />
          <Skeleton className="h-4 w-5/6 bg-dark-300" />
          <Skeleton className="h-40 w-full bg-dark-300 mt-4" />
        </div>
      ) : codeContent ? (
        <div>
          <p className="text-gray-200 mb-4">{codeContent.explanation}</p>
          
          <div className="bg-dark-600 rounded-lg p-4 font-mono text-sm text-gray-200 overflow-x-auto">
            <pre>{codeContent.snippet}</pre>
          </div>
          
          <div className="flex justify-end mt-4 mb-2">
            <Button 
              onClick={handleRunCode}
              disabled={isRunning}
              className="flex items-center"
            >
              {isRunning ? 
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : 
                <Play className="w-4 h-4 mr-2" />
              }
              {isRunning ? "Running..." : "Run Code"}
            </Button>
          </div>
          
          {result && (
            <div className="bg-dark-300/50 border border-dark-200 rounded-lg p-4 font-mono text-sm text-gray-200 mt-4">
              <pre className="whitespace-pre-wrap">{result}</pre>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-400">Code exercise is being generated...</p>
        </div>
      )}
    </div>
  );
};

export default CodeSection;
