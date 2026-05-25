
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { generateRandomPoints, shouldReduceMotion, circleColors, outlineColors } from './utils';
import { AnimatedBackgroundProps, Circle } from './types';

const CirclesVariant = ({ intensity = 'medium', className = '' }: AnimatedBackgroundProps) => {
  // Determine number of circles based on intensity
  const numCircles = intensity === 'high' ? 15 : intensity === 'medium' ? 10 : 7;
  const containerRef = useRef<HTMLDivElement>(null);
  const [circles, setCircles] = useState<Circle[]>([]);
  const animationRef = useRef<number>();
  
  // Initialize circles on component mount
  useEffect(() => {
    const reduceMotion = shouldReduceMotion();
    if (reduceMotion) return;

    const container = containerRef.current;
    if (!container) return;
    
    // Generate initial circles with random positions, sizes, and velocities
    const initialCircles = generateRandomPoints(numCircles).map((point, index) => {
      // Make circles with varied sizes
      const radius = Math.floor(50 + Math.random() * 100);
      
      // Get a random color from the circleColors array
      const colorIndex = Math.floor(Math.random() * circleColors.length);
      const color = circleColors[colorIndex];
      const outlineColor = outlineColors[colorIndex];
      
      return {
        x: container.clientWidth * (point.x / 100),
        y: container.clientHeight * (point.y / 100),
        radius,
        dx: (Math.random() - 0.5) * 1, // Slower velocity
        dy: (Math.random() - 0.5) * 1, // Slower velocity
        color,
        outlineColor,
        opacity: 0.2 + Math.random() * 0.2, // Reduced opacity
        shape: 'circle' as const
      };
    });
    
    // Ensure circles don't overlap initially
    const nonOverlappingCircles = ensureNoOverlap(initialCircles);
    
    setCircles(nonOverlappingCircles);
    
    // Start animation
    startAnimation();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [numCircles]);
  
  // Function to ensure circles don't overlap
  const ensureNoOverlap = (circlesArray: Circle[]): Circle[] => {
    const result = [...circlesArray];
    
    // Check each circle against others to ensure they're not overlapping
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const dx = result[i].x - result[j].x;
        const dy = result[i].y - result[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = result[i].radius + result[j].radius;
        
        // If circles overlap
        if (distance < minDistance) {
          // Move them apart
          const angle = Math.atan2(dy, dx);
          const moveDistance = (minDistance - distance) / 2;
          
          result[i].x += Math.cos(angle) * moveDistance;
          result[i].y += Math.sin(angle) * moveDistance;
          result[j].x -= Math.cos(angle) * moveDistance;
          result[j].y -= Math.sin(angle) * moveDistance;
        }
      }
    }
    
    return result;
  };
  
  // Check for collisions between circles
  const checkCollision = (circles: Circle[]) => {
    for (let i = 0; i < circles.length; i++) {
      for (let j = i + 1; j < circles.length; j++) {
        const circle1 = circles[i];
        const circle2 = circles[j];
        
        const dx = circle1.x - circle2.x;
        const dy = circle1.y - circle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = circle1.radius + circle2.radius;
        
        // Collision detected
        if (distance < minDistance) {
          // Calculate collision angle
          const angle = Math.atan2(dy, dx);
          
          // Move circles apart to prevent sticking
          const moveX = (minDistance - distance) * Math.cos(angle) * 0.5;
          const moveY = (minDistance - distance) * Math.sin(angle) * 0.5;
          
          circle1.x += moveX;
          circle1.y += moveY;
          circle2.x -= moveX;
          circle2.y -= moveY;
          
          // Simple elastic collision
          const velocity1 = Math.sqrt(circle1.dx * circle1.dx + circle1.dy * circle1.dy);
          const velocity2 = Math.sqrt(circle2.dx * circle2.dx + circle2.dy * circle2.dy);
          
          const direction1 = Math.atan2(circle1.dy, circle1.dx);
          const direction2 = Math.atan2(circle2.dy, circle2.dx);
          
          // Exchange velocities when they collide
          const tempDx = velocity1 * Math.cos(direction1);
          const tempDy = velocity1 * Math.sin(direction1);
          
          circle1.dx = velocity2 * Math.cos(direction2) * 0.95; // Slight damping
          circle1.dy = velocity2 * Math.sin(direction2) * 0.95;
          circle2.dx = tempDx * 0.95;
          circle2.dy = tempDy * 0.95;
        }
      }
    }
  };
  
  // Animation function to move and bounce circles
  const animate = () => {
    const container = containerRef.current;
    if (!container) return;
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    setCircles(prevCircles => {
      const newCircles = [...prevCircles].map(circle => {
        let { x, y, dx, dy, radius } = circle;
        
        // Move circle
        x += dx;
        y += dy;
        
        // Bounce off walls
        if (x - radius < 0) {
          x = radius;
          dx = Math.abs(dx) * 0.95; // Damping effect
        } else if (x + radius > containerWidth) {
          x = containerWidth - radius;
          dx = -Math.abs(dx) * 0.95;
        }
        
        if (y - radius < 0) {
          y = radius;
          dy = Math.abs(dy) * 0.95;
        } else if (y + radius > containerHeight) {
          y = containerHeight - radius;
          dy = -Math.abs(dy) * 0.95;
        }
        
        return {
          ...circle,
          x,
          y,
          dx,
          dy
        };
      });
      
      // Check for collisions between all circles
      checkCollision(newCircles);
      
      return newCircles;
    });
    
    animationRef.current = requestAnimationFrame(animate);
  };
  
  // Start the animation loop
  const startAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animate);
  };

  return (
    <div ref={containerRef} className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}>
      {circles.map((circle, index) => (
        <div 
          key={index}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${circle.radius * 2}px`,
            height: `${circle.radius * 2}px`,
            backgroundColor: `${circle.color}`,
            border: `3px solid ${circle.outlineColor}`,
            borderRadius: '50%',
            transform: `translate(${circle.x - circle.radius}px, ${circle.y - circle.radius}px)`,
            opacity: circle.opacity,
            zIndex: 0,
            transition: 'transform 0.1s linear'
          }}
        />
      ))}
    </div>
  );
};

export default CirclesVariant;
