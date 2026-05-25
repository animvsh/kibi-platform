
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowRight } from "lucide-react";

interface OutlineActionsProps {
  onRegenerate: () => void;
  onGenerateModules: () => void;
  regenerating: boolean;
}

const OutlineActions = ({ onRegenerate, onGenerateModules, regenerating }: OutlineActionsProps) => {
  return (
    <div className="mt-8 flex flex-wrap gap-4 justify-center">
      <Button 
        onClick={onRegenerate}
        variant="outline" 
        className="flex items-center gap-2"
        disabled={regenerating}
      >
        <RefreshCw className={`h-4 w-4 ${regenerating ? "animate-spin" : ""}`} /> 
        {regenerating ? "Regenerating..." : "Regenerate Outline"}
      </Button>
      <Button 
        onClick={onGenerateModules}
        className="bg-kibi-500 hover:bg-kibi-600 flex items-center gap-2"
      >
        Generate Modules <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default OutlineActions;
