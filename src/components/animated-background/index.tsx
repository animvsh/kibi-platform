
import React from 'react';
import { AnimatedBackgroundProps } from './types';
import CirclesVariant from './CirclesVariant';

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  intensity = 'medium',
  variant = 'circles' 
}) => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Base background - solid, non-translucent */}
      <div className="absolute inset-0 bg-dark-500 z-0"></div>
      
      {/* Canvas for animated circles */}
      <CirclesVariant intensity={intensity} />
      
      {/* Grid overlay with blocky pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0"></div>
    </div>
  );
};

export default AnimatedBackground;
