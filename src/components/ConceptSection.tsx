
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen } from "lucide-react";

interface ConceptSectionProps {
  content?: string;
  isLoading: boolean;
}

const ConceptSection = ({ content, isLoading }: ConceptSectionProps) => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-lg bg-kibi-600/30 flex items-center justify-center mr-3">
          <BookOpen className="w-5 h-5 text-kibi-400" />
        </div>
        <h3 className="text-lg font-bold text-white">Concept Overview</h3>
      </div>
      
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full bg-dark-300" />
          <Skeleton className="h-4 w-5/6 bg-dark-300" />
          <Skeleton className="h-4 w-4/5 bg-dark-300" />
          <Skeleton className="h-4 w-full bg-dark-300" />
          <Skeleton className="h-4 w-3/4 bg-dark-300" />
        </div>
      ) : content ? (
        <div className="text-gray-200 space-y-4">
          {content.split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-400">Content is being generated...</p>
        </div>
      )}
    </div>
  );
};

export default ConceptSection;
