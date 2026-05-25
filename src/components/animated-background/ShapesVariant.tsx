
import React, { useEffect, useRef } from 'react';
import { Circle } from './types';
import { checkCollision, resolveCollision, drawShape, initCircles } from './utils';

interface ShapesVariantProps {
  intensity: 'low' | 'medium' | 'high';
}

const ShapesVariant: React.FC<ShapesVariantProps> = ({ intensity }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const circlesRef = useRef<Circle[]>([]);
  const animationFrameRef = useRef<number>(0);

  // Determine the number of elements based on intensity
  const elementCount = {
    low: 4,
    medium: 6,
    high: 10
  }[intensity];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match window size
    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Handle circle movement and collisions
      for (let i = 0; i < circlesRef.current.length; i++) {
        const circle = circlesRef.current[i];
        
        // Draw shape
        drawShape(circle, ctx);
        
        // Update position (even slower by dividing by factor)
        circle.x += circle.dx * 0.7;
        circle.y += circle.dy * 0.7;
        
        // Check for collisions with other circles
        for (let j = i + 1; j < circlesRef.current.length; j++) {
          if (checkCollision(circle, circlesRef.current[j])) {
            resolveCollision(circle, circlesRef.current[j]);
          }
        }
        
        // Bounce off edges
        if (circle.x - circle.radius < 0) {
          circle.x = circle.radius;
          circle.dx = Math.abs(circle.dx) * 0.9; // Damping factor
        } 
        else if (circle.x + circle.radius > canvas.width) {
          circle.x = canvas.width - circle.radius;
          circle.dx = -Math.abs(circle.dx) * 0.9;
        }
        
        if (circle.y - circle.radius < 0) {
          circle.y = circle.radius;
          circle.dy = Math.abs(circle.dy) * 0.9;
        } 
        else if (circle.y + circle.radius > canvas.height) {
          circle.y = canvas.height - circle.radius;
          circle.dy = -Math.abs(circle.dy) * 0.9;
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    circlesRef.current = initCircles(canvas, elementCount);
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [elementCount]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-20"
    />
  );
};

export default ShapesVariant;
