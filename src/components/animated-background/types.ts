
export type ShapeType = 'circle' | 'square' | 'triangle';

export interface Circle {
  x: number;
  y: number;
  radius: number;
  color: string;
  outlineColor?: string;
  dx: number;
  dy: number;
  opacity: number;
  shape: ShapeType;
}

export interface AnimatedBackgroundProps {
  intensity?: 'low' | 'medium' | 'high';
  variant?: 'circles' | 'shapes';
  className?: string;
}
