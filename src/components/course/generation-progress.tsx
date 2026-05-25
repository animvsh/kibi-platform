"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Loader2, Sparkles, BookOpen, FileText, HelpCircle, Layers, Brain, GraduationCap } from "lucide-react";
import type {
  GenerationProgress,
  GenerationStatus,
} from "@/types/generation";

// Re-export for convenience
export type { GenerationProgress, GenerationStatus };

interface GenerationProgressProps {
  progress: GenerationProgress | null;
  isActive: boolean;
}

const STATUS_STEPS: Array<{
  status: GenerationStatus;
  label: string;
  icon: React.ElementType;
}> = [
  { status: "understanding", label: "Understanding your goal", icon: Sparkles },
  { status: "analyzing_intent", label: "Finding the core concepts", icon: Brain },
  { status: "building_curriculum", label: "Building your learning path", icon: GraduationCap },
  { status: "creating_units", label: "Creating learning units", icon: Layers },
  { status: "writing_lessons", label: "Writing lessons", icon: BookOpen },
  { status: "generating_quizzes", label: "Generating quizzes", icon: HelpCircle },
  { status: "creating_flashcards", label: "Creating flashcards", icon: FileText },
  { status: "building_mastery", label: "Building mastery checks", icon: CheckCircle },
  { status: "setting_up_tutor", label: "Setting up your AI tutor", icon: Brain },
  { status: "publishing", label: "Publishing your course", icon: GraduationCap },
];

const STATUS_ORDER: GenerationStatus[] = [
  "understanding",
  "analyzing_intent",
  "building_curriculum",
  "creating_units",
  "writing_lessons",
  "generating_quizzes",
  "creating_flashcards",
  "building_mastery",
  "setting_up_tutor",
  "publishing",
  "completed",
];

function getStepIndex(status: GenerationStatus): number {
  const index = STATUS_ORDER.indexOf(status);
  return index === -1 ? 0 : index;
}

function computeCompletedSteps(status: GenerationStatus): Set<GenerationStatus> {
  const currentIndex = getStepIndex(status);
  const completed = new Set<GenerationStatus>();
  for (let i = 0; i < currentIndex; i++) {
    completed.add(STATUS_ORDER[i]);
  }
  return completed;
}

export function GenerationProgressDisplay({
  progress,
  isActive,
}: GenerationProgressProps) {
  // Compute derived state directly from progress - no internal state needed
  const completedSteps = progress ? computeCompletedSteps(progress.status) : new Set<GenerationStatus>();
  const currentStep = progress?.status ?? null;

  if (!isActive || !progress) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {progress.status === "completed" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              )}
              <span className="font-medium">{progress.message}</span>
            </div>
            <Badge variant="secondary">{Math.round(progress.progress)}%</Badge>
          </div>
          <Progress value={progress.progress} className="h-2" />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Generation Progress
          </p>
          <div className="grid gap-2">
            {STATUS_STEPS.map((step, index) => {
              const isCompleted = completedSteps.has(step.status);
              const isCurrent = currentStep === step.status;
              const Icon = step.icon;

              return (
                <div
                  key={step.status}
                  className={`flex items-center gap-3 text-sm transition-opacity ${
                    index > getStepIndex(currentStep || "understanding")
                      ? "opacity-40"
                      : "opacity-100"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? "bg-green-100 text-green-600"
                        : isCurrent
                        ? "bg-blue-100 text-blue-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : isCurrent ? (
                      <Icon className="h-4 w-4 animate-pulse" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={
                      isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
                    }
                  >
                    {step.label}
                    {isCurrent && progress.currentUnitIndex !== undefined && (
                      <span className="text-blue-500 ml-1">
                        (Unit {progress.currentUnitIndex + 1}
                        {progress.totalUnits
                          ? ` of ${progress.totalUnits}`
                          : ""}
                        )
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {progress.error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <strong>Error:</strong> {progress.error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
