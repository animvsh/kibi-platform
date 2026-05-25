
import React from 'react';
import { BookOpen, Code, Video } from "lucide-react";

interface OutlineUnitProps {
  unit: {
    title: string;
    subunits: string[];
  };
  index: number;
}

const OutlineUnit = ({ unit, index }: OutlineUnitProps) => {
  const getSubunitIcon = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("practice") || lowerText.includes("exercise") || 
        lowerText.includes("project") || lowerText.includes("implementation")) {
      return <Code className="h-4 w-4 text-kibi-400 mr-2 mt-1" />;
    } else if (lowerText.includes("video") || lowerText.includes("watch") || 
               lowerText.includes("tutorial")) {
      return <Video className="h-4 w-4 text-kibi-400 mr-2 mt-1" />;
    } else {
      return <BookOpen className="h-4 w-4 text-kibi-400 mr-2 mt-1" />;
    }
  };

  return (
    <div className="p-4 border-2 border-kibi-500 rounded-xl bg-dark-400 hover:border-kibi-600 transition-colors">
      <h3 className="text-xl font-bold mb-3 flex items-center">
        <span className="bg-kibi-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">
          {index + 1}
        </span>
        {unit.title}
      </h3>
      <div className="pl-11 space-y-3">
        {unit.subunits.map((subunit, idx) => (
          <div key={idx} className="flex items-start p-2 border border-dark-200 rounded-lg bg-dark-300 hover:bg-dark-400 transition-colors">
            <div className="flex items-start">
              {getSubunitIcon(subunit)}
              <p className="text-gray-200">{subunit}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OutlineUnit;
