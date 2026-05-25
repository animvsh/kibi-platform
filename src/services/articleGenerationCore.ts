
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ArticleGenerationParams, ArticleContent, ArticleOutlineItem } from './articleTypes';

// Track active generation requests to allow cancellation
const activeGenerationRequests = new Map();

export const generateArticleContent = async (
  params: ArticleGenerationParams
): Promise<ArticleContent | null> => {
  try {
    console.log("Generating article content with params:", params);

    const requestId = `article-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Enhance the learning objective to ensure we get comprehensive content
    const enhancedParams = {
      ...params,
      learning_objective: params.learning_objective || 
        `Create a comprehensive, extremely detailed article (4000-5000 words) on "${params.subunit_title}" with 5-7 sections, 
        each with at least 4-6 paragraphs of detailed content. Include multiple code examples where relevant, visual suggestions,
        practical applications, and proper markdown formatting. The article should cover both theoretical foundations
        and real-world implementations with concrete examples. Each section must be substantial with multiple paragraphs.`
    };

    let retries = 0;
    const maxRetries = 3;
    let data: any, error: any;

    while (retries <= maxRetries) {
      try {
        const controller = new AbortController();
        activeGenerationRequests.set(requestId, controller);

        // Show generation started toast
        if (retries === 0) {
          toast.info(`Generating comprehensive article for "${params.subunit_title}"...`, {
            duration: 3000
          });
        } else if (retries > 0) {
          toast.info(`Retrying article generation with enhanced detail (attempt ${retries+1}/${maxRetries+1})...`, {
            duration: 3000
          });
        }

        const response = await supabase.functions.invoke('generate-article-content', {
          body: {
            ...enhancedParams,
            subunit_id: enhancedParams.subunit_id || null
          },
        });

        activeGenerationRequests.delete(requestId);

        if (controller.signal.aborted) {
          console.log('Request was aborted during API call');
          return null;
        }

        data = response.data;
        error = response.error;

        // Accept both legacy and preferred content shape
        if (!error && data && ((data.content && data.content.markdown) || data.markdown)) {
          console.log("Got valid article content response:", data);
          
          // Advanced validation - check if the content is substantial and properly formatted
          const markdown = data.content?.markdown || data.markdown || '';
          const wordCount = markdown.split(/\s+/).length;
          const paragraphCount = (markdown.match(/\n\n/g) || []).length + 1;
          const headingCount = (markdown.match(/\n##\s/g) || []).length;
          const codeBlockCount = (markdown.match(/```/g) || []).length / 2;
          
          console.log(`Article quality metrics:
            - ${wordCount} words
            - ${paragraphCount} paragraphs
            - ${headingCount} main sections
            - ${codeBlockCount} code blocks`);
          
          // More demanding quality requirements
          if ((wordCount < 3000 || headingCount < 5 || paragraphCount < headingCount * 4) && retries < maxRetries) {
            console.warn("Article content appears insufficient, retrying with more explicit instructions...");
            
            // Enhance params for retry to emphasize length and detail
            enhancedParams.learning_objective = `Create an EXTREMELY DETAILED educational article (absolute minimum 4000 words) on "${params.subunit_title}" 
              with 5-7 sections. CRITICAL: EACH SECTION MUST HAVE AT LEAST 4-6 FULL PARAGRAPHS. This is non-negotiable.
              Include multiple examples, code samples, and thorough explanations with both theoretical and practical coverage.`;
            
            await new Promise(r => setTimeout(r, 2000));
            retries++;
            continue;
          }
          
          // Article passed quality checks
          break;
        }

        if (error) {
          console.warn("Error generating article content:", error);
        } else if (!data) {
          console.warn("No data returned from article generation");
          error = { message: "No content returned from API" };
        } else if (!data.content?.markdown && !data.markdown) {
          console.warn("Article has no markdown content");
          error = { message: "Generated content has no markdown" };
        }

        retries++;
        if (retries <= maxRetries) {
          console.log(`Retry ${retries}/${maxRetries} for article generation`);
          await new Promise(r => setTimeout(r, 2000));
        }
      } catch (e: any) {
        if (e.name === 'AbortError') {
          console.log('Article generation was cancelled');
          return null;
        }
        console.error('Error in generation attempt:', e);
        retries++;
        if (retries <= maxRetries) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    }

    if (error) {
      console.error('Error generating article content after retries:', error);
      toast.error(`Failed to generate article: ${error.message}`);
      
      // Return a more robust fallback structure
      return {
        title: `Comprehensive Guide to ${params.subunit_title}`,
        overview: `A detailed educational exploration of ${params.subunit_title} concepts, principles, and applications.`,
        markdown: `# Comprehensive Guide to ${params.subunit_title}

## Introduction

${params.subunit_title} represents a critical area of study within its field, offering valuable insights and applications across numerous contexts. This comprehensive article explores the depths of this subject, providing clear explanations, practical examples, and expert guidance to help you master these concepts.

Understanding ${params.subunit_title} is essential for anyone looking to advance their knowledge or career in this domain. The principles we'll cover form the foundation of many advanced techniques and innovations currently transforming the industry.

This article aims to demystify complex aspects of ${params.subunit_title}, breaking them down into understandable components while still maintaining the depth necessary for thorough comprehension. We'll move from basic principles to advanced implementations, ensuring you gain both theoretical knowledge and practical skills.

The importance of ${params.subunit_title} extends beyond academic interest. Organizations worldwide are implementing these concepts to improve efficiency, solve complex problems, and create innovative solutions. By mastering this subject, you'll be equipped to contribute meaningfully to these advancements.

Throughout this guide, we'll examine various perspectives, methodologies, and applications, giving you a well-rounded education on the subject. Each section builds upon the previous one, creating a comprehensive learning journey that will solidify your expertise in ${params.subunit_title}.

## Core Concepts

The foundation of ${params.subunit_title} rests on several fundamental principles that govern its operation and implementation. These core concepts form the backbone of all advanced applications and techniques in the field, making them essential to master before proceeding to more complex topics.

At its most basic level, ${params.subunit_title} involves understanding the interplay between various components and how they work together to achieve specific outcomes. This interaction is governed by well-established rules that have been refined through decades of research and practical application.

One of the most crucial aspects to understand is the relationship between theory and practice in ${params.subunit_title}. While theoretical models provide the conceptual framework, real-world implementation often requires adapting these models to specific contexts and constraints. This adaptability is what makes ${params.subunit_title} both challenging and rewarding as a field of study.

The evolution of these core concepts has been shaped by significant contributions from various disciplines, creating a rich tapestry of approaches and methodologies. This cross-disciplinary nature enhances the versatility of ${params.subunit_title} and expands its potential applications across different domains.

Understanding the historical context of how these concepts developed provides valuable insights into their current applications. Many principles that seem obvious today emerged from groundbreaking work that challenged conventional thinking at the time, demonstrating the innovative spirit at the heart of ${params.subunit_title}.

Technical proficiency in ${params.subunit_title} requires not just memorization of principles but a deep understanding of why these principles work and how they can be applied in different scenarios. This understanding enables practitioners to move beyond rigid application to creative problem-solving.

## Advanced Techniques

Building upon the fundamental concepts, advanced techniques in ${params.subunit_title} represent the cutting edge of the field, where innovation and expertise converge to solve complex problems. These sophisticated approaches require a solid grasp of the basics but extend far beyond them in terms of complexity and capability.

One of the defining characteristics of advanced ${params.subunit_title} techniques is their adaptability to challenging scenarios that basic approaches cannot adequately address. This flexibility stems from a deeper understanding of the underlying mechanisms and a willingness to combine methods in novel ways to achieve optimal results.

The implementation of these advanced techniques often involves specialized tools and frameworks that have been developed specifically to handle the increased complexity. Mastering these tools represents a significant step forward in your journey to becoming an expert in ${params.subunit_title}.

Case studies of successful implementations demonstrate the transformative potential of these advanced approaches. Organizations that have effectively deployed these techniques have reported significant improvements in efficiency, accuracy, and overall performance, setting new standards for excellence in the field.

The ongoing research in advanced ${params.subunit_title} techniques continues to push the boundaries of what's possible, with new methods emerging regularly that challenge existing paradigms. Staying current with these developments is essential for anyone serious about maintaining expertise in this rapidly evolving domain.

The interdisciplinary nature of modern ${params.subunit_title} becomes particularly evident at this advanced level, where techniques from machine learning, statistical analysis, and domain-specific knowledge often converge to create powerful new approaches. This convergence represents one of the most exciting aspects of working with advanced ${params.subunit_title} methodologies.

## Practical Applications

The true value of ${params.subunit_title} becomes evident when we examine its practical applications across various industries and domains. These real-world implementations demonstrate how theoretical knowledge transforms into tangible benefits, solving pressing problems and creating new opportunities.

In the healthcare sector, ${params.subunit_title} has revolutionized approaches to patient care, diagnosis, and treatment planning. Medical professionals now rely on these techniques to process complex data, identify patterns, and make more informed decisions, ultimately improving patient outcomes and operational efficiency.

Financial institutions have embedded ${params.subunit_title} principles into their core operations, using them for risk assessment, fraud detection, investment analysis, and customer service optimization. The ability to process vast amounts of financial data quickly and accurately has become a competitive advantage in this highly regulated industry.

Manufacturing and supply chain management have been transformed through ${params.subunit_title} applications that optimize production processes, predict maintenance needs, and streamline logistics. The result has been reduced costs, improved quality, and enhanced ability to respond to market changes with agility.

Educational institutions are leveraging ${params.subunit_title} to personalize learning experiences, identify students who need additional support, and develop more effective teaching methodologies. These applications have the potential to address long-standing challenges in education and improve outcomes for diverse student populations.

Government agencies and public service organizations are implementing ${params.subunit_title} solutions to enhance decision-making, resource allocation, and service delivery to citizens. These applications demonstrate how technical expertise can be directed toward solving societal challenges and improving quality of life.

## Best Practices

Years of implementation experience across various contexts have yielded valuable insights into what constitutes best practices in ${params.subunit_title}. These guidelines represent collective wisdom that can help practitioners avoid common pitfalls and maximize the value of their efforts.

Start with a clear problem definition and business case before selecting specific ${params.subunit_title} techniques or tools. This problem-first approach ensures that technological choices are driven by genuine needs rather than trendy solutions looking for applications.

Invest in data quality and governance from the beginning of any ${params.subunit_title} initiative. Establishing robust processes for data collection, validation, storage, and management creates a solid foundation for all subsequent work and significantly improves the likelihood of accurate results.

Adopt an iterative approach to implementation that allows for continuous learning and refinement. Starting with manageable pilot projects, gathering feedback, and making adjustments before scaling up helps mitigate risks and builds organizational confidence in the process.

Prioritize explainability and transparency in ${params.subunit_title} solutions, particularly in contexts where decisions have significant consequences. Being able to understand and articulate how results are generated builds trust with stakeholders and supports responsible use of technology.

Build cross-functional teams that combine technical expertise with domain knowledge and change management skills. This diversity of perspectives helps ensure that ${params.subunit_title} implementations are technically sound, practically relevant, and successfully adopted within organizations.

## Conclusion

Throughout this comprehensive exploration of ${params.subunit_title}, we've covered fundamental principles, advanced techniques, practical applications, common challenges, best practices, and future trends. This knowledge provides a solid foundation for anyone seeking to understand or implement these powerful concepts.

The transformative potential of ${params.subunit_title} cannot be overstated, as it continues to revolutionize processes, enable new capabilities, and solve previously intractable problems across numerous domains. The practical benefits—improved efficiency, enhanced decision-making, and new opportunities for innovation—make this an essential area of expertise in today's technology-driven landscape.

As you continue your journey with ${params.subunit_title}, remember that mastery comes through a combination of theoretical understanding and practical application. The concepts discussed in this article gain meaningful depth when applied to real-world situations, tested against actual constraints, and refined through experience.`,
        article_outline: [
          { heading: "Introduction", description: "Overview of key concepts and importance" },
          { heading: "Core Concepts", description: "Fundamental principles and theoretical foundations" },
          { heading: "Advanced Techniques", description: "Sophisticated methodologies and approaches" },
          { heading: "Practical Applications", description: "Real-world implementations across industries" },
          { heading: "Best Practices", description: "Guidelines for successful implementation" },
          { heading: "Conclusion", description: "Summary and future directions" }
        ],
        metadata: {
          status: "fallback",
          generatedWith: "error-fallback",
          error: error.message
        }
      };
    }

    // Normalize the data structure with enhanced metadata
    const normalizedContent: ArticleContent = {
      title: data.title || data.content?.title || `Comprehensive Guide to ${params.subunit_title}`,
      overview: data.content?.overview || data.overview || `A detailed educational article about ${params.subunit_title}`,
      markdown: data.content?.markdown || data.markdown || "",
      article_outline: data.content?.article_outline || [],
      visual_placeholders: data.content?.visual_placeholders || [],
      metadata: {
        ...(data.metadata || {}),
        wordCount: (data.content?.markdown || data.markdown || "").split(/\s+/).length,
        readingTime: Math.ceil((data.content?.markdown || data.markdown || "").split(/\s+/).length / 200),
        sectionCount: (data.content?.article_outline || []).length,
        headingCount: ((data.content?.markdown || data.markdown || "").match(/\n##\s/g) || []).length,
        codeBlockCount: ((data.content?.markdown || data.markdown || "").match(/```/g) || []).length / 2,
        paragraphsPerSection: Math.round((data.content?.markdown || data.markdown || "").split(/\n\n/).length / 
          (((data.content?.markdown || data.markdown || "").match(/\n##\s/g) || []).length || 1)),
        status: "ready",
        generatedAt: new Date().toISOString()
      }
    };

    // Show success toast with stats
    toast.success(`Article for "${params.subunit_title}" generated successfully! (~${normalizedContent.metadata?.wordCount || 0} words)`, {
      duration: 3000
    });

    console.log("Successfully normalized article content with",
      normalizedContent.article_outline?.length || 0, "sections and",
      normalizedContent.metadata?.wordCount || 0, "words");

    return normalizedContent;
  } catch (error: any) {
    console.error('Failed to generate article content:', error);
    toast.error(`An error occurred while generating the article: ${error.message}`);

    return {
      title: "Comprehensive Article In Progress",
      overview: "A detailed article is being generated. Please check back soon.",
      markdown: `# Comprehensive Guide to ${params.subunit_title}

## Introduction

The article content for **${params.subunit_title}** is currently being generated. 

## What to expect

When complete, this article will provide comprehensive coverage of ${params.subunit_title}, including:

- Detailed explanation of core concepts and principles
- Multiple practical applications with concrete examples
- Code samples and implementation guidelines
- Best practices and common pitfalls to avoid
- Case studies and real-world scenarios

Each section will contain multiple paragraphs of detailed content, ensuring you gain both breadth and depth of understanding on this topic.

Please check back shortly as our system completes the content generation process. If the content doesn't appear automatically, you can try regenerating the module.`,
      metadata: {
        status: "pending",
        generatedWith: "error-fallback",
        error: error.message
      }
    };
  }
};

export const cancelAllArticleGenerations = () => {
  console.log(`Cancelling ${activeGenerationRequests.size} active article generation requests`);
  activeGenerationRequests.forEach((controller) => {
    try {
      controller.abort();
    } catch (e) {
      console.error('Error aborting article generation:', e);
    }
  });
  activeGenerationRequests.clear();
};
