
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Code, Video } from "lucide-react";
import ConceptSection from "./ConceptSection";
import CodeSection from "./CodeSection";
import VideoSection from "./VideoSection";

interface CourseModuleProps {
  index: number;
  title: string;
  description: string;
  conceptContent?: string;
  codeContent?: {
    explanation: string;
    snippet: string;
    language: string;
  };
  videoIds?: string[];
  isLoading: boolean;
}

const CourseModule = ({ 
  index, 
  title, 
  description, 
  conceptContent, 
  codeContent, 
  videoIds, 
  isLoading 
}: CourseModuleProps) => {
  
  const [activeTab, setActiveTab] = React.useState<'concept' | 'code' | 'video'>('concept');
  
  return (
    <div className="bg-dark-400 border-4 border-kibi-600 rounded-xl overflow-hidden animate-fade-in" 
      style={{ animationDelay: `${index * 0.15}s` }}>
      <div className="p-6 border-b border-dark-300">
        <div className="flex items-start">
          <div className="w-12 h-12 bg-kibi-500 icon-3d border-kibi-600 flex items-center justify-center rounded-xl text-white font-bold mr-4">
            {index + 1}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white cartoon-text">{title}</h2>
            <p className="text-gray-300 text-sm mt-1">{description}</p>
          </div>
        </div>
      </div>

      <div className="bg-dark-500/50 p-4 border-b border-dark-300">
        <div className="flex space-x-2">
          <Button 
            variant={activeTab === 'concept' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('concept')}
            className="flex items-center"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Learn
          </Button>
          <Button 
            variant={activeTab === 'code' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('code')}
            className="flex items-center"
          >
            <Code className="w-4 h-4 mr-2" />
            Practice
          </Button>
          <Button 
            variant={activeTab === 'video' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveTab('video')}
            className="flex items-center"
          >
            <Video className="w-4 h-4 mr-2" />
            Watch
          </Button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'concept' && (
          <ConceptSection content={conceptContent} isLoading={isLoading} />
        )}
        {activeTab === 'code' && (
          <CodeSection codeContent={codeContent} isLoading={isLoading} />
        )}
        {activeTab === 'video' && (
          <VideoSection videoIds={videoIds} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};

export default CourseModule;
