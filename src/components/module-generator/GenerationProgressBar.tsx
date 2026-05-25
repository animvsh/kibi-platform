
import React, { useEffect, useState } from 'react';
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import Logo from '@/components/Logo';
import { onProgressUpdate } from '@/utils/progressEvents';

interface GenerationProgressBarProps {
  progress: number;
  title: string;
}

const GenerationProgressBar: React.FC<GenerationProgressBarProps> = ({ progress, title }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Listen to progress events to update UI
  useEffect(() => {
    const remove = onProgressUpdate((_unitIndex, prog) => {
      setAnimatedProgress(prog);
    });
    return remove;
  }, []);

  // Smoothly animate progress changes
  useEffect(() => {
    if (Math.abs(progress - animatedProgress) > 0.1) {
      const target = progress;
      const step = (target - animatedProgress) / 8;
      const timeout = setTimeout(() => {
        setAnimatedProgress(prev => Math.min(100, prev + step));
      }, 40);
      return () => clearTimeout(timeout);
    }
  }, [progress, animatedProgress]);

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <div className="transition-all duration-500 hover:scale-105">
          <Logo size="lg" variant="glow" animated={true} />
        </div>
        <div className="absolute -bottom-1 -right-1">
          <div className="bg-kibi-500 rounded-full p-1.5">
            <Loader2 className="h-4 w-4 text-white animate-spin" />
          </div>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-white animate-fade-in">
        {title || "Generating Your Course..."}
      </h3>
      
      <div className="w-full max-w-md">
        <Progress 
          value={animatedProgress} 
          className="h-3 bg-dark-300 transition-all duration-300" 
        />
        <div className="flex justify-between mt-2 text-sm text-gray-400">
          <span>Generating course content</span>
          <span>{Math.round(animatedProgress)}%</span>
        </div>
      </div>
    </div>
  );
};

export default GenerationProgressBar;
