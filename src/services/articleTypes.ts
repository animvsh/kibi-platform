
export interface ArticleGenerationParams {
  subunit_title: string;
  learning_objective: string;
  subunit_id?: string;
  outline?: any;
}

export interface ArticleSection {
  heading: string;
  content: string;
}

export interface ArticleOutlineItem {
  heading: string;
  description: string;
}

export interface ArticleOutline {
  overview: string;
  article_outline: ArticleOutlineItem[];
  sections?: ArticleSection[];
}

export interface ArticleContent {
  title?: string;
  overview?: string;
  markdown?: string;
  sections?: ArticleSection[];
  article_outline?: ArticleOutlineItem[];
  visual_placeholders?: Array<{
    section_title: string;
    type: string;
    visual_description: string;
  }>;
  metadata?: {
    wordCount?: number;
    readingTime?: number;
    sectionCount?: number;
    generatedWith?: string;
    status?: string;
    saved_at?: string;
    subunit_id?: string;
    [key: string]: any;
  };
}
