
import { useState, useEffect } from 'react';
import { Play, RotateCcw, Coffee, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TimerModeType = 'focus' | 'short' | 'long';

export default function FocusTimer() {
  const [seconds, setSeconds] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [timerMode, setTimerMode] = useState<TimerModeType>('focus');
  
  useEffect(() => {
    let interval: number | undefined;
    
    if (isActive) {
      interval = window.setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds <= 1) {
            setIsActive(false);
            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);
  
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const handleReset = () => {
    setIsActive(false);
    if (timerMode === 'focus') setSeconds(25 * 60);
    else if (timerMode === 'short') setSeconds(5 * 60);
    else if (timerMode === 'long') setSeconds(15 * 60);
  };
  
  const handleModeChange = (mode: TimerModeType) => {
    setIsActive(false);
    setTimerMode(mode);
    if (mode === 'focus') setSeconds(25 * 60);
    else if (mode === 'short') setSeconds(5 * 60);
    else if (mode === 'long') setSeconds(15 * 60);
  };

  return (
    <div className="flex flex-col items-center p-8">
      <div className="flex items-center mb-4">
        <svg viewBox="0 0 24 24" className="w-8 h-8 mr-2 text-kibi-500" fill="none">
          <path d="M12 7V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h2 className="text-2xl text-kibi-500 font-bold cartoon-text">focus timer</h2>
      </div>
      
      <div className="flex gap-4 w-full mb-8">
        <Button 
          variant={timerMode === 'focus' ? 'default' : 'outline'} 
          className={cn(
            "flex-1 border-4 rounded-xl btn-3d font-bold",
            timerMode === 'focus' 
              ? 'bg-kibi-600 border-kibi-700 hover:bg-kibi-700 text-white' 
              : 'bg-dark-400 border-dark-300 text-gray-400 hover:bg-dark-300'
          )}
          onClick={() => handleModeChange('focus')}
        >
          <Play className="h-5 w-5 mr-2" />
          Focus
        </Button>
        
        <Button 
          variant={timerMode === 'short' ? 'default' : 'outline'} 
          className={cn(
            "flex-1 border-4 rounded-xl btn-3d font-bold",
            timerMode === 'short' 
              ? 'bg-kibi-600 border-kibi-700 hover:bg-kibi-700 text-white' 
              : 'bg-dark-400 border-dark-300 text-gray-400 hover:bg-dark-300'
          )}
          onClick={() => handleModeChange('short')}
        >
          <Coffee className="h-5 w-5 mr-2" />
          Short Break
        </Button>
        
        <Button 
          variant={timerMode === 'long' ? 'default' : 'outline'} 
          className={cn(
            "flex-1 border-4 rounded-xl btn-3d font-bold",
            timerMode === 'long' 
              ? 'bg-kibi-600 border-kibi-700 hover:bg-kibi-700 text-white' 
              : 'bg-dark-400 border-dark-300 text-gray-400 hover:bg-dark-300'
          )}
          onClick={() => handleModeChange('long')}
        >
          <ArrowRight className="h-5 w-5 mr-2" />
          Long Break
        </Button>
      </div>
      
      <div className="glass-card border-4 p-8 w-full flex justify-center items-center blocky">
        <h1 className="text-8xl font-mono text-kibi-500 cartoon-text">{formatTime(seconds)}</h1>
      </div>
      
      <p className="text-kibi-500 text-xl mt-6 cartoon-text">focus time</p>
      
      <div className="mt-16 flex gap-6">
        <Button 
          className="bg-kibi-600 border-kibi-700 hover:bg-kibi-700 text-white h-20 w-20 rounded-xl border-4 btn-3d"
          onClick={() => setIsActive(!isActive)}
        >
          <Play className="h-8 w-8" />
        </Button>
        
        <Button 
          className="bg-dark-400 hover:bg-dark-300 border-4 border-dark-300 text-gray-400 hover:text-white h-20 w-20 rounded-xl btn-3d"
          onClick={handleReset}
        >
          <RotateCcw className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
}
