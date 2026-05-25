
import { 
  CourseModule,
  ArticleModule,
  LectureModule,
  InteractiveLectureModule,
  CodeModule,
  SimulationModule,
  QuizModule,
  FlashcardModule,
  ReviewSummaryModule,
  InteractiveArticleModule
} from '@/types/course';

export const isArticleModule = (module: CourseModule): module is ArticleModule => 
  module.type === 'article';

export const isLectureModule = (module: CourseModule): module is LectureModule => 
  module.type === 'lecture';

export const isInteractiveLectureModule = (module: CourseModule): module is InteractiveLectureModule => 
  module.type === 'lecture_interactive';

export const isCodeModule = (module: CourseModule): module is CodeModule => 
  module.type === 'code';

export const isSimulationModule = (module: CourseModule): module is SimulationModule => 
  module.type === 'simulation';

export const isQuizModule = (module: CourseModule): module is QuizModule => 
  module.type === 'quiz';

export const isFlashcardModule = (module: CourseModule): module is FlashcardModule => 
  module.type === 'flashcard';

export const isReviewModule = (module: CourseModule): module is ReviewSummaryModule => 
  module.type === 'review';

export const isInteractiveArticleModule = (module: CourseModule): module is InteractiveArticleModule => 
  module.type === 'article_interactive';

export const isExtendedCourseModule = (module: CourseModule) => 
  'id' in module;
