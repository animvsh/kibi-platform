
import { Course } from "@/types/course";

export interface ModuleContentDisplayProps {
  courseContent: Course | null;
  isLoading: boolean;
  error: string | null;
}

export interface ModuleNavigationProps {
  courseContent: Course | null;
  activeTab: string;
  setActiveTab: (value: string) => void;
}

export interface ModuleActionsProps {
  onRetry?: () => void;
  onRegenerate: () => void;
  onNavigateBack: () => void;
  onReviewAndSave: () => void;
  inputText: string | null;
  isGenerating?: boolean;
}
