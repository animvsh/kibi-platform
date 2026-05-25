
import React from 'react';
import { Loader2 } from 'lucide-react';

interface GenerationIndicatorProps {
  type?: 'unit' | 'subunit';
  message?: string;
}

const GenerationIndicator: React.FC<GenerationIndicatorProps> = ({ 
  type = 'unit',
  message = 'Generating content...'
}) => {
  return (
    <div className={`
      flex items-center px-3 py-2 rounded-lg
      ${type === 'unit' ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-400/5 text-amber-300'}
      text-xs font-medium
    `}>
      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
      <span>{message}</span>
    </div>
  );
};

export default GenerationIndicator;
