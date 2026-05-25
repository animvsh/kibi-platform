
import { toast } from 'sonner';
import { generateArticleContent } from './articleGenerationCore';
import { saveArticleModule } from './articleModulePersistence';
import type { ArticleGenerationParams } from './articleTypes';

export const generateArticlesForCourse = async (
  courseId: string,
  courseTitle: string,
  subunits: Array<{subunit_id: string, subunit_title: string, learning_goal?: string}>
): Promise<string[]> => {
  if (!subunits || subunits.length === 0) {
    toast.error("No subunits provided for article generation");
    return [];
  }

  console.log(`Starting article generation for ${subunits.length} subunits in course: ${courseTitle}`);

  const generatedModuleIds: string[] = [];
  let completedCount = 0;
  let failedCount = 0;

  const validSubunits = subunits.filter(subunit => {
    if (!subunit.subunit_id) {
      console.error('Missing subunit_id for:', subunit);
      failedCount++;
      return false;
    }
    return true;
  });

  for (const subunit of validSubunits) {
    try {
      console.log(`Generating article for subunit: ${subunit.subunit_title} (ID: ${subunit.subunit_id})`);

      const params: ArticleGenerationParams = {
        subunit_title: subunit.subunit_title,
        learning_objective: subunit.learning_goal || `Understanding key concepts about ${subunit.subunit_title}`,
        subunit_id: subunit.subunit_id
      };

      const articleContent = await generateArticleContent(params);

      if (articleContent) {
        const moduleId = await saveArticleModule(
          subunit.subunit_id,
          subunit.subunit_title,
          articleContent,
          0
        );

        if (moduleId) {
          generatedModuleIds.push(moduleId);
          completedCount++;

          if (completedCount % 5 === 0 || completedCount === validSubunits.length) {
            toast.success(`Generated ${completedCount}/${validSubunits.length} articles`);
          }
        } else {
          failedCount++;
          console.error(`Failed to save module for ${subunit.subunit_title}`);
        }
      } else {
        console.error(`Failed to generate content for ${subunit.subunit_title}`);
        failedCount++;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error generating article for subunit ${subunit.subunit_title}:`, error);
      toast.error(`Failed to generate article for ${subunit.subunit_title}`);
      failedCount++;
    }
  }

  console.log(`Completed article generation: ${completedCount}/${subunits.length} successful, ${failedCount} failed`);

  if (failedCount > 0) {
    toast.error(`${failedCount} articles failed to generate properly`);
  }

  return generatedModuleIds;
};
