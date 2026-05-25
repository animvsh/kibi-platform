
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ArticleContent } from './articleTypes';

export const saveArticleModule = async (
  subunitId: string,
  title: string,
  content: ArticleContent,
  order: number
): Promise<string | null> => {
  try {
    console.log("Saving article module:", { subunitId, title, content });

    if (!subunitId) {
      console.error("Cannot save article: subunitId is null or empty");
      toast.error("Cannot save article: invalid subunit ID");
      return null;
    }

    const finalContent = {
      ...content,
      title: content.title || title || `Article about ${subunitId}`,
      overview: content.overview || `An overview of ${title || subunitId}`,
      markdown: content.markdown || `# ${title || 'Article'}\n\nContent is being generated...`,
      article_outline: content.article_outline || [
        { heading: "Introduction", description: "Overview of topic" }
      ]
    };

    const contentForDb = JSON.parse(JSON.stringify(finalContent));

    const enhancedContent = {
      ...contentForDb,
      metadata: {
        ...(contentForDb.metadata || {}),
        saved_at: new Date().toISOString(),
        status: contentForDb.metadata?.status || 'ready',
        subunit_id: subunitId
      }
    };

    const { data, error } = await supabase
      .from('modules')
      .insert({
        subunit_id: subunitId,
        title: title || `Article: ${content.title || 'Interactive Content'}`,
        type: 'article',
        content_json: enhancedContent,
        order: order
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving article module:', error);
      toast.error(`Failed to save article: ${error.message}`);
      return null;
    }

    console.log("Article module saved successfully:", data);
    toast.success('Article module saved successfully!');
    return data.id;
  } catch (error: any) {
    console.error('Failed to save article module:', error);
    toast.error(`Error saving article: ${error.message || 'Unknown error'}`);
    return null;
  }
};
