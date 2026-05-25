
import React, { useEffect, useState } from 'react';
import Logo from './Logo';

interface SplashScreenProps {
  duration?: number; // Duration in milliseconds
  onComplete?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ 
  duration = 2000,
  onComplete 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-dark-500 transition-opacity duration-500">
      <div className="animate-bounce-slow">
        <Logo size="xl" variant="glow" animated={true} className="mb-8" />
      </div>
      <h1 className="text-4xl font-bold text-white mb-4 cartoon-text">
        <span className="text-kibi-400">k</span>
        <span className="text-kibi-500">i</span>
        <span className="text-kibi-300">b</span>
        <span className="text-kibi-600">i</span>
      </h1>
      <div className="mt-8 flex items-center space-x-2">
        <div className="h-3 w-3 bg-kibi-400 rounded-full animate-pulse"></div>
        <div className="h-3 w-3 bg-kibi-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="h-3 w-3 bg-kibi-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
};

export default SplashScreen;
