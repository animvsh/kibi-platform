import { Circle } from './types';

// Add the missing getRandomNumber function
export const getRandomNumber = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

// Generate random points for circle positioning
export const generateRandomPoints = (count: number) => {
  const points = [];
  for (let i = 0; i < count; i++) {
    points.push({
      x: Math.random() * 100,  // Position as percentage of container
      y: Math.random() * 100
    });
  }
  return points;
};

// Check if reduced motion is preferred
export const shouldReduceMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Vibrant color palette for circle backgrounds (softer colors)
export const circleColors = [
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#0EA5E9', // Blue
  '#F97316', // Orange
  '#F59E0B', // Yellow
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#34D399', // Light Green
  '#A78BFA', // Light Purple
  '#38BDF8', // Light Blue
];

// Outline colors for circles
export const outlineColors = [
  '#065F46', // Dark Green
  '#5B21B6', // Dark Purple
  '#0369A1', // Dark Blue
  '#9A3412', // Dark Orange
  '#B45309', // Dark Yellow
  '#9D174D', // Dark Pink
  '#4338CA', // Dark Indigo
  '#0E7490', // Dark Cyan
  '#B91C1C', // Dark Red
  '#065F46', // Dark Green
  '#4C1D95', // Dark Purple
  '#0C4A6E', // Dark Blue
];

// Check collision between two circles
export const checkCollision = (circle1: Circle, circle2: Circle) => {
  const dx = circle1.x - circle2.x;
  const dy = circle1.y - circle2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < circle1.radius + circle2.radius;
};

// Resolve collision between two circles
export const resolveCollision = (circle1: Circle, circle2: Circle) => {
  // Calculate collision angle
  const dx = circle1.x - circle2.x;
  const dy = circle1.y - circle2.y;
  
  // Move circles apart slightly to prevent sticking
  const distance = Math.sqrt(dx * dx + dy * dy);
  const overlap = (circle1.radius + circle2.radius) - distance;
  
  if (overlap > 0) {
    // Calculate normalized direction vector
    const nx = dx / distance;
    const ny = dy / distance;
    
    // Move circles apart
    const moveX = nx * overlap * 0.5;
    const moveY = ny * overlap * 0.5;
    
    circle1.x += moveX;
    circle1.y += moveY;
    circle2.x -= moveX;
    circle2.y -= moveY;
  }
  
  // Add extra bounce effect for more lively collisions
  const tempDx = circle1.dx;
  const tempDy = circle1.dy;
  
  circle1.dx = circle2.dx * 1.02; // Add a bit more energy
  circle1.dy = circle2.dy * 1.02;
  circle2.dx = tempDx * 1.02;
  circle2.dy = tempDy * 1.02;
  
  // Cap maximum speed to prevent chaos
  const maxSpeed = 5;
  circle1.dx = Math.min(Math.max(circle1.dx, -maxSpeed), maxSpeed);
  circle1.dy = Math.min(Math.max(circle1.dy, -maxSpeed), maxSpeed);
  circle2.dx = Math.min(Math.max(circle2.dx, -maxSpeed), maxSpeed);
  circle2.dy = Math.min(Math.max(circle2.dy, -maxSpeed), maxSpeed);
};

// Draw shapes (keeping this function for compatibility with other code)
export const drawShape = (circle: Circle, ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = `${circle.color}${Math.round(circle.opacity * 255).toString(16).padStart(2, '0')}`;
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
  ctx.fill();
  
  // Add outline
  if (circle.outlineColor) {
    ctx.lineWidth = 3; // Thicker outline
    ctx.strokeStyle = `${circle.outlineColor}`; // Full opacity for the outline
    ctx.stroke();
  }
};

// Initialize circles with larger size and reduced opacity
export const initCircles = (canvas: HTMLCanvasElement, elementCount: number): Circle[] => {
  const circles: Circle[] = [];
    
  for (let i = 0; i < elementCount; i++) {
    const radius = Math.random() * 25 + 15; // Between 15 and 40px (larger circles)
    const x = Math.random() * (canvas.width - radius * 2) + radius;
    const y = Math.random() * (canvas.height - radius * 2) + radius;
    const colorIndex = Math.floor(Math.random() * circleColors.length);
    const color = circleColors[colorIndex];
    const outlineColor = outlineColors[colorIndex];
    const dx = (Math.random() - 0.5) * 1.5; // Slightly slower movement
    const dy = (Math.random() - 0.5) * 1.5;
    const opacity = Math.random() * 0.3 + 0.1; // Lower opacity between 0.1 and 0.4
    
    circles.push({ 
      x, y, radius, color, outlineColor, dx, dy, opacity, 
      shape: 'circle' // Only circles
    });
  }
  return circles;
};
