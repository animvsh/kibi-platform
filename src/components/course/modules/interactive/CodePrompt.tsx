
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, RefreshCw, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CodePromptProps {
  codePrompt: {
    language: string;
    objective: string;
    starter_code: string;
  };
  onComplete: () => void;
}

const CodePrompt: React.FC<CodePromptProps> = ({ codePrompt, onComplete }) => {
  const [code, setCode] = useState(codePrompt.starter_code);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };
  
  const runCode = async () => {
    setIsRunning(true);
    setOutput(null);
    
    // Simulate code execution
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setOutput("// Code executed successfully!\n// This is a simulated output.\n// In a real implementation, we would execute the code using a service like Judge0 API.\n\n// Example output:\n> Code compiled without errors\n> Console output: Hello, world!");
    setIsRunning(false);
    setHasRun(true);
    onComplete();
  };
  
  return (
    <Card className="border-2 border-dark-200 bg-dark-400">
      <CardHeader className="p-4 border-b border-dark-200">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-medium mb-2">Coding Exercise</CardTitle>
            <p className="text-sm text-gray-300">{codePrompt.objective}</p>
          </div>
          <Badge variant="outline" className="bg-dark-300">
            {codePrompt.language}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4">
          <div className="w-full h-60 bg-dark-600 rounded-lg font-mono text-sm p-2 overflow-y-auto">
            <textarea
              value={code}
              onChange={handleCodeChange}
              className="w-full h-full bg-transparent outline-none resize-none text-gray-200 p-2"
              spellCheck="false"
            />
          </div>
        </div>
        
        {(output || hasRun) && (
          <div className="mt-4">
            <h6 className="text-sm text-gray-300 mb-2">Output:</h6>
            <div className="bg-dark-500 rounded-lg p-3 font-mono text-xs text-gray-200 h-32 overflow-y-auto whitespace-pre-wrap">
              {output || "No output generated."}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t border-dark-200 flex justify-end">
        <Button 
          onClick={runCode}
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> Running...
            </>
          ) : hasRun ? (
            <>
              <CheckCircle className="h-4 w-4" /> Run Again
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Run Code
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CodePrompt;
