
import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Video, Code, PenTool, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { ModuleContentDisplayProps } from './types';
import Logo from '@/components/Logo';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const ModuleContent: React.FC<ModuleContentDisplayProps> = ({
  courseContent,
  isLoading,
  error
}) => {
  const generatePlaceholderModule = (type: string, index: number) => {
    const moduleTypes = ['article', 'lecture', 'code', 'quiz', 'flashcard'];
    const titles = [
      'Introduction to the Topic',
      'Core Concepts and Principles',
      'Practical Applications',
      'Knowledge Assessment',
      'Key Terms Review'
    ];
    
    const placeholderContent = {
      article: "This article will introduce key concepts and foundational principles...",
      lecture: "Video lecture covering essential topics and demonstrations...",
      code: "Interactive coding exercise to practice implementation...",
      quiz: "Test your understanding with a comprehensive quiz...",
      flashcard: "Review key terms and concepts with interactive flashcards..."
    };
    
    const randomType = type || moduleTypes[Math.floor(Math.random() * moduleTypes.length)];
    const randomTitle = titles[index % titles.length];
    
    return {
      id: `placeholder-${Date.now()}-${index}`,
      type: randomType,
      title: randomTitle,
      content: placeholderContent[randomType as keyof typeof placeholderContent] || "Content coming soon...",
      sections: []
    };
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'article':
      case 'article_interactive':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'lecture':
      case 'lecture_interactive':
        return <Video className="h-4 w-4 text-purple-500" />;
      case 'code':
        return <Code className="h-4 w-4 text-green-500" />;
      case 'simulation':
        return <PenTool className="h-4 w-4 text-orange-500" />;
      case 'quiz':
        return <CheckCircle className="h-4 w-4 text-yellow-500" />;
      case 'flashcard':
        return <CheckCircle className="h-4 w-4 text-pink-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-kibi-500" />;
    }
  };

  const getModuleTypeLabel = (type: string) => {
    const labels: Record<string, { bg: string; text: string; label: string }> = {
      article: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Article' },
      article_interactive: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Interactive Article' },
      lecture: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Lecture' },
      lecture_interactive: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Interactive Lecture' },
      code: { bg: 'bg-green-100', text: 'text-green-700', label: 'Code Task' },
      quiz: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Quiz' },
      flashcard: { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Flashcards' },
      review: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Review' },
      simulation: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Simulation' }
    };

    const style = labels[type] || { bg: 'bg-kibi-100', text: 'text-kibi-700', label: 'Module' };
    return (
      <Badge variant="outline" className={`${style.bg} ${style.text}`}>
        {style.label}
      </Badge>
    );
  };

  // Debug log to check what's coming in
  console.log("ModuleContent rendered with:", {
    hasContent: !!courseContent,
    isLoading,
    error
  });
  
  if (courseContent) {
    console.log("Course content details:", {
      title: courseContent.title,
      hasModules: Array.isArray(courseContent.modules),
      moduleCount: Array.isArray(courseContent.modules) ? courseContent.modules.length : 0
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center mb-8">
          <Logo 
            size="md" 
            variant="glow" 
            animated={true} 
            className="animate-bounce-slow mb-4" 
          />
          <h3 className="text-xl font-bold text-white mb-2">Building Course Content...</h3>
          <Progress value={75} className="w-full max-w-md h-2 mb-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <Card key={index} className="bg-dark-300 border border-dark-200 p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-dark-400/20 to-transparent animate-pulse" />
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-dark-200 rounded-full flex items-center justify-center mr-3">
                  <Loader2 className="h-6 w-6 animate-spin text-kibi-500" />
                </div>
                <Skeleton className="h-6 w-3/4" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Error Generating Content</h3>
        <p className="text-red-400 mb-6">{error}</p>
        <p className="text-gray-300 mb-4">We encountered an issue while generating course content. Please try regenerating the outline.</p>
      </div>
    );
  }

  // Extra safety check for courseContent
  if (!courseContent) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-16 w-16 text-yellow-400 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Course Generation Starting</h3>
        <p className="text-gray-300 mb-4">We're setting up your course generation. This usually takes just a moment.</p>
        <div className="w-full max-w-md h-2 bg-dark-300 rounded-full overflow-hidden mb-6">
          <div className="h-full bg-kibi-500 animate-pulse" style={{width: '10%'}}></div>
        </div>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-kibi-500 hover:bg-kibi-600 text-white"
        >
          Refresh Page
        </Button>
      </div>
    );
  }

  // If there are no modules or the modules array is empty
  if (!courseContent.modules || courseContent.modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-16 w-16 text-yellow-400 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Preparing Course Structure</h3>
        <p className="text-gray-300 mb-6">We're setting up the modules for {courseContent.title || "your course"}. Please wait a moment...</p>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-kibi-500 hover:bg-kibi-600 text-white"
        >
          Refresh Generation
        </Button>
      </div>
    );
  }

  // Main content rendering
  return (
    <div className="mb-6 p-4 border-4 border-dark-300 rounded-xl bg-dark-400 shadow-[0_8px_0_rgba(0,0,0,0.3)]">
      <h2 className="text-2xl font-bold mb-2 text-white">
        {courseContent.title}
      </h2>
      <p className="text-gray-300">{courseContent.description || `A comprehensive course on ${courseContent.title}`}</p>
      
      {courseContent.modules && courseContent.modules.map((unit, unitIndex) => (
        <div key={unitIndex} className="mt-6">
          <div className="p-4 border-4 border-kibi-600 rounded-xl bg-dark-300 shadow-[0_4px_0_rgba(0,0,0,0.3)]">
            <h3 className="text-xl font-bold mb-2 text-white">{unit.title}</h3>
            <p className="text-gray-300">{unit.introduction || `This unit covers key concepts related to ${unit.title}`}</p>
          </div>
          
          {unit.content && Array.isArray(unit.content) && unit.content.map((subunit, subunitIdx) => (
            <div key={subunitIdx} className="mt-4 border-2 border-dark-200 rounded-xl overflow-hidden bg-dark-300">
              <div className="bg-dark-200 p-4">
                <h4 className="text-lg font-bold flex items-center text-white">
                  <div className="w-6 h-6 rounded-lg bg-kibi-500 text-white flex items-center justify-center mr-2 shadow-[0_2px_0_rgba(0,0,0,0.2)]">
                    {subunitIdx + 1}
                  </div>
                  {subunit.title}
                </h4>
              </div>
              
              <div className="p-4 space-y-4">
                {(!subunit.modules || !Array.isArray(subunit.modules) || subunit.modules.length === 0) ? (
                  Array(5).fill(0).map((_, idx) => {
                    const placeholder = generatePlaceholderModule(
                      ['article', 'lecture', 'code', 'quiz', 'flashcard'][idx % 5], 
                      idx
                    );
                    return (
                      <Card key={`placeholder-${idx}`} className="p-4 border-2 border-dark-200 bg-dark-400 hover:bg-dark-300 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <div className="bg-kibi-500/20 p-2 rounded-full border border-kibi-500/30">
                              {getModuleIcon(placeholder.type)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-bold text-white">{placeholder.title}</h5>
                              {getModuleTypeLabel(placeholder.type)}
                            </div>
                            <div className="text-gray-400 mt-2 text-sm">
                              <p>{placeholder.content}</p>
                              <div className="mt-2 h-2 bg-dark-300 rounded-full overflow-hidden">
                                <div className="h-full bg-kibi-500 animate-pulse" style={{ width: `${Math.random() * 100}%` }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                ) : (
                  subunit.modules.map((module, moduleIdx) => (
                    <Card key={`module-${moduleIdx}`} className="p-4 border-2 border-dark-200 bg-dark-400 hover:bg-dark-300 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <div className="bg-kibi-500/20 p-2 rounded-full border border-kibi-500/30">
                            {getModuleIcon(module.type)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-bold text-white">{module.title}</h5>
                            {getModuleTypeLabel(module.type)}
                          </div>
                          {'content' in module && module.content && (
                            <div className="text-gray-300 mt-2">
                              <p>{typeof module.content === 'string' ? module.content : JSON.stringify(module.content).substring(0, 100) + '...'}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ModuleContent;
