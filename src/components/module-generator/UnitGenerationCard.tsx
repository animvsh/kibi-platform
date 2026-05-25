
import React, { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { onProgressUpdate, onModuleDone } from '@/utils/progressEvents';

interface UnitGenerationCardProps {
  title: string;
  status: 'pending' | 'generating' | 'complete';
  index: number;
  onClick: () => void;
  progress?: number;
  error?: boolean;
}

const UnitGenerationCard: React.FC<UnitGenerationCardProps> = ({
  title,
  status,
  index,
  onClick,
  progress = 0,
  error = false
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isDoneSignal, setIsDoneSignal] = useState(false);

  useEffect(() => {
    const remove = onModuleDone((unitIndex) => {
      if (unitIndex === index) {
        console.log(`Module ${index} received done signal`);
        setAnimatedProgress(100);
        setIsDoneSignal(true);
      }
    });
    return remove;
  }, [index]);

  useEffect(() => {
    const remove = onProgressUpdate((unitIndex, prog) => {
      if (unitIndex === index) {
        console.log(`Progress update for unit ${index}: ${prog}%`);
        setAnimatedProgress(prog);
      }
    });
    return remove;
  }, [index]);

  useEffect(() => {
    // When status or progress changes, we update the animated progress
    if (status === 'generating' && !isDoneSignal) {
      if (Math.abs(progress - animatedProgress) > 0.1) {
        const step = (progress - animatedProgress) / 8;
        const timeout = setTimeout(() => {
          setAnimatedProgress(prev => prev + step);
        }, 30);
        return () => clearTimeout(timeout);
      }
    } else if (status === 'complete') {
      setAnimatedProgress(100);
    }
  }, [progress, status, animatedProgress, isDoneSignal]);

  return (
    <div 
      onClick={onClick}
      className={`p-4 border-2 rounded-lg transition-all cursor-pointer hover:scale-[1.02] ${
        status === 'complete' 
          ? error 
            ? 'bg-dark-300 border-red-500' 
            : 'bg-dark-300 border-green-500 animate-fade-in' 
          : status === 'generating' 
            ? 'bg-dark-300 border-kibi-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
            : 'bg-dark-400 border-dark-300 opacity-60'
      }`}
    >
      <div className="flex items-center mb-2">
        <div className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center transition-colors ${
          status === 'complete' 
            ? error 
              ? 'bg-red-500' 
              : 'bg-green-500' 
            : status === 'generating' 
              ? 'bg-kibi-500' 
              : 'bg-gray-600'
        }`}>
          {status === 'complete' ? (
            error ? (
              <span className="text-xs text-white">!</span>
            ) : (
              <Check className="h-4 w-4 text-white" />
            )
          ) : status === 'generating' ? (
            <Loader2 className="h-4 w-4 text-white animate-spin" />
          ) : (
            <span className="text-xs text-white">{index + 1}</span>
          )}
        </div>
        <h4 className="font-medium text-gray-200 truncate">{title}</h4>
      </div>
      <div className="pl-11">
        <Progress 
          value={status === 'complete' ? 100 : status === 'generating' ? animatedProgress : 0} 
          className="h-1.5 bg-dark-500 transition-all duration-300"
        />
        <p className="text-xs text-gray-400 mt-1">
          {status === 'complete' 
            ? error 
              ? 'Error' 
              : 'Complete' 
            : status === 'generating' 
              ? `Generating${animatedProgress > 0 ? ` (${Math.round(animatedProgress)}%)` : '...'}` 
              : 'Pending'}
        </p>
      </div>
    </div>
  );
};

export default UnitGenerationCard;
