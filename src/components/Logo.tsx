
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
  variant?: 'default' | 'glow' | 'outlined';
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = '', 
  animated = true,
  variant = 'default'
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const variants = {
    default: 'border-kibi-600 shadow-lg',
    glow: 'border-kibi-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]',
    outlined: 'border-kibi-400 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]'
  };

  return (
    <div 
      className={`
        ${sizes[size]} 
        rounded-xl 
        overflow-hidden 
        border-4 
        ${variants[variant]}
        ${animated ? 'hover-pop hover:rotate-3 hover-wobble' : ''} 
        transition-all 
        duration-300 
        relative
        ${className}
      `}
    >
      <img 
        src="/lovable-uploads/78cf9ca4-d03c-4e95-8ddd-549a08ce1512.png"
        alt="Kibi Logo"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-kibi-400/20"></div>
      {variant === 'glow' && (
        <div className="absolute -inset-1 bg-kibi-500/30 rounded-xl blur-md -z-10"></div>
      )}
    </div>
  );
};

export default Logo;
