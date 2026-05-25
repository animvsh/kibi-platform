"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  FileText,
  HelpCircle,
  Layers,
  Lock,
  CheckCircle2,
  Circle,
  ChevronRight,
} from "lucide-react";
import type { CourseUnit, CourseModule } from "@/types";

interface CoursePathMapProps {
  courseId: string;
  units: CourseUnit[];
  modules?: CourseModule[];
  currentUnitId?: string;
  currentLessonId?: string;
  userProgress?: {
    overallProgress: number;
    completedUnitIds?: string[];
    completedModuleIds?: string[];
  };
}

const MODULE_TYPE_ICONS: Record<string, React.ElementType> = {
  article: FileText,
  video: BookOpen,
  quiz: HelpCircle,
  flashcard: Layers,
  practice: Circle,
  project: CheckCircle2,
  case_study: FileText,
  mastery_check: CheckCircle2,
  final_assessment: HelpCircle,
};

export function CoursePathMap({
  courseId,
  units,
  currentUnitId,
  currentLessonId,
  userProgress,
}: CoursePathMapProps) {
  const router = useRouter();

  const getUnitStatus = (unit: CourseUnit): "completed" | "available" | "locked" => {
    if (userProgress?.completedUnitIds?.includes(unit.id)) {
      return "completed";
    }
    if (unit.status === "locked") {
      return "locked";
    }
    return "available";
  };

  const handleUnitClick = (unit: CourseUnit) => {
    const status = getUnitStatus(unit);
    if (status !== "locked") {
      router.push(`/courses/${courseId}/unit/${unit.id}`);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Course Path</h3>

      {/* Progress Overview */}
      {userProgress && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{userProgress.overallProgress}%</span>
          </div>
          <Progress value={userProgress.overallProgress} className="h-2" />
        </div>
      )}

      {/* Units Path */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

        {/* Units */}
        <div className="space-y-4">
          {units.map((unit, index) => {
            const status = getUnitStatus(unit);
            const isActive = unit.id === currentUnitId;
            const isCompleted = status === "completed";
            const isLocked = status === "locked";

            return (
              <div key={unit.id} className="relative">
                {/* Unit Node */}
                <button
                  onClick={() => handleUnitClick(unit)}
                  disabled={isLocked}
                  className={`relative flex items-start gap-4 w-full text-left p-4 rounded-lg border transition-all ${
                    isLocked
                      ? "bg-muted/50 opacity-60 cursor-not-allowed"
                      : isActive
                      ? "bg-primary/5 border-primary/20 shadow-sm"
                      : "bg-card hover:bg-muted/50 border-border hover:border-primary/30"
                  }`}
                >
                  {/* Status Icon */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? "bg-green-100 text-green-600"
                        : isLocked
                        ? "bg-muted text-muted-foreground"
                        : isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : isLocked ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      <span className="text-lg font-bold">{index + 1}</span>
                    )}
                  </div>

                  {/* Unit Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{unit.title}</h4>
                      {isCompleted && (
                        <Badge variant="secondary" className="text-green-600 bg-green-50">
                          Complete
                        </Badge>
                      )}
                      {isActive && (
                        <Badge variant="default">Current</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {unit.description}
                    </p>

                    {/* Progress indicator */}
                    {!isLocked && userProgress?.completedUnitIds && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{
                              width: userProgress.completedUnitIds.includes(unit.id)
                                ? "100%"
                                : "0%",
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {userProgress.completedUnitIds.includes(unit.id) ? "Done" : "Start"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  {!isLocked && (
                    <ChevronRight className="flex-shrink-0 w-5 h-5 text-muted-foreground mt-3" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Module list component for unit detail view
 */
interface ModuleListProps {
  courseId: string;
  unitId: string;
  modules: CourseModule[];
  completedModuleIds?: string[];
  onModuleClick?: (module: CourseModule) => void;
}

export function ModuleList({
  courseId,
  unitId,
  modules,
  completedModuleIds = [],
  onModuleClick,
}: ModuleListProps) {
  const getModuleIcon = (moduleType: string) => {
    return MODULE_TYPE_ICONS[moduleType] || Circle;
  };

  const getModuleRoute = (module: CourseModule): string => {
    switch (module.moduleType) {
      case "quiz":
        return `/courses/${courseId}/quiz/${module.id}`;
      case "article":
      case "video":
      case "practice":
        return `/courses/${courseId}/lesson/${module.id}`;
      default:
        return `/courses/${courseId}/lesson/${module.id}`;
    }
  };

  return (
    <div className="space-y-2">
      {modules.map((module, index) => {
        const isCompleted = completedModuleIds.includes(module.id);
        const Icon = getModuleIcon(module.moduleType);

        const content = (
          <div
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              isCompleted
                ? "bg-green-50/50 border-green-100"
                : "bg-card hover:bg-muted/50 border-border hover:border-primary/30"
            }`}
          >
            {/* Module Icon */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                isCompleted
                  ? "bg-green-100 text-green-600"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>

            {/* Module Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {index + 1}.
                </span>
                <h5 className="font-medium truncate">{module.title}</h5>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs capitalize">
                  {module.moduleType.replace("_", " ")}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {module.estimatedMinutes} min
                </span>
              </div>
            </div>

            {/* Status */}
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground/30" />
            )}
          </div>
        );

        if (onModuleClick) {
          return (
            <button
              key={module.id}
              onClick={() => onModuleClick(module)}
              className="w-full text-left"
            >
              {content}
            </button>
          );
        }

        return (
          <Link key={module.id} href={getModuleRoute(module)}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}
