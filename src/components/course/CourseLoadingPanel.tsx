
import React from "react";
import { CheckCircle, Loader2, Lock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface UnitLoadingProps {
  title: string;
  status: 'pending' | 'generating' | 'complete';
  index: number;
  modulesCount: number;
  completedModules: number;
  estimatedTime?: number;
  onClick?: () => void;
}

const CourseLoadingPanel = ({
  title,
  status,
  index,
  modulesCount,
  completedModules,
  estimatedTime,
  onClick,
}: UnitLoadingProps) => {
  const isComplete = status === "complete";
  const isActive = status === "generating";
  const isPending = status === "pending";

  const animationClass = isActive
    ? "animate-fade-in"
    : isComplete
    ? "animate-fade-in"
    : "";

  return (
    <button
      type="button"
      className={cn(
        "group transition-all duration-300 w-full overflow-hidden relative flex items-stretch",
        "rounded-2xl border-4 shadow-strong cartoon-text",
        "text-left select-none",
        isComplete
          ? "border-kibi-600 bg-kibi-500/90 hover:bg-kibi-400/90 cursor-pointer"
          : isActive
          ? "border-primary bg-primary/90 ring-4 ring-kibi-400/60 cursor-wait"
          : "border-purple-800 bg-purple-300/40 opacity-80 cursor-not-allowed"
      )}
      onClick={isComplete ? onClick : undefined}
      style={{
        pointerEvents: isComplete ? 'auto' : 'none',
        minHeight: 92,
        marginBottom: 4,
        boxShadow: isActive ? "0 8px 32px 0 rgba(155,135,245,0.35)" : undefined,
      }}
    >
      <div className={`flex items-center pl-5 pr-2 py-4 gap-3 flex-shrink-0 ${animationClass}`}>
        <div
          className={cn(
            "w-12 h-12 flex items-center justify-center rounded-full border-4 shadow-strong",
            isComplete
              ? "bg-kibi-600 border-kibi-100 text-kibi-100 shadow-green-100"
              : isActive
              ? "bg-primary border-kibi-500 text-kibi-100"
              : "bg-purple-100 border-purple-600 text-purple-700"
          )}
        >
          {isComplete ? (
            <CheckCircle className="w-6 h-6" />
          ) : isActive ? (
            <Loader2 className="w-6 h-6 animate-spin text-kibi-100" />
          ) : (
            <Lock className="w-6 h-6" />
          )}
        </div>
      </div>
      <div className={`flex-1 flex flex-col justify-center pr-4 pl-1 py-3 min-w-0 ${animationClass}`}>
        <div className="flex items-center gap-3 mb-1">
          <Badge
            variant="outline"
            className={cn(
              "rounded-lg font-extrabold tracking-wide border-4 px-3 py-1 text-xs bg-transparent shadow-strong",
              isComplete && "bg-kibi-700/60 text-white border-white",
              isActive && "bg-primary text-white border-white",
              isPending && "bg-purple-200 border-purple-500 text-purple-700"
            )}
          >
            UNIT {index + 1}
          </Badge>
          {estimatedTime && (
            <span className="text-xs text-kibi-900 font-semibold bg-kibi-200 rounded px-2 py-0.5 cartoon-text">{`~${estimatedTime} min`}</span>
          )}
        </div>
        <h3
          className={cn(
            "font-black text-lg leading-tight truncate uppercase cartoon-text tracking-tighter",
            isComplete
              ? "text-white drop-shadow-[2px_2px_0_rgba(16,185,129,0.15)]"
              : isActive
              ? "text-kibi-900 drop-shadow-[2px_2px_0_rgba(155,135,245,0.10)]"
              : "text-purple-800"
          )}
        >
          {title}
        </h3>
        <div className="mt-2">
          {isComplete ? (
            <div className="flex items-center gap-2 text-kibi-900 text-xs font-bold cartoon-text">
              <CheckCircle className="w-4 h-4" />
              <span>READY TO START</span>
            </div>
          ) : isActive ? (
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-primary mb-1">
                <span>GENERATING <span className="font-black">{completedModules}</span> / {modulesCount}</span>
              </div>
              <Progress
                value={(completedModules / Math.max(1, modulesCount)) * 100}
                className="h-3 bg-kibi-200 border-4 border-kibi-500 shadow-inner transition-all duration-300"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-purple-700 text-xs font-semibold">
              <ChevronRight className="w-4 h-4" />
              <span className="cartoon-text">WAITING FOR PREVIOUS UNITS</span>
            </div>
          )}
        </div>
      </div>
      {isComplete && (
        <div className="h-full flex items-center bg-kibi-100 px-4 ml-2 rounded-r-xl shadow-strong">
          <ChevronRight className="w-6 h-6 text-kibi-600" />
        </div>
      )}
    </button>
  );
};

export default CourseLoadingPanel;
