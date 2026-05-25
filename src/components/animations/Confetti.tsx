
import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  duration?: number;
}

const Confetti: React.FC<ConfettiProps> = ({ duration = 3000 }) => {
  useEffect(() => {
    // Fire confetti from the center-top
    const fireConfetti = () => {
      const end = Date.now() + duration;
      
      const colors = ['#FF5E5B', '#D8D8F6', '#7FC29B', '#8AA1B1', '#FFDB4C'];
      
      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0.2, y: 0.4 },
          colors: colors
        });
        
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 0.8, y: 0.4 },
          colors: colors
        });
        
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    };
    
    fireConfetti();
  }, [duration]);
  
  return null; // This component doesn't render anything visible
};

export default Confetti;
