
import React, { useState, useEffect } from 'react';
import { ArticleModule } from '@/types/modules/content';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, BookOpen, Clock, Loader2, ChevronRight } from 'lucide-react';
import ArticleSectionRenderer from '@/components/course/modules/interactive/ArticleSectionRenderer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ArticleModuleProps {
  module: ArticleModule;
  moduleIdx: number;
  onComplete?: () => void;
  isCompleted?: boolean;
}

const ArticleModuleComponent: React.FC<ArticleModuleProps> = ({ 
  module, 
  moduleIdx,
  onComplete,
  isCompleted = false
}) => {
  const [isReading, setIsReading] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [markAsCompleteVisible, setMarkAsCompleteVisible] = useState(false);
  const [isCompleteButtonVisible, setIsCompleteButtonVisible] = useState(false);
  
  // Process module content
  const content = module.content_json || {};
  const title = content.title || module.title || "Untitled Article";
  const overview = content.overview || "Overview not available";
  const markdown = content.markdown || module.content || "";
  const articleOutline = content.article_outline || [];
  const sections = content.sections || [];
  const wordCount = content.metadata?.wordCount || markdown.split(/\s+/).length || 0;
  const readingTime = content.metadata?.readingTime || Math.ceil(wordCount / 200) || 1;
  
  // Detect if this is just a placeholder (empty or incomplete)
  const isPlaceholder = !markdown || markdown.length < 100;
  
  // Determine article format - modern (sections) or legacy (markdown only)
  const hasStructuredSections = Array.isArray(sections) && sections.length > 0;
  const hasOutline = Array.isArray(articleOutline) && articleOutline.length > 0;
  
  // Process outline into section data for consistent rendering
  const processedSections = hasStructuredSections ? sections : 
    hasOutline ? articleOutline.map((item: any) => ({
      heading: item.heading,
      content: '' // Content will be extracted from markdown
    })) : [];
    
  // If we have markdown but no outline, try to extract headers
  const extractedSections = !hasOutline && markdown ? 
    markdown.match(/##\s+([^\n]+)/g)?.map(h => ({ 
      heading: h.replace(/##\s+/, ''), 
      content: '' 
    })) || [] : [];
    
  const effectiveSections = processedSections.length > 0 ? 
    processedSections : extractedSections.length > 0 ? 
    extractedSections : [{ heading: "Content", content: markdown }];
    
  // Extract sections from markdown when using article outline
  useEffect(() => {
    if (markdown && articleOutline?.length > 0 && !hasStructuredSections) {
      const updatedSections = [...articleOutline];
      
      // Try to extract content between headers
      const markdownSections = markdown.split(/##\s+[^\n]+\n/);
      if (markdownSections.length > 1) {
        // First section is before the first header
        markdownSections.shift();
        
        // Match section content to outline items
        for (let i = 0; i < Math.min(updatedSections.length, markdownSections.length); i++) {
          (updatedSections[i] as any).content = markdownSections[i];
        }
      }
    }
  }, [markdown, articleOutline, hasStructuredSections]);
  
  // Show complete button after user scrolls to bottom
  useEffect(() => {
    if (!isCompleted && markdown) {
      const handleScroll = (e: any) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        // Show button when scrolled 70% through content
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
        setMarkAsCompleteVisible(scrollPercentage > 0.7);
      };
      
      const scrollContainer = document.querySelector('.article-scroll-area');
      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', handleScroll);
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
      }
    }
  }, [isCompleted, markdown]);
  
  // Handle article visibility and loading states
  useEffect(() => {
    if (markdown) {
      setContentLoaded(true);
    }
    
    // Auto-show mark complete after delay when scrolling is enabled
    const timer = setTimeout(() => {
      if (isReading && !isCompleted) {
        setIsCompleteButtonVisible(true);
      }
    }, readingTime * 15000); // Show after 15s per minute of reading time
    
    return () => clearTimeout(timer);
  }, [markdown, isReading, isCompleted, readingTime]);
  
  // Start reading handler
  const handleStartReading = () => {
    setIsReading(true);
    // After a short delay, show the completion button
    setTimeout(() => {
      setIsCompleteButtonVisible(true);
    }, 5000);
  };
  
  // Complete handler with optional delay
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  // Render loading state
  if (!contentLoaded && !isPlaceholder) {
    return (
      <Card className="w-full bg-dark-300 p-6 animate-pulse">
        <div className="h-8 w-2/3 bg-dark-200 rounded mb-4"></div>
        <div className="h-4 w-full bg-dark-200 rounded mb-2"></div>
        <div className="h-4 w-5/6 bg-dark-200 rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-6 w-1/3 bg-dark-200 rounded"></div>
              <div className="h-20 w-full bg-dark-200 rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }
  
  // Render placeholder for empty content
  if (isPlaceholder) {
    return (
      <Card className="w-full bg-dark-300 p-6">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Loader2 className="h-10 w-10 text-kibi-500 animate-spin mb-4" />
          <h3 className="text-xl font-bold mb-2">Generating Article Content</h3>
          <p className="text-gray-300 mb-4 max-w-md">
            We're creating comprehensive content for this module. 
            This may take a few moments.
          </p>
          {isCompleted ? (
            <div className="flex items-center text-green-400 mt-2">
              <Check className="h-5 w-5 mr-2" />
              <span>Already completed</span>
            </div>
          ) : (
            <Button onClick={handleComplete}>
              Mark as Complete
            </Button>
          )}
        </div>
      </Card>
    );
  }
  
  // Render article intro screen
  if (!isReading) {
    return (
      <Card className="w-full bg-dark-300 p-6">
        <div className="flex flex-col items-center p-8 space-y-6 text-center">
          <div className="w-16 h-16 bg-kibi-500/10 rounded-full flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-kibi-500" />
          </div>
          
          <h2 className="text-2xl font-bold">{title}</h2>
          
          <p className="text-gray-300 max-w-2xl">
            {overview}
          </p>
          
          <div className="flex items-center text-gray-400 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            <span>{readingTime} min read</span>
            <span className="mx-2">•</span>
            <span>{wordCount} words</span>
            <span className="mx-2">•</span>
            <span>{effectiveSections.length} sections</span>
          </div>
          
          {articleOutline && articleOutline.length > 0 && (
            <div className="w-full max-w-md bg-dark-400/50 rounded-lg p-4 mt-2">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Article Outline:</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                {articleOutline.slice(0, 5).map((item: any, idx: number) => (
                  <li key={idx} className="flex">
                    <ChevronRight className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
                    <span>{item.heading}</span>
                  </li>
                ))}
                {articleOutline.length > 5 && (
                  <li className="text-kibi-400">+ {articleOutline.length - 5} more sections</li>
                )}
              </ul>
            </div>
          )}
          
          <div className="flex space-x-4 mt-6">
            {isCompleted ? (
              <div className="flex items-center text-green-400">
                <Check className="h-5 w-5 mr-2" />
                <span>Already completed</span>
              </div>
            ) : (
              <Button
                onClick={handleStartReading}
                size="lg"
                className="bg-kibi-600 hover:bg-kibi-700 text-white"
              >
                Start Reading
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }
  
  // Render full article
  return (
    <Card className="w-full bg-dark-300">
      <div className="p-4 border-b border-dark-200 flex justify-between items-center">
        <h2 className="font-bold text-xl">{title}</h2>
        <div className="flex items-center text-gray-400 text-sm">
          <Clock className="h-4 w-4 mr-1" />
          <span>{readingTime} min read</span>
        </div>
      </div>
      
      <ScrollArea className="article-scroll-area h-[calc(100vh-300px)] p-4">
        {hasStructuredSections || hasOutline ? (
          // Render with section components
          <div className="prose prose-invert prose-lg max-w-none">
            {/* Introduction */}
            {overview && (
              <div className="bg-kibi-500/10 border border-kibi-500/20 rounded-lg p-4 mb-8">
                <p className="text-lg font-medium text-kibi-100">{overview}</p>
              </div>
            )}
            
            {/* Article content by sections */}
            {effectiveSections.map((section: any, idx: number) => {
              // For outline-based content, extract section content from markdown
              let sectionContent = section.content;
              if (!sectionContent && markdown) {
                // Simple content extraction for outline-based articles
                const headingRegex = new RegExp(`##\\s+${section.heading}([^#]+)`, 'i');
                const match = markdown.match(headingRegex);
                if (match && match[1]) {
                  sectionContent = match[1].trim();
                }
              }
              
              return (
                <ArticleSectionRenderer 
                  key={idx}
                  section={{
                    title: section.heading,
                    content: sectionContent
                  }}
                />
              );
            })}
          </div>
        ) : (
          // Legacy render with just markdown
          <div className="prose prose-invert prose-lg max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        )}
        
        {/* Complete button */}
        {!isCompleted && (
          <div className={`flex justify-center my-12 ${markAsCompleteVisible || isCompleteButtonVisible ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
            <Button 
              onClick={handleComplete}
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="mr-2 h-5 w-5" />
              Mark as Complete
            </Button>
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};

export default ArticleModuleComponent;
