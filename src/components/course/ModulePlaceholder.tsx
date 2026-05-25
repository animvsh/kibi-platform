
import React from 'react';
import { Card } from '@/components/ui/card';
import { FileText, Video, Code, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExtendedCourseModule } from '@/types/extended-course';
import { getModuleTypeLabel } from './ModuleTypeBadge';

interface ModulePlaceholderProps {
  module: ExtendedCourseModule;
  onComplete?: () => void;
}

const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({ 
  module, 
  onComplete 
}) => {
  const getModuleIcon = () => {
    switch (module.type) {
      case 'article':
      case 'article_interactive':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'lecture':
      case 'lecture_interactive':
        return <Video className="h-5 w-5 text-purple-500" />;
      case 'code':
        return <Code className="h-5 w-5 text-green-500" />;
      case 'quiz':
        return <BookOpen className="h-5 w-5 text-orange-500" />;
      case 'flashcard':
        return <BookOpen className="h-5 w-5 text-yellow-500" />;
      case 'review':
        return <BookOpen className="h-5 w-5 text-kibi-500" />;
      default:
        return <BookOpen className="h-5 w-5 text-gray-500" />;
    }
  };

  // Extract and parse any article outline or description from content_json
  const getArticleOutline = () => {
    try {
      if (module.type === 'article' && module.content_json) {
        const content = module.content_json.content || module.content_json;
        
        if (content && content.article_outline && Array.isArray(content.article_outline)) {
          return content.article_outline.slice(0, 3).map(item => ({
            heading: item.heading || item.title || '',
            description: item.description || ''
          }));
        }
        
        if (content && content.overview) {
          return [{
            heading: 'Overview',
            description: content.overview
          }];
        }
      }
      return null;
    } catch (e) {
      console.error("Error parsing module content for outline:", e);
      return null;
    }
  };
  
  const articleOutline = getArticleOutline();

  const getPlaceholderContent = () => {
    switch (module.type) {
      case 'article':
      case 'article_interactive':
        return (
          <div className="space-y-4">
            {articleOutline ? (
              <div className="space-y-3">
                <p className="text-gray-300">This article will cover:</p>
                <div className="space-y-2 pl-2">
                  {articleOutline.map((section, idx) => (
                    <div key={idx} className="mb-2">
                      <h4 className="text-sm font-medium text-gray-200">{section.heading}</h4>
                      {section.description && (
                        <p className="text-xs text-gray-400 pl-2">{section.description}</p>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-gray-400 text-sm italic">The complete content is being prepared.</p>
              </div>
            ) : (
              <>
                <p className="text-gray-300">This article will cover key concepts about {module.title}.</p>
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-4 bg-dark-300 rounded animate-pulse" style={{width: `${Math.floor(Math.random() * 30) + 70}%`}}></div>
                  ))}
                </div>
                <p className="text-gray-300">The complete content is being prepared.</p>
                <div className="space-y-2">
                  {[1, 2].map(i => (
                    <div key={i} className="h-4 bg-dark-300 rounded animate-pulse" style={{width: `${Math.floor(Math.random() * 40) + 60}%`}}></div>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      case 'lecture':
      case 'lecture_interactive':
        return (
          <div className="space-y-4">
            <p className="text-gray-300">This video lecture will demonstrate {module.title}.</p>
            <div className="aspect-video bg-dark-300 rounded-lg flex items-center justify-center">
              <Video className="h-12 w-12 text-gray-500 opacity-50" />
            </div>
            <p className="text-gray-300">The video is being prepared for playback.</p>
          </div>
        );
      case 'code':
        return (
          <div className="space-y-4">
            <p className="text-gray-300">This code exercise will help you practice {module.title}.</p>
            <div className="bg-dark-300 rounded-lg p-4 font-mono text-gray-400">
              <div className="opacity-50">// Code example will be available soon</div>
              <div className="opacity-50">function example() {"{"}</div>
              <div className="opacity-50 ml-4">// Implementation details</div>
              <div className="opacity-50">{"}"}</div>
            </div>
          </div>
        );
      case 'quiz':
        return (
          <div className="space-y-4">
            <p className="text-gray-300">This quiz will test your knowledge of {module.title}.</p>
            <div className="p-3 border border-dark-300 rounded-lg">
              <p className="text-gray-400 mb-2">Sample Question:</p>
              <p className="text-gray-300 mb-3">What is the primary purpose of {module.title}?</p>
              <div className="space-y-2">
                {['A', 'B', 'C', 'D'].map(option => (
                  <div key={option} className="flex items-center p-2 border border-dark-300 rounded">
                    <div className="w-5 h-5 rounded-full border border-gray-500 mr-2"></div>
                    <span className="text-gray-400">Option {option}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'flashcard':
        return (
          <div className="space-y-4">
            <p className="text-gray-300">This flashcard set will help you memorize key concepts about {module.title}.</p>
            <div className="bg-dark-300 aspect-[3/2] rounded-lg flex items-center justify-center p-6">
              <p className="text-center text-gray-400">Flashcard content is being prepared</p>
            </div>
          </div>
        );
      case 'review':
        return (
          <div className="space-y-4">
            <p className="text-gray-300">This review summarizes the key points about {module.title}.</p>
            <div className="space-y-3">
              <p className="text-gray-400">Key Takeaways:</p>
              <ul className="list-disc list-inside space-y-2">
                {[1, 2, 3].map(i => (
                  <li key={i} className="text-gray-300">
                    <div className="inline-block h-4 bg-dark-300 rounded animate-pulse" style={{width: `${Math.floor(Math.random() * 30) + 50}%`}}></div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      default:
        return <p className="text-gray-300">Content for this module is being prepared.</p>;
    }
  };

  return (
    <Card className="p-4 border-2 border-dark-100 bg-dark-300 mb-6 relative overflow-hidden">
      {/* Subtle animated background effect */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-kibi-500/30 to-transparent animate-pulse"></div>
      
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <div className="bg-kibi-600/60 p-2 rounded-full">
            {getModuleIcon()}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-bold">{module.title}</h5>
            {getModuleTypeLabel(module.type)}
          </div>
          
          <div className="text-gray-300 mt-2">
            {getPlaceholderContent()}
          </div>
          
          <div className="flex justify-end mt-6">
            <Button 
              onClick={() => onComplete && onComplete()} 
              className="bg-kibi-500 hover:bg-kibi-600"
            >
              Mark as Complete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ModulePlaceholder;
