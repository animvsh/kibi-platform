
import React from 'react';
import { Slider } from "@/components/ui/slider";

interface QuickNavigationProps {
  activeUnit: number;
  totalUnits: number;
  onSliderChange: (value: number[]) => void;
}

const QuickNavigation: React.FC<QuickNavigationProps> = ({
  activeUnit,
  totalUnits,
  onSliderChange
}) => {
  return (
    <div className="p-4 border-b border-dark-300/50">
      <h3 className="text-white text-sm font-medium mb-2">Quick Navigation</h3>
      <Slider
        value={[activeUnit]}
        max={totalUnits - 1}
        step={1}
        className="mb-2"
        onValueChange={onSliderChange}
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>Unit 1</span>
        <span>Unit {totalUnits}</span>
      </div>
    </div>
  );
};

export default QuickNavigation;
