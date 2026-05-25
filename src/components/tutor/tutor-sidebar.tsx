"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  X,
  Send,
  RefreshCw,
  GraduationCap,
  Lightbulb,
  Target,
  BookOpen,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface TutorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestedActions?: { action: string; label: string; icon: string }[];
  metadata?: Record<string, unknown>;
}

interface TutorSidebarProps {
  courseId: string;
  lessonId?: string;
  currentLesson?: {
    title: string;
    progress?: number;
  };
  onClose?: () => void;
  isOpen?: boolean;
}

interface QuickAction {
  action: string;
  label: string;
  icon: string;
  description: string;
}

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  { action: "explain_simpler", label: "Explain Simpler", icon: "📖", description: "Get a simpler explanation" },
  { action: "give_example", label: "Give Me an Example", icon: "💡", description: "See a practical example" },
  { action: "quiz_me", label: "Quiz Me", icon: "❓", description: "Test your knowledge" },
  { action: "create_practice", label: "More Practice", icon: "✏️", description: "Get practice exercises" },
  { action: "make_flashcards", label: "Flashcards", icon: "🗂️", description: "Create study cards" },
  { action: "what_to_study_next", label: "What's Next?", icon: "🎯", description: "Get study recommendations" },
];

export function TutorSidebar({
  courseId,
  lessonId,
  currentLesson,
  onClose,
  isOpen = true,
}: TutorSidebarProps) {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [mastery, setMastery] = useState(62);
  const [progress, setProgress] = useState(45);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load initial context
  useEffect(() => {
    const loadContext = async () => {
      try {
        const response = await fetch(
          `/api/courses/${courseId}/tutor/chat?lessonId=${lessonId || ""}`,
          {
            headers: { "X-User-Id": "demo-user" },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.context) {
            setMastery(data.context.mastery || 0);
            setProgress(data.context.progress || 0);
          }

          // Add welcome message
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content: `Hi! I'm Kibi, your AI tutor. I'm here to help you with "${currentLesson?.title || "this course"}". I can explain concepts, quiz you, or help you practice. What would you like to do?`,
              timestamp: new Date(),
              suggestedActions: DEFAULT_QUICK_ACTIONS.slice(0, 4).map((qa) => ({
                action: qa.action,
                label: qa.label,
                icon: qa.icon,
              })),
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to load tutor context:", error);
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: "Hi! I'm Kibi, your AI tutor. How can I help you learn today?",
            timestamp: new Date(),
          },
        ]);
      }
    };

    if (isOpen) {
      loadContext();
    }
  }, [courseId, lessonId, currentLesson, isOpen]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    // Add user message
    const userMessage: TutorMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      const response = await fetch(`/api/courses/${courseId}/tutor/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": "demo-user",
        },
        body: JSON.stringify({
          message: text,
          currentLessonId: lessonId,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        const assistantMessage: TutorMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          suggestedActions: data.suggestedActions,
          metadata: data.metadata,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Update progress/mastery from context
        if (data.context) {
          if (data.context.mastery) setMastery(data.context.mastery);
          if (data.context.progress) setProgress(data.context.progress);
        }
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage: TutorMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSend(`I'd like to ${action.label.toLowerCase()}`);
  };

  const handleSuggestedAction = (suggestedAction: { action: string; label: string; icon: string }) => {
    handleSend(`${suggestedAction.icon} ${suggestedAction.label}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-primary/5">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          <span className="font-semibold">Kibi Tutor</span>
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Progress Section */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Course Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Mastery</span>
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3 text-primary" />
            <span className="font-medium">{mastery}%</span>
          </div>
        </div>
        <Progress value={mastery} className="h-2" />
      </div>

      {/* Current Lesson Context */}
      {currentLesson && (
        <div className="px-4 py-2 bg-muted/30 border-b">
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground truncate">
              {currentLesson.title}
            </span>
          </div>
        </div>
      )}

      {/* Quick Actions Toggle */}
      <button
        onClick={() => setShowQuickActions(!showQuickActions)}
        className="flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        <span>Quick Actions</span>
        {showQuickActions ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {/* Quick Actions */}
      {showQuickActions && (
        <div className="px-4 pb-2 grid grid-cols-2 gap-2">
          {DEFAULT_QUICK_ACTIONS.slice(0, 4).map((action) => (
            <button
              key={action.action}
              onClick={() => handleQuickAction(action)}
              className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-xs"
            >
              <span className="text-lg">{action.icon}</span>
              <span className="font-medium text-center">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>

              {/* Suggested Actions */}
              {message.role === "assistant" && message.suggestedActions && message.suggestedActions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {message.suggestedActions.map((suggestedAction, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestedAction(suggestedAction)}
                      className="text-xs px-2 py-1 rounded-full bg-background/80 hover:bg-background transition-colors flex items-center gap-1"
                    >
                      <span>{suggestedAction.icon}</span>
                      <span>{suggestedAction.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Metadata Warning */}
              {typeof message.metadata?.conceptStabilityWarning === "boolean" && message.metadata?.conceptStabilityWarning && (
                <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                  <Lightbulb className="w-3 h-3" />
                  <span>Let&apos;s review this concept more</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default TutorSidebar;
