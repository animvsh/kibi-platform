
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { generateArticleContent, saveArticleModule, ArticleGenerationParams } from '@/services/articleGeneration';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ArticleModuleGeneratorProps {
  subunitId: string;
  onComplete: (moduleId: string) => void;
  subunitTitle?: string;
}

const ArticleModuleGenerator: React.FC<ArticleModuleGeneratorProps> = ({ 
  subunitId, 
  onComplete,
  subunitTitle = ''
}) => {
  const [title, setTitle] = useState(subunitTitle);
  const [objective, setObjective] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [articleOutline, setArticleOutline] = useState<any>(null);
  
  const handleGenerate = async () => {
    if (!title.trim() || !objective.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Step 1: Generate the article content using the learning goal
      const params: ArticleGenerationParams = {
        subunit_title: title,
        learning_objective: objective
      };
      
      console.log("Generating article with params:", params);
      const content = await generateArticleContent(params);
      
      if (content) {
        // Step 2: Create the article outline from the generated content
        const outline = {
          overview: content.overview || generateOverview(title, objective),
          sections: content.sections?.map((section: any) => ({
            title: section.heading,
            description: section.content?.split('\n')[0] || 'A section covering key concepts'
          })) || []
        };
        
        setArticleOutline(outline);
        setGeneratedContent({
          ...content,
          metadata: {
            article_outline: outline
          }
        });
        toast.success('Article content generated successfully!');
      } else {
        setError('Failed to generate article content. Please try again.');
        toast.error('Failed to generate article content');
      }
    } catch (error: any) {
      console.error('Error generating article:', error);
      setError(error.message || 'Unknown error occurred');
      toast.error('Error generating article');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateOverview = (title: string, objective: string): string => {
    return `This article covers ${title}, helping learners ${objective.toLowerCase()}.`;
  };
  
  const handleSave = async () => {
    if (!generatedContent) return;
    
    // Validate that we have a valid subunit ID
    if (!subunitId) {
      toast.error('Cannot save article: Missing subunit ID');
      console.error('Missing subunit ID when trying to save article');
      return;
    }
    
    setIsSaving(true);
    try {
      console.log("Saving article with content:", generatedContent);
      
      // Add metadata about the article generation process
      const enhancedContent = {
        ...generatedContent,
        metadata: {
          ...generatedContent.metadata,
          subunit_id: subunitId,
          subunit_title: title,
          learning_goal: objective,
          status: 'generating', // Initial status as specified
          generated_at: new Date().toISOString(),
        }
      };
      
      const moduleId = await saveArticleModule(subunitId, title, enhancedContent, 0);
      
      if (moduleId) {
        toast.success('Article module saved successfully!');
        onComplete(moduleId);
      } else {
        toast.error('Failed to save article module');
      }
    } catch (error: any) {
      console.error('Error saving article:', error);
      toast.error('Error saving article module');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Card className="border-dark-200 bg-dark-400">
      <CardHeader>
        <CardTitle>Generate Interactive Article</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Introduction to React Hooks"
            className="bg-dark-300"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Learning Objective</label>
          <Textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Students will understand how to use useState and useEffect hooks to manage component state and side effects."
            className="bg-dark-300 min-h-[100px]"
          />
        </div>
        
        {error && (
          <div className="bg-red-900/20 border border-red-700/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle size={18} />
              <p className="font-medium">Error</p>
            </div>
            <p className="mt-1 text-sm text-red-300">{error}</p>
          </div>
        )}
        
        {articleOutline && (
          <div className="bg-dark-300 p-4 rounded-lg border border-dark-200">
            <h3 className="font-medium mb-2">Article Outline:</h3>
            <p className="text-sm text-gray-300 italic mb-3">{articleOutline.overview}</p>
            
            <h4 className="text-sm font-medium text-gray-200 mt-3 mb-2">Sections:</h4>
            <ul className="list-disc list-inside text-sm text-gray-400 space-y-2">
              {articleOutline.sections.map((section: any, idx: number) => (
                <li key={idx} className="pl-2">
                  <span className="font-medium text-gray-300">{section.title}</span>
                  <p className="pl-5 text-xs text-gray-400">{section.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {generatedContent && !articleOutline && (
          <div className="bg-dark-300 p-4 rounded-lg border border-dark-200">
            <h3 className="font-medium mb-2">Preview:</h3>
            <p className="text-sm text-gray-400">Article with {generatedContent.sections?.length || 0} sections generated.</p>
            {generatedContent.sections && (
              <ul className="list-disc list-inside text-sm text-gray-400 mt-2">
                {generatedContent.sections.map((section: any, idx: number) => (
                  <li key={idx}>{section.heading || section.title}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          onClick={handleGenerate} 
          disabled={isGenerating || !title.trim() || !objective.trim()}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            'Generate Content'
          )}
        </Button>
        
        <Button 
          onClick={handleSave} 
          disabled={!generatedContent || isSaving}
          className="bg-kibi-500 hover:bg-kibi-600"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            'Save Module'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ArticleModuleGenerator;
